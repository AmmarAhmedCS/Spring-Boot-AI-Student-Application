/* =========================================================================
   STUDENT DASHBOARD — dashboard.js

   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    initSectionNavigation();
    initSidebarToggle();
    initLogout();
    initUserMenu();
    initUserName();
    initAssignments();
    initHomeStats();
});

/* ---------------------------------------------------------------------
   SECTION NAVIGATION

   --------------------------------------------------------------------- */
function initSectionNavigation() {
    const sectionLinks = document.querySelectorAll('[data-section]');
    const sidebarNavLinks = document.querySelectorAll('.sidebar-nav .nav-link');

    sectionLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.getAttribute('data-section');
            if (!targetId) return;

            showSection(targetId);
            setActiveNavLink(sidebarNavLinks, targetId);


            history.replaceState(null, '', `#${targetId}`);
        });
    });


    const initialId = window.location.hash ? window.location.hash.slice(1) : null;
    if (initialId && document.getElementById(initialId)) {
        showSection(initialId);
        setActiveNavLink(sidebarNavLinks, initialId);
    }
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach((section) => {
        section.classList.toggle('active-section', section.id === sectionId);
    });
}

function setActiveNavLink(sidebarNavLinks, sectionId) {
    sidebarNavLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
    });
}

/* ---------------------------------------------------------------------
   SIDEBAR TOGGLE

   --------------------------------------------------------------------- */
function initSidebarToggle() {
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if (!toggleBtn || !sidebar) return;


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


    sidebar.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            if (isMobile()) closeMobileDrawer();
        });
    });
}

/* ---------------------------------------------------------------------
   LOGOUT

   --------------------------------------------------------------------- */
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
   TOPBAR USER MENU —
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
   USER NAME DISPLAY

   --------------------------------------------------------------------- */
function initUserName() {
    const userNameEl = document.getElementById('userName');
    if (!userNameEl) return;

    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) return;

    try {
        const parsed = JSON.parse(storedUser);
        const displayName = parsed.name || parsed.username || parsed.fullName;
        if (displayName) {
            userNameEl.textContent = displayName;
        }
    } catch (err) {

    }
}

/* ---------------------------------------------------------------------
   ASSIGNMENTS —
   --------------------------------------------------------------------- */
const ASSIGNMENTS_API = '/api/assignments';

let assignments = [];

const STATUS_LABELS = {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
};

function initAssignments() {
    const addBtn = document.getElementById('addAssignmentBtn');
    const modalOverlay = document.getElementById('assignmentModalOverlay');
    const closeBtn = document.getElementById('assignmentModalClose');
    const cancelBtn = document.getElementById('assignmentCancelBtn');
    const form = document.getElementById('assignmentForm');
    const listContainer = document.getElementById('assignmentsListContainer');

    if (!addBtn || !modalOverlay || !form || !listContainer) return;

    addBtn.addEventListener('click', () => openAssignmentModal());
    closeBtn.addEventListener('click', closeAssignmentModal);
    cancelBtn.addEventListener('click', closeAssignmentModal);


    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) closeAssignmentModal();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalOverlay.classList.contains('open')) {
            closeAssignmentModal();
        }
    });

    form.addEventListener('submit', handleAssignmentFormSubmit);


    listContainer.addEventListener('click', (event) => {
        const editBtn = event.target.closest('[data-edit-id]');
        const deleteBtn = event.target.closest('[data-delete-id]');

        if (editBtn) {
            const assignment = assignments.find((a) => a.id === Number(editBtn.dataset.editId));
            if (assignment) openAssignmentModal(assignment);
        }

        if (deleteBtn) {
            const id = Number(deleteBtn.dataset.deleteId);
            const assignment = assignments.find((a) => a.id === id);
            const confirmed = window.confirm(`Delete "${assignment ? assignment.title : 'this assignment'}"? This cannot be undone.`);
            if (confirmed) {
                deleteAssignment(id);
            }
        }
    });

    loadAssignments();
}

/* ---------------------------------------------------------------------
   API CALLS
   --------------------------------------------------------------------- */

// GET /api/assignments/all
async function loadAssignments() {
    const listContainer = document.getElementById('assignmentsListContainer');

    try {
        const res = await fetch(`${ASSIGNMENTS_API}/all`);
        const data = await res.json();
        assignments = Array.isArray(data) ? data : [];
        renderAssignments();
    } catch (err) {
        console.error('Failed to load assignments:', err);
        if (listContainer) {
            listContainer.querySelectorAll('.assignment-card').forEach((card) => card.remove());
            const emptyState = document.getElementById('assignmentsEmptyState');
            if (emptyState) {
                emptyState.style.display = '';
                emptyState.textContent = 'Could not load assignments. Is the server running?';
            }
        }
    }
}

// DELETE /api/assignments/delete/{id}
async function deleteAssignment(id) {
    try {
        const res = await fetch(`${ASSIGNMENTS_API}/delete/${id}`, { method: 'DELETE' });

        await res.text();
        loadAssignments();
    } catch (err) {
        console.error('Failed to delete assignment:', err);
        window.alert('Could not delete the assignment. Please try again.');
    }
}

