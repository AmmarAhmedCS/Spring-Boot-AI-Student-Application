const TIMETABLE_API = '/api/timetable';

let timetableEntries = [];

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_LABELS = {
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday',
    SUNDAY: 'Sunday',
};

document.addEventListener('DOMContentLoaded', () => {
    initSidebarToggle();
    initLogout();
    initUserMenu();
    initTimetable();
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

function initTimetable() {
    const addBtn = document.getElementById('addEntryBtn');
    const modalOverlay = document.getElementById('timetableModalOverlay');
    const closeBtn = document.getElementById('timetableModalClose');
    const cancelBtn = document.getElementById('timetableCancelBtn');
    const form = document.getElementById('timetableForm');
    const listContainer = document.getElementById('timetableListContainer');

    addBtn.addEventListener('click', () => openTimetableModal());
    closeBtn.addEventListener('click', closeTimetableModal);
    cancelBtn.addEventListener('click', closeTimetableModal);

    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) closeTimetableModal();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalOverlay.classList.contains('open')) {
            closeTimetableModal();
        }
    });

    form.addEventListener('submit', handleTimetableFormSubmit);

    listContainer.addEventListener('click', (event) => {
        const editBtn = event.target.closest('[data-edit-id]');
        const deleteBtn = event.target.closest('[data-delete-id]');

        if (editBtn) {
            const entry = timetableEntries.find((e) => e.id === Number(editBtn.dataset.editId));
            if (entry) openTimetableModal(entry);
        }

        if (deleteBtn) {
            const id = Number(deleteBtn.dataset.deleteId);
            const entry = timetableEntries.find((e) => e.id === id);
            const confirmed = window.confirm(`Delete "${entry ? entry.subject : 'this entry'}"? This cannot be undone.`);
            if (confirmed) {
                deleteTimetableEntry(id);
            }
        }
    });

    loadTimetableEntries();
}

/* ---------------------------------------------------------------------
   API CALLS
   --------------------------------------------------------------------- */

async function loadTimetableEntries() {
    const emptyState = document.getElementById('timetableEmptyState');

    try {
        const res = await fetch(`${TIMETABLE_API}/all`);
        const data = await res.json();
        timetableEntries = Array.isArray(data) ? data : [];
        renderTimetable();
    } catch (err) {
        console.error('Failed to load timetable:', err);
        if (emptyState) {
            emptyState.style.display = '';
            emptyState.textContent = 'Could not load timetable. Is the server running?';
        }
    }
}

async function deleteTimetableEntry(id) {
    try {
        const res = await fetch(`${TIMETABLE_API}/delete/${id}`, { method: 'DELETE' });
        await res.text();
        loadTimetableEntries();
    } catch (err) {
        console.error('Failed to delete entry:', err);
        window.alert('Could not delete the entry. Please try again.');
    }
}

async function handleTimetableFormSubmit(event) {
    event.preventDefault();

    const idField = document.getElementById('entryId').value;
    const dayOfWeek = document.getElementById('entryDayOfWeek').value;
    const subject = document.getElementById('entrySubject').value.trim();
    const teacher = document.getElementById('entryTeacher').value.trim();
    const startTime = document.getElementById('entryStartTime').value;
    const endTime = document.getElementById('entryEndTime').value;
    const room = document.getElementById('entryRoom').value.trim();
    const errorEl = document.getElementById('timetableFormError');
    const saveBtn = document.getElementById('timetableSaveBtn');

    if (!dayOfWeek || !subject || !startTime || !endTime) {
        errorEl.textContent = 'Day, subject, start time, and end time are required.';
        return;
    }

    errorEl.textContent = '';
    saveBtn.disabled = true;

    const payload = { dayOfWeek, subject, teacher, startTime, endTime, room };

    try {
        const isEditing = Boolean(idField);
        const url = isEditing ? `${TIMETABLE_API}/update/${idField}` : `${TIMETABLE_API}/create`;
        const method = isEditing ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const saved = await res.json();

        if (isEditing && saved === null) {
            errorEl.textContent = 'This entry no longer exists. It may have been deleted.';
            saveBtn.disabled = false;
            loadTimetableEntries();
            return;
        }

        await loadTimetableEntries();
        closeTimetableModal();
    } catch (err) {
        console.error('Failed to save entry:', err);
        errorEl.textContent = 'Could not save the entry. Please try again.';
    } finally {
        saveBtn.disabled = false;
    }
}

