// ——— Auth Guard ———
const token = localStorage.getItem(CONFIG.TOKEN_KEY);
const currentUser = JSON.parse(localStorage.getItem(CONFIG.USER_KEY) || 'null');
if (!token) window.location.href = 'index.html';

// ——— State ———
let tasks = [];
let stats = {};
let activeFilter = 'all';
let editingTaskId = null;

// ——— Init ———
document.addEventListener('DOMContentLoaded', () => {
  populateUserInfo();
  fetchTasks();
  bindEvents();
});

function populateUserInfo() {
  if (!currentUser) return;
  document.getElementById('userName').textContent = currentUser.name;
  document.getElementById('userEmail').textContent = currentUser.email;
  document.getElementById('userAvatar').textContent = currentUser.name[0].toUpperCase();
}

// ——— Fetch Tasks ———
async function fetchTasks() {
  showLoading(true);
  try {
    const params = new URLSearchParams();
    if (activeFilter !== 'all') params.set('status', activeFilter);

    const pf = document.getElementById('priorityFilter')?.value;
    if (pf) params.set('priority', pf);

    const sf = document.getElementById('sortFilter')?.value;
    if (sf) {
      const [sortBy, order] = sf.split('_');
      params.set('sortBy', sortBy);
      params.set('order', order);
    }

    const search = document.getElementById('searchInput')?.value.trim();
    if (search) params.set('search', search);

    const data = await api.get(`/tasks?${params.toString()}`);
    tasks = data.tasks;
    stats = data.stats;
    renderTasks();
    renderStats();
  } catch (err) {
    console.error(err);
    if (err.message.includes('Token') || err.message.includes('token')) {
      logout();
    }
  } finally {
    showLoading(false);
  }
}

// ——— Render Tasks ———
function renderTasks() {
  const grid = document.getElementById('taskGrid');
  const empty = document.getElementById('emptyState');
  const loading = document.getElementById('loadingState');

  // Clear old cards
  Array.from(grid.children).forEach(child => {
    if (!child.id) grid.removeChild(child);
  });

  if (tasks.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  tasks.forEach(task => {
    const card = createTaskCard(task);
    grid.appendChild(card);
  });
}

function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = `task-card priority-${task.priority} status-${task.status}`;
  card.dataset.id = task.id;

  const dueInfo = getDueInfo(task.dueDate);

  card.innerHTML = `
    <div class="card-top">
      <div class="card-title">${escapeHTML(task.title)}</div>
    </div>
    <div class="card-badges">
      <span class="badge badge-status-${task.status}">${formatStatus(task.status)}</span>
      ${task.category ? `<span class="badge badge-category">${escapeHTML(task.category)}</span>` : ''}
    </div>
    ${task.description ? `<div class="card-desc">${escapeHTML(task.description)}</div>` : ''}
    ${dueInfo ? `<div class="card-due ${dueInfo.overdue ? 'overdue' : ''}">📅 ${dueInfo.text}</div>` : ''}
    <div class="card-actions">
      <select class="status-select" onchange="quickStatusUpdate('${task.id}', this.value)" title="Change status">
        <option value="todo" ${task.status==='todo'?'selected':''}>To Do</option>
        <option value="in-progress" ${task.status==='in-progress'?'selected':''}>In Progress</option>
        <option value="completed" ${task.status==='completed'?'selected':''}>Completed</option>
        <option value="cancelled" ${task.status==='cancelled'?'selected':''}>Cancelled</option>
      </select>
      <button class="card-btn edit-btn" onclick="openEditModal('${task.id}')">✏️ Edit</button>
      <button class="card-btn del-btn" onclick="deleteTask('${task.id}')">🗑</button>
    </div>
  `;
  return card;
}

function renderStats() {
  document.getElementById('statTotal').textContent = stats.total || 0;
  document.getElementById('statTodo').textContent = stats.todo || 0;
  document.getElementById('statInProgress').textContent = stats.inProgress || 0;
  document.getElementById('statCompleted').textContent = stats.completed || 0;

  document.getElementById('badgeAll').textContent = stats.total || 0;
  document.getElementById('badgeTodo').textContent = stats.todo || 0;
  document.getElementById('badgeInProgress').textContent = stats.inProgress || 0;
  document.getElementById('badgeCompleted').textContent = stats.completed || 0;
  document.getElementById('badgeCancelled').textContent = stats.cancelled || 0;
}

// ——— Quick Status Update ———
async function quickStatusUpdate(id, status) {
  try {
    await api.patch(`/tasks/${id}/status`, { status });
    showToast('Status updated', 'success');
    fetchTasks();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ——— Delete Task ———
async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  try {
    await api.delete(`/tasks/${id}`);
    showToast('Task deleted', 'success');
    fetchTasks();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ——— Modal ———
function openCreateModal() {
  editingTaskId = null;
  document.getElementById('modalTitle').textContent = 'New Task';
  document.getElementById('taskForm').reset();
  document.getElementById('taskId').value = '';
  document.getElementById('taskFormError').classList.add('hidden');
  document.getElementById('taskModal').classList.remove('hidden');
}

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editingTaskId = id;
  document.getElementById('modalTitle').textContent = 'Edit Task';
  document.getElementById('taskId').value = id;
  document.getElementById('taskTitle').value = task.title;
  document.getElementById('taskDesc').value = task.description || '';
  document.getElementById('taskPriority').value = task.priority;
  document.getElementById('taskStatus').value = task.status;
  document.getElementById('taskCategory').value = task.category || '';
  document.getElementById('taskDueDate').value = task.dueDate || '';
  document.getElementById('taskFormError').classList.add('hidden');
  document.getElementById('taskModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('taskModal').classList.add('hidden');
  editingTaskId = null;
}

// ——— Save Task ———
document.getElementById('taskForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('taskTitle').value.trim();
  if (!title) {
    document.getElementById('taskFormError').textContent = 'Title is required';
    document.getElementById('taskFormError').classList.remove('hidden');
    return;
  }

  const body = {
    title,
    description: document.getElementById('taskDesc').value.trim(),
    priority: document.getElementById('taskPriority').value,
    status: document.getElementById('taskStatus').value,
    category: document.getElementById('taskCategory').value.trim(),
    dueDate: document.getElementById('taskDueDate').value || null
  };

  const btn = document.getElementById('saveTaskBtn');
  setLoading(btn, true);
  document.getElementById('taskFormError').classList.add('hidden');

  try {
    if (editingTaskId) {
      await api.put(`/tasks/${editingTaskId}`, body);
      showToast('Task updated ✓', 'success');
    } else {
      await api.post('/tasks', body);
      showToast('Task created ✓', 'success');
    }
    closeModal();
    fetchTasks();
  } catch (err) {
    document.getElementById('taskFormError').textContent = err.message;
    document.getElementById('taskFormError').classList.remove('hidden');
  } finally {
    setLoading(btn, false);
  }
});

// ——— Clear Done ———
document.getElementById('clearDoneBtn').addEventListener('click', async () => {
  if (!confirm('Delete all completed tasks?')) return;
  try {
    const data = await api.delete('/tasks');
    showToast(data.message, 'success');
    fetchTasks();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// ——— Logout ———
function logout() {
  localStorage.removeItem(CONFIG.TOKEN_KEY);
  localStorage.removeItem(CONFIG.USER_KEY);
  window.location.href = 'index.html';
}
document.getElementById('logoutBtn').addEventListener('click', logout);

// ——— Sidebar Toggle (mobile) ———
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
document.getElementById('hamburger').addEventListener('click', () => {
  sidebar.classList.add('open');
  overlay.classList.add('active');
});
document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);
function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
}

// ——— Nav Filter ———
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    activeFilter = item.dataset.filter;
    fetchTasks();
    closeSidebar();
  });
});

document.querySelectorAll('.stat-card').forEach(card => {
  card.addEventListener('click', () => {
    const f = card.dataset.filter;
    activeFilter = f;
    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.filter === f);
    });
    fetchTasks();
  });
});

// ——— Bind Events ———
function bindEvents() {
  document.getElementById('openModalBtn').addEventListener('click', openCreateModal);
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('cancelModal').addEventListener('click', closeModal);

  document.getElementById('searchInput').addEventListener('input', debounce(fetchTasks, 400));
  document.getElementById('priorityFilter').addEventListener('change', fetchTasks);
  document.getElementById('sortFilter').addEventListener('change', fetchTasks);

  document.getElementById('taskModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('taskModal')) closeModal();
  });
}

// ——— Helpers ———
function showLoading(show) {
  document.getElementById('loadingState').classList.toggle('hidden', !show);
  if (show) document.getElementById('emptyState').classList.add('hidden');
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

function setLoading(btn, loading) {
  btn.querySelector('span').style.opacity = loading ? '0.5' : '1';
  btn.querySelector('.btn-loader').classList.toggle('hidden', !loading);
  btn.disabled = loading;
}

function getDueInfo(dueDate) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { text: `Overdue by ${Math.abs(diff)} day(s)`, overdue: true };
  if (diff === 0) return { text: 'Due today!', overdue: false };
  if (diff === 1) return { text: 'Due tomorrow', overdue: false };
  return { text: `Due ${due.toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}`, overdue: false };
}

function formatStatus(status) {
  const map = { 'todo': 'To Do', 'in-progress': 'In Progress', 'completed': 'Completed', 'cancelled': 'Cancelled' };
  return map[status] || status;
}

function escapeHTML(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}
