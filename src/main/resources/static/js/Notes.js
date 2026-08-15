const NOTES_API = '/api/notes';

let notes = [];

document.addEventListener('DOMContentLoaded', () => {
    initSidebarToggle();
    initLogout();
    initUserMenu();
    initNotes();
});

/* ---------------------------------------------------------------------
   PAGE SHELL —
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
   TOPBAR USER MENU
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
   NOTES
   --------------------------------------------------------------------- */
function initNotes() {
    const addBtn = document.getElementById('addNoteBtn');
    const modalOverlay = document.getElementById('noteModalOverlay');
    const closeBtn = document.getElementById('noteModalClose');
    const cancelBtn = document.getElementById('noteCancelBtn');
    const form = document.getElementById('noteForm');
    const listContainer = document.getElementById('notesListContainer');

    const viewOverlay = document.getElementById('noteViewOverlay');
    const viewClose = document.getElementById('noteViewClose');

    const searchInput = document.getElementById('notesSearchInput');
    const searchBtn = document.getElementById('notesSearchBtn');
    const clearBtn = document.getElementById('notesSearchClearBtn');

    addBtn.addEventListener('click', () => openNoteModal());
    closeBtn.addEventListener('click', closeNoteModal);
    cancelBtn.addEventListener('click', closeNoteModal);

    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) closeNoteModal();
    });

    viewClose.addEventListener('click', closeNoteView);
    viewOverlay.addEventListener('click', (event) => {
        if (event.target === viewOverlay) closeNoteView();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        if (modalOverlay.classList.contains('open')) closeNoteModal();
        if (viewOverlay.classList.contains('open')) closeNoteView();
    });

    form.addEventListener('submit', handleNoteFormSubmit);

    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchNotes(query);
        } else {
            loadNotes();
        }
    });

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchBtn.click();
        }
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        loadNotes();
    });

    // Delegated click handling for note cards: edit / delete icons stop
    // the click from also opening the view modal.
    listContainer.addEventListener('click', (event) => {
        const editBtn = event.target.closest('[data-edit-id]');
        const deleteBtn = event.target.closest('[data-delete-id]');
        const card = event.target.closest('.note-card');

        if (editBtn) {
            event.stopPropagation();
            const note = notes.find((n) => n.id === Number(editBtn.dataset.editId));
            if (note) openNoteModal(note);
            return;
        }

        if (deleteBtn) {
            event.stopPropagation();
            const id = Number(deleteBtn.dataset.deleteId);
            const note = notes.find((n) => n.id === id);
            const confirmed = window.confirm(`Delete "${note ? note.title : 'this note'}"? This cannot be undone.`);
            if (confirmed) deleteNote(id);
            return;
        }

        if (card) {
            const note = notes.find((n) => n.id === Number(card.dataset.noteId));
            if (note) openNoteView(note);
        }
    });

    loadNotes();
}

/* ---------------------------------------------------------------------
   API CALLS
   --------------------------------------------------------------------- */

async function loadNotes() {
    try {
        const res = await fetch(`${NOTES_API}/all`);
        const data = await res.json();
        notes = Array.isArray(data) ? data : [];
        renderNotes();
    } catch (err) {
        console.error('Failed to load notes:', err);
        showEmptyState('Could not load notes. Is the server running?');
    }
}

async function searchNotes(title) {
    try {
        const res = await fetch(`${NOTES_API}/search/${encodeURIComponent(title)}`);
        const data = await res.json();
        notes = Array.isArray(data) ? data : [];
        renderNotes();
    } catch (err) {
        console.error('Failed to search notes:', err);
        showEmptyState('Could not search notes. Please try again.');
    }
}

async function deleteNote(id) {
    try {
        const res = await fetch(`${NOTES_API}/delete/${id}`, { method: 'DELETE' });
        await res.text();
        loadNotes();
    } catch (err) {
        console.error('Failed to delete note:', err);
        window.alert('Could not delete the note. Please try again.');
    }
}

async function handleNoteFormSubmit(event) {
    event.preventDefault();

    const idField = document.getElementById('noteId').value;
    const title = document.getElementById('noteTitle').value.trim();
    const subject = document.getElementById('noteSubject').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    const errorEl = document.getElementById('noteFormError');
    const saveBtn = document.getElementById('noteSaveBtn');

    if (!title || !subject || !content) {
        errorEl.textContent = 'Title, subject, and content are required.';
        return;
    }

    errorEl.textContent = '';
    saveBtn.disabled = true;

    const payload = { title, subject, content };

    try {
        const isEditing = Boolean(idField);
        const url = isEditing ? `${NOTES_API}/update/${idField}` : `${NOTES_API}/create`;
        const method = isEditing ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const saved = await res.json();

        if (isEditing && saved === null) {
            errorEl.textContent = 'This note no longer exists. It may have been deleted.';
            saveBtn.disabled = false;
            loadNotes();
            return;
        }

        await loadNotes();
        closeNoteModal();
    } catch (err) {
        console.error('Failed to save note:', err);
        errorEl.textContent = 'Could not save the note. Please try again.';
    } finally {
        saveBtn.disabled = false;
    }
}

/* ---------------------------------------------------------------------
   ADD/EDIT MODAL
   --------------------------------------------------------------------- */

function openNoteModal(note = null) {
    const modalOverlay = document.getElementById('noteModalOverlay');
    const modalTitle = document.getElementById('noteModalTitle');
    const form = document.getElementById('noteForm');
    const errorEl = document.getElementById('noteFormError');

    form.reset();
    errorEl.textContent = '';

    if (note) {
        modalTitle.textContent = 'Edit Note';
        document.getElementById('noteId').value = note.id;
        document.getElementById('noteTitle').value = note.title;
        document.getElementById('noteSubject').value = note.subject;
        document.getElementById('noteContent').value = note.content;
    } else {
        modalTitle.textContent = 'Add Note';
        document.getElementById('noteId').value = '';
    }

    modalOverlay.classList.add('open');
    document.getElementById('noteTitle').focus();
}

function closeNoteModal() {
    document.getElementById('noteModalOverlay').classList.remove('open');
}

/* ---------------------------------------------------------------------
   VIEW (READ-ONLY) MODAL
   --------------------------------------------------------------------- */

function openNoteView(note) {
    document.getElementById('noteViewTitle').textContent = note.title;
    document.getElementById('noteViewSubject').textContent = note.subject;
    document.getElementById('noteViewDate').textContent = formatDate(note.createdDate);
    document.getElementById('noteViewContent').textContent = note.content;
    document.getElementById('noteViewOverlay').classList.add('open');
}

function closeNoteView() {
    document.getElementById('noteViewOverlay').classList.remove('open');
}

/* ---------------------------------------------------------------------
   RENDERING
   --------------------------------------------------------------------- */

function renderNotes() {
    const listContainer = document.getElementById('notesListContainer');
    listContainer.querySelectorAll('.note-card').forEach((card) => card.remove());

    if (notes.length === 0) {
        showEmptyState('No notes yet. Click "+ Add Note" to create one.');
        return;
    }

    const emptyState = document.getElementById('notesEmptyState');
    if (emptyState) emptyState.style.display = 'none';

    const sorted = [...notes].sort((a, b) => (b.createdDate || '').localeCompare(a.createdDate || ''));

    sorted.forEach((note) => {
        listContainer.appendChild(buildNoteCard(note));
    });
}

function showEmptyState(message) {
    const listContainer = document.getElementById('notesListContainer');
    const emptyState = document.getElementById('notesEmptyState');
    listContainer.querySelectorAll('.note-card').forEach((card) => card.remove());
    if (emptyState) {
        emptyState.style.display = '';
        emptyState.textContent = message;
    }
}

function buildNoteCard(note) {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.dataset.noteId = note.id;

    card.innerHTML = `
        <div class="note-card-title">${escapeHtml(note.title)}</div>
        <span class="note-card-subject">${escapeHtml(note.subject)}</span>
        <p class="note-card-snippet">${escapeHtml(note.content)}</p>
        <div class="note-card-footer">
            <span class="note-card-date">${formatDate(note.createdDate)}</span>
            <div class="note-card-actions">
                <button type="button" class="icon-btn" data-edit-id="${note.id}" aria-label="Edit note">✎</button>
                <button type="button" class="icon-btn danger" data-delete-id="${note.id}" aria-label="Delete note">🗑</button>
            </div>
        </div>
    `;

    return card;
}

function formatDate(isoDate) {
    if (!isoDate) return '—';
    const [year, month, day] = isoDate.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}