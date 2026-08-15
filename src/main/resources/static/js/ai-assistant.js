const AI_API = '/api/ai/ask';
const CHAT_HISTORY_KEY = 'aiChatHistory';

document.addEventListener('DOMContentLoaded', () => {
    initSidebarToggle();
    initLogout();
    initUserMenu();
    initChat();
    initVoice();
    loadChatHistory();
});

/* ---------------------------------------------------------------------
   PAGE SHELL — same behavior as dashboard.js, duplicated here since this
   page loads its own script rather than sharing dashboard.js directly.
   --------------------------------------------------------------------- */
function initSidebarToggle() {
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if (!toggleBtn || !sidebar) return;

    // Backdrop for the mobile slide-in drawer (below 560px) — dims the
    // page and closes the drawer when tapped outside it.
    const backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);

    const isMobile = () => window.innerWidth <= 560;

    function closeMobileDrawer() {
        sidebar.classList.remove('mobile-open');
        backdrop.classList.remove('visible');
    }

    toggleBtn.addEventListener('click', () => {
        if (isMobile()) {
            sidebar.classList.toggle('mobile-open');
            backdrop.classList.toggle('visible');
        } else {
            sidebar.classList.toggle('collapsed');
            sidebar.querySelector('.sidebar-title')?.classList.toggle('is-hidden');
            sidebar.querySelectorAll('.nav-text').forEach((el) => el.classList.toggle('is-hidden'));
        }
    });

    backdrop.addEventListener('click', closeMobileDrawer);

    // Close the drawer automatically once a nav link is tapped, so users
    // don't have to dismiss it manually after navigating on mobile.
    sidebar.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            if (isMobile()) closeMobileDrawer();
        });
    });
}

function initLogout() {
    const logoutBtns = [document.getElementById('logoutBtn'), document.getElementById('topbarLogoutBtn')]
        .filter(Boolean);
    if (logoutBtns.length === 0) return;

    function doLogout() {
        sessionStorage.clear();
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/';
    }

    logoutBtns.forEach((btn) => btn.addEventListener('click', doLogout));
}

/* ---------------------------------------------------------------------
   TOPBAR USER MENU — click the avatar/name to reveal the Logout dropdown.
   Closes automatically when clicking anywhere outside it.
   --------------------------------------------------------------------- */
function initUserMenu() {
    const trigger = document.getElementById('userMenuTrigger');
    const dropdown = document.getElementById('userMenuDropdown');
    if (!trigger || !dropdown) return;

    trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = dropdown.classList.toggle('open');
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (event) => {
        if (!dropdown.contains(event.target) && !trigger.contains(event.target)) {
            dropdown.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
        }
    });
}

/* ---------------------------------------------------------------------
   CHAT
   --------------------------------------------------------------------- */
function initChat() {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('questionInput');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const question = input.value.trim();
        if (!question) return;

        addMessage('user', question);
        input.value = '';
        input.focus();

        const loadingBubble = addLoadingMessage();
        setSending(true);

        try {
            const res = await fetch(AI_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question }),
            });

            const answer = await res.text();
            loadingBubble.remove();

            if (answer.startsWith('Error:')) {
                addMessage('error', answer);
            } else {
                addMessage('ai', answer);
                speakText(answer);
            }
        } catch (err) {
            console.error('Failed to reach AI Assistant:', err);
            loadingBubble.remove();
            addMessage('error', 'Error: Could not reach the server. Please check your connection and try again.');
        } finally {
            setSending(false);
        }
    });
}

function setSending(isSending) {
    document.getElementById('sendBtn').disabled = isSending;
    document.getElementById('questionInput').disabled = isSending;
}

function addMessage(type, text, skipSave = false) {
    const chatWindow = document.getElementById('chatWindow');

    const wrapper = document.createElement('div');
    wrapper.className = `chat-message ${type}`;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    chatWindow.appendChild(wrapper);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    if (!skipSave) {
        saveMessageToHistory(type, text);
    }

    return wrapper;
}

function saveMessageToHistory(type, text) {
    const history = readChatHistory();
    history.push({ type, text });
    sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
}

function readChatHistory() {
    try {
        const raw = sessionStorage.getItem(CHAT_HISTORY_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        return [];
    }
}

function loadChatHistory() {
    const history = readChatHistory();
    if (history.length === 0) return;

    // Remove the default greeting bubble already in the HTML, since we're
    // about to restore the real conversation instead.
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.innerHTML = '';

    history.forEach((msg) => {
        addMessage(msg.type, msg.text, true);
    });
}

function addLoadingMessage() {
    const chatWindow = document.getElementById('chatWindow');

    const wrapper = document.createElement('div');
    wrapper.className = 'chat-message ai';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble loading';
    bubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';

    wrapper.appendChild(bubble);
    chatWindow.appendChild(wrapper);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    return wrapper;
}

/* ---------------------------------------------------------------------
   VOICE — mic input (speech-to-text) and spoken replies (text-to-speech)
   Both use the browser's built-in Web Speech API. No new dependency, no
   backend change. Buttons hide themselves if the browser doesn't support
   the relevant feature (mainly affects Firefox/Safari for mic input).
   --------------------------------------------------------------------- */
const SPEAK_PREF_KEY = 'aiVoiceRepliesEnabled';

function initVoice() {
    initMicInput();
    initSpeakerToggle();
}

/* ---- Mic input (speech-to-text) ---- */
function initMicInput() {
    const micBtn = document.getElementById('micBtn');
    if (!micBtn) return;

    const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionApi) {
        micBtn.style.display = 'none';
        return;
    }

    const recognition = new SpeechRecognitionApi();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let listening = false;

    micBtn.addEventListener('click', () => {
        if (listening) {
            recognition.stop();
            return;
        }
        recognition.start();
    });

    recognition.addEventListener('start', () => {
        listening = true;
        micBtn.classList.add('listening');
    });

    recognition.addEventListener('end', () => {
        listening = false;
        micBtn.classList.remove('listening');
    });

    recognition.addEventListener('result', (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('questionInput');
        input.value = transcript;

        // Submit automatically once speech is transcribed, so the flow is
        // fully hands-free: speak the question, get a spoken answer back.
        document.getElementById('chatForm').requestSubmit();
    });

    recognition.addEventListener('error', (event) => {
        console.error('Speech recognition error:', event.error);
        listening = false;
        micBtn.classList.remove('listening');
    });
}

/* ---- Spoken replies (text-to-speech) ---- */
function initSpeakerToggle() {
    const toggleBtn = document.getElementById('speakToggleBtn');
    if (!toggleBtn) return;

    if (!('speechSynthesis' in window)) {
        toggleBtn.style.display = 'none';
        return;
    }

    updateSpeakerButton();

    toggleBtn.addEventListener('click', () => {
        const isEnabled = localStorage.getItem(SPEAK_PREF_KEY) !== 'false';
        localStorage.setItem(SPEAK_PREF_KEY, isEnabled ? 'false' : 'true');

        if (isEnabled) {
            window.speechSynthesis.cancel();
        }

        updateSpeakerButton();
    });
}

function updateSpeakerButton() {
    const toggleBtn = document.getElementById('speakToggleBtn');
    const isEnabled = localStorage.getItem(SPEAK_PREF_KEY) !== 'false';

    toggleBtn.textContent = isEnabled ? '🔊' : '🔇';
    toggleBtn.classList.toggle('muted', !isEnabled);
}

function speakText(text) {
    if (!('speechSynthesis' in window)) return;

    const isEnabled = localStorage.getItem(SPEAK_PREF_KEY) !== 'false';
    if (!isEnabled) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
}