import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import leadsRoutes from './modules/leads/leads.routes';
import clientsRoutes from './modules/clients/clients.routes';
import quotationsRoutes from './modules/quotations/quotations.routes';
import projectsRoutes from './modules/projects/projects.routes';
import tasksRoutes from './modules/tasks/tasks.routes';
import invoicesRoutes from './modules/invoices/invoices.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import approvalsRoutes from './modules/approvals/approvals.routes';
import activityRoutes from './modules/activity/activity.routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Random Frames OS Backend is running' });
});

// Import and mount routes here
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/leads', leadsRoutes);
app.use('/clients', clientsRoutes);
app.use('/quotations', quotationsRoutes);
app.use('/projects', projectsRoutes);
app.use('/tasks', tasksRoutes);
app.use('/invoices', invoicesRoutes);
app.use('/payments', paymentsRoutes);
app.use('/approvals', approvalsRoutes);
app.use('/activity', activityRoutes);

// Error Handler (must be after routes)
app.use(errorHandler);

// Environment Validation
if (!process.env.DATABASE_URL) {
  console.error('FATAL ERROR: DATABASE_URL is not defined in the environment.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in the environment.');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
