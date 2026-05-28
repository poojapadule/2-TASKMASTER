const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// In-memory database (replace with MySQL/MongoDB in production)
const db = {
  users: [],
  tasks: []
};

// Seed a demo user
(async () => {
  const hashedPassword = await bcrypt.hash('demo1234', 10);
  db.users.push({
    id: uuidv4(),
    name: 'Pooja Padule',
    email: 'pooja@taskmaster.com',
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date().toISOString()
  });

  // Seed demo tasks
  const demoUserId = db.users[0].id;
  const sampleTasks = [
    { title: 'Setup project repository', description: 'Initialize Git repo and push initial commit', priority: 'high', status: 'completed', category: 'Development' },
    { title: 'Design database schema', description: 'Plan entity relationships and table structure', priority: 'high', status: 'in-progress', category: 'Development' },
    { title: 'Build authentication API', description: 'JWT-based login, register, and refresh token flow', priority: 'high', status: 'in-progress', category: 'Backend' },
    { title: 'Create responsive UI', description: 'Mobile-first design with Tailwind or CSS Grid', priority: 'medium', status: 'todo', category: 'Frontend' },
    { title: 'Write unit tests', description: 'Test all API endpoints with Jest/Mocha', priority: 'low', status: 'todo', category: 'Testing' },
  ];

  sampleTasks.forEach(task => {
    db.tasks.push({
      id: uuidv4(),
      userId: demoUserId,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      category: task.category,
      dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  console.log('✅ Demo data seeded — Email: pooja@taskmaster.com | Password: demo1234');
})();

module.exports = db;
