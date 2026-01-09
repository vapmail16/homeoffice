import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get performance metrics for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    
    // Get all tasks assigned to this user (not created by), excluding backlog
    const allTasks = await prisma.task.findMany({
      where: { 
        assignedToId: userId,
        isBacklog: false // Exclude backlog tasks from performance metrics
      },
      orderBy: { createdDate: 'desc' }
    });

    // Calculate metrics (only for non-backlog tasks)
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.isCompleted).length;
    const pendingTasks = totalTasks - completedTasks;
    
    // Tasks overdue (pending and past expected date) - backlog already excluded from allTasks
    const overdueTasks = allTasks.filter(task => {
      if (task.isCompleted || !task.expectedDate) return false;
      const expected = new Date(task.expectedDate);
      return today > expected;
    }).length;

    // Tasks completed on time vs delayed (backlog already excluded)
    const completedOnTime = allTasks.filter(task => {
      if (!task.isCompleted || !task.completedDate || !task.expectedDate) return false;
      const completed = new Date(task.completedDate);
      const expected = new Date(task.expectedDate);
      return completed <= expected;
    }).length;

    const completedDelayed = completedTasks - completedOnTime;

    // Calculate average delay for completed tasks (backlog already excluded)
    let totalDelay = 0;
    let delayedCount = 0;
    allTasks.forEach(task => {
      if (task.isCompleted && task.completedDate && task.expectedDate) {
        const completed = new Date(task.completedDate);
        const expected = new Date(task.expectedDate);
        if (completed > expected) {
          const delay = Math.ceil((completed - expected) / (1000 * 60 * 60 * 24));
          totalDelay += delay;
          delayedCount++;
        }
      }
    });
    const averageDelay = delayedCount > 0 ? (totalDelay / delayedCount).toFixed(1) : 0;

    // Completion rate
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

    // On-time completion rate
    const onTimeRate = completedTasks > 0 ? ((completedOnTime / completedTasks) * 100).toFixed(1) : 0;

    // Tasks by status this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const tasksThisWeek = allTasks.filter(task => {
      const created = new Date(task.createdDate);
      return created >= weekAgo;
    });

    // Tasks completed this week
    const completedThisWeek = allTasks.filter(task => {
      if (!task.isCompleted || !task.completedDate) return false;
      const completed = new Date(task.completedDate);
      return completed >= weekAgo;
    }).length;

    res.json({
      summary: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate: parseFloat(completionRate),
        onTimeRate: parseFloat(onTimeRate)
      },
      completion: {
        completedOnTime,
        completedDelayed,
        averageDelay: parseFloat(averageDelay),
        delayedCount
      },
      weekly: {
        tasksCreated: tasksThisWeek.length,
        tasksCompleted: completedThisWeek
      },
      tasks: allTasks.map(task => {
        // Only calculate delay for tasks with expected date (non-backlog)
        let delay = 0;
        if (task.expectedDate) {
          const expected = new Date(task.expectedDate);
          if (!task.isCompleted && today > expected) {
            delay = Math.ceil((today - expected) / (1000 * 60 * 60 * 24));
          } else if (task.isCompleted && task.completedDate) {
            const completed = new Date(task.completedDate);
            if (completed > expected) {
              delay = Math.ceil((completed - expected) / (1000 * 60 * 60 * 24));
            }
          }
        }
        return {
          id: task.id,
          title: task.title,
          isCompleted: task.isCompleted,
          createdDate: task.createdDate,
          expectedDate: task.expectedDate,
          completedDate: task.completedDate,
          delayDays: delay,
          isBacklog: task.isBacklog
        };
      })
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

export default router;