function openAssignmentModal(assignment = null) {
    const modalOverlay = document.getElementById('assignmentModalOverlay');
    const modalTitle = document.getElementById('assignmentModalTitle');
    const form = document.getElementById('assignmentForm');
    const errorEl = document.getElementById('assignmentFormError');

    form.reset();
    errorEl.textContent = '';

    if (assignment) {
        modalTitle.textContent = 'Edit Assignment';
        document.getElementById('assignmentId').value = assignment.id;
        document.getElementById('assignmentTitle').value = assignment.title;
        document.getElementById('assignmentSubject').value = assignment.subject;
        document.getElementById('assignmentDescription').value = assignment.description || '';
        document.getElementById('assignmentDueDate').value = assignment.dueDate;
        document.getElementById('assignmentStatus').value = assignment.status;
    } else {
        modalTitle.textContent = 'Add Assignment';
        document.getElementById('assignmentId').value = '';
    }

    modalOverlay.classList.add('open');
    document.getElementById('assignmentTitle').focus();
}

function closeAssignmentModal() {
    document.getElementById('assignmentModalOverlay').classList.remove('open');
}

async function handleAssignmentFormSubmit(event) {
    event.preventDefault();

    const idField = document.getElementById('assignmentId').value;
    const title = document.getElementById('assignmentTitle').value.trim();
    const subject = document.getElementById('assignmentSubject').value.trim();
    const description = document.getElementById('assignmentDescription').value.trim();
    const dueDate = document.getElementById('assignmentDueDate').value;
    const status = document.getElementById('assignmentStatus').value;
    const errorEl = document.getElementById('assignmentFormError');
    const saveBtn = document.getElementById('assignmentSaveBtn');

    if (!title || !subject || !dueDate) {
        errorEl.textContent = 'Title, subject, and due date are required.';
        return;
    }

    errorEl.textContent = '';
    saveBtn.disabled = true;

    const payload = { title, subject, description, dueDate, status };

    try {
        const isEditing = Boolean(idField);
        const url = isEditing ? `${ASSIGNMENTS_API}/update/${idField}` : `${ASSIGNMENTS_API}/create`;
        const method = isEditing ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const saved = await res.json();


        if (isEditing && saved === null) {
            errorEl.textContent = 'This assignment no longer exists. It may have been deleted.';
            saveBtn.disabled = false;
            loadAssignments();
            return;
        }

        await loadAssignments();
        closeAssignmentModal();
    } catch (err) {
        console.error('Failed to save assignment:', err);
        errorEl.textContent = 'Could not save the assignment. Please try again.';
    } finally {
        saveBtn.disabled = false;
    }
}

function renderAssignments() {
    const listContainer = document.getElementById('assignmentsListContainer');
    const emptyState = document.getElementById('assignmentsEmptyState');
    const countEl = document.getElementById('assignmentsCount');

    if (countEl) countEl.textContent = assignments.length;


    listContainer.querySelectorAll('.assignment-card').forEach((card) => card.remove());

    if (assignments.length === 0) {
        if (emptyState) emptyState.style.display = '';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Soonest due date first
    const sorted = [...assignments].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    sorted.forEach((assignment) => {
        listContainer.appendChild(buildAssignmentCard(assignment));
    });
}

function buildAssignmentCard(assignment) {
    const card = document.createElement('div');
    card.className = 'assignment-card';

    const formattedDate = formatDueDate(assignment.dueDate);

    card.innerHTML = `
        <div class="assignment-card-main">
            <div class="assignment-card-title">${escapeHtml(assignment.title)}</div>
            <span class="assignment-card-subject">${escapeHtml(assignment.subject)}</span>
            ${assignment.description ? `<p class="assignment-card-description">${escapeHtml(assignment.description)}</p>` : ''}
            <div class="assignment-card-meta">
                <span class="status-badge" data-status="${assignment.status}">${STATUS_LABELS[assignment.status] || assignment.status}</span>
                <span class="assignment-due-date">Due ${formattedDate}</span>
            </div>
        </div>
        <div class="assignment-card-actions">
            <button type="button" class="icon-btn" data-edit-id="${assignment.id}" aria-label="Edit assignment">✎</button>
            <button type="button" class="icon-btn danger" data-delete-id="${assignment.id}" aria-label="Delete assignment">🗑</button>
        </div>
    `;

    return card;
}

function formatDueDate(isoDate) {
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

/* ---------------------------------------------------------------------
   HOME PAGE STATS —
   --------------------------------------------------------------------- */
const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function initHomeStats() {
    loadTodaysClassesCount();
    loadNotesCount();
}

async function loadTodaysClassesCount() {
    const countEl = document.getElementById('todaysClassesCount');
    if (!countEl) return;

    try {
        const res = await fetch('/api/timetable/all');
        const data = await res.json();
        const entries = Array.isArray(data) ? data : [];

        const today = DAY_NAMES[new Date().getDay()];
        const todaysCount = entries.filter((entry) => entry.dayOfWeek === today).length;

        countEl.textContent = todaysCount;
    } catch (err) {
        console.error('Failed to load timetable count:', err);
        countEl.textContent = '--';
    }
}

async function loadNotesCount() {
    const countEl = document.getElementById('notesCount');
    if (!countEl) return;

    try {
        const res = await fetch('/api/notes/all');
        const data = await res.json();
        const notesList = Array.isArray(data) ? data : [];

        countEl.textContent = notesList.length;
    } catch (err) {
        console.error('Failed to load notes count:', err);
        countEl.textContent = '--';
    }
}