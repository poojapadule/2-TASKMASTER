const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

const VALID_STATUSES = ['todo', 'in-progress', 'completed', 'cancelled'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

// GET /api/tasks — Get all tasks for current user
router.get('/', (req, res) => {
  const { status, priority, category, search, sortBy = 'createdAt', order = 'desc' } = req.query;

  let tasks = db.tasks.filter(t => t.userId === req.user.id);

  // Filters
  if (status) tasks = tasks.filter(t => t.status === status);
  if (priority) tasks = tasks.filter(t => t.priority === priority);
  if (category) tasks = tasks.filter(t => t.category?.toLowerCase().includes(category.toLowerCase()));
  if (search) {
    const q = search.toLowerCase();
    tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  }

  // Sort
  tasks.sort((a, b) => {
    const aVal = a[sortBy] || '';
    const bVal = b[sortBy] || '';
    return order === 'asc'
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });

  // Stats
  const stats = {
    total: db.tasks.filter(t => t.userId === req.user.id).length,
    todo: db.tasks.filter(t => t.userId === req.user.id && t.status === 'todo').length,
    inProgress: db.tasks.filter(t => t.userId === req.user.id && t.status === 'in-progress').length,
    completed: db.tasks.filter(t => t.userId === req.user.id && t.status === 'completed').length,
    cancelled: db.tasks.filter(t => t.userId === req.user.id && t.status === 'cancelled').length,
  };

  res.json({ tasks, stats, count: tasks.length });
});

// GET /api/tasks/:id — Get single task
router.get('/:id', (req, res) => {
  const task = db.tasks.find(t => t.id === req.params.id && t.userId === req.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json({ task });
});

// POST /api/tasks — Create task
router.post('/', [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('priority').optional().isIn(VALID_PRIORITIES).withMessage('Invalid priority'),
  body('status').optional().isIn(VALID_STATUSES).withMessage('Invalid status'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, priority = 'medium', status = 'todo', category, dueDate } = req.body;

  const newTask = {
    id: uuidv4(),
    userId: req.user.id,
    title,
    description: description || '',
    priority,
    status,
    category: category || 'General',
    dueDate: dueDate || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.tasks.push(newTask);
  res.status(201).json({ message: 'Task created', task: newTask });
});

// PUT /api/tasks/:id — Update task (full update)
router.put('/:id', [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('priority').optional().isIn(VALID_PRIORITIES).withMessage('Invalid priority'),
  body('status').optional().isIn(VALID_STATUSES).withMessage('Invalid status'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const taskIndex = db.tasks.findIndex(t => t.id === req.params.id && t.userId === req.user.id);
  if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });

  const updatedTask = {
    ...db.tasks[taskIndex],
    ...req.body,
    id: db.tasks[taskIndex].id,
    userId: db.tasks[taskIndex].userId,
    createdAt: db.tasks[taskIndex].createdAt,
    updatedAt: new Date().toISOString()
  };

  db.tasks[taskIndex] = updatedTask;
  res.json({ message: 'Task updated', task: updatedTask });
});

// PATCH /api/tasks/:id/status — Quick status update
router.patch('/:id/status', [
  body('status').isIn(VALID_STATUSES).withMessage('Invalid status')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const taskIndex = db.tasks.findIndex(t => t.id === req.params.id && t.userId === req.user.id);
  if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });

  db.tasks[taskIndex].status = req.body.status;
  db.tasks[taskIndex].updatedAt = new Date().toISOString();

  res.json({ message: 'Status updated', task: db.tasks[taskIndex] });
});

// DELETE /api/tasks/:id — Delete task
router.delete('/:id', (req, res) => {
  const taskIndex = db.tasks.findIndex(t => t.id === req.params.id && t.userId === req.user.id);
  if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });

  db.tasks.splice(taskIndex, 1);
  res.json({ message: 'Task deleted successfully' });
});

// DELETE /api/tasks — Delete all completed tasks
router.delete('/', (req, res) => {
  const before = db.tasks.length;
  db.tasks = db.tasks.filter(t => !(t.userId === req.user.id && t.status === 'completed'));
  const deleted = before - db.tasks.length;
  res.json({ message: `${deleted} completed task(s) deleted` });
});

module.exports = router;