/* ---------------------------------------------------------------------
   MODAL
   --------------------------------------------------------------------- */

function openTimetableModal(entry = null) {
    const modalOverlay = document.getElementById('timetableModalOverlay');
    const modalTitle = document.getElementById('timetableModalTitle');
    const form = document.getElementById('timetableForm');
    const errorEl = document.getElementById('timetableFormError');

    form.reset();
    errorEl.textContent = '';

    if (entry) {
        modalTitle.textContent = 'Edit Timetable Entry';
        document.getElementById('entryId').value = entry.id;
        document.getElementById('entryDayOfWeek').value = entry.dayOfWeek;
        document.getElementById('entrySubject').value = entry.subject;
        document.getElementById('entryTeacher').value = entry.teacher || '';
        document.getElementById('entryStartTime').value = entry.startTime;
        document.getElementById('entryEndTime').value = entry.endTime;
        document.getElementById('entryRoom').value = entry.room || '';
    } else {
        modalTitle.textContent = 'Add Timetable Entry';
        document.getElementById('entryId').value = '';
    }

    modalOverlay.classList.add('open');
    document.getElementById('entryDayOfWeek').focus();
}

function closeTimetableModal() {
    document.getElementById('timetableModalOverlay').classList.remove('open');
}

/* ---------------------------------------------------------------------
   RENDERING
   --------------------------------------------------------------------- */

function renderTimetable() {
    const listContainer = document.getElementById('timetableListContainer');
    const emptyState = document.getElementById('timetableEmptyState');

    listContainer.querySelectorAll('.timetable-day-group').forEach((el) => el.remove());

    if (timetableEntries.length === 0) {
        if (emptyState) {
            emptyState.style.display = '';
            emptyState.textContent = 'No timetable entries yet. Click "+ Add Entry" to create one.';
        }
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    DAY_ORDER.forEach((day) => {
        const entriesForDay = timetableEntries
            .filter((e) => e.dayOfWeek === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

        if (entriesForDay.length === 0) return;

        const group = document.createElement('div');
        group.className = 'timetable-day-group';

        const label = document.createElement('div');
        label.className = 'timetable-day-label';
        label.textContent = DAY_LABELS[day] || day;
        group.appendChild(label);

        entriesForDay.forEach((entry) => {
            group.appendChild(buildTimetableCard(entry));
        });

        listContainer.appendChild(group);
    });
}

function buildTimetableCard(entry) {
    const card = document.createElement('div');
    card.className = 'timetable-card';

    card.innerHTML = `
        <div class="timetable-card-main">
            <span class="timetable-time">${formatTime(entry.startTime)} – ${formatTime(entry.endTime)}</span>
            <div class="timetable-card-info">
                <div class="timetable-subject">${escapeHtml(entry.subject)}</div>
                <div class="timetable-meta">${escapeHtml(entry.teacher || '—')} · ${escapeHtml(entry.room || '—')}</div>
            </div>
        </div>
        <div class="timetable-card-actions">
            <button type="button" class="icon-btn" data-edit-id="${entry.id}" aria-label="Edit entry">✎</button>
            <button type="button" class="icon-btn danger" data-delete-id="${entry.id}" aria-label="Delete entry">🗑</button>
        </div>
    `;

    return card;
}

function formatTime(value) {
    if (!value) return '--';
    const [hourStr, minuteStr] = value.split(':');
    const hour = Number(hourStr);
    const minute = minuteStr || '00';
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minute} ${period}`;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}