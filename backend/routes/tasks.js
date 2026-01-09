import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all tasks assigned to the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { assignedToId: req.user.userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true
          }
        }
      },
      orderBy: { createdDate: 'desc' }
    });

    // Calculate delay for each task
    const tasksWithDelay = tasks.map(task => {
      let delay = 0;
      
      // Only calculate delay if task has expected date and is not backlog
      if (task.expectedDate && !task.isBacklog) {
        const today = new Date();
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
        ...task,
        delayDays: delay,
        assignedBy: task.user ? {
          username: task.user.username,
          role: task.user.role
        } : null
      };
    });

    res.json(tasksWithDelay);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get a single task
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        assignedToId: req.user.userId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    let delay = 0;
    
    // Only calculate delay if task has expected date and is not backlog
    if (task.expectedDate && !task.isBacklog) {
      const today = new Date();
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

    res.json({
      ...task,
      delayDays: delay,
      assignedBy: task.user ? {
        username: task.user.username,
        role: task.user.role
      } : null
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create a new task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, expectedDate, daysToComplete, assignedToId, isBacklog } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Determine who the task is assigned to (default to current user if not specified)
    let assignedTo = assignedToId || req.user.userId;
    
    // Verify assignedTo user exists
    const assignedUser = await prisma.user.findUnique({
      where: { id: assignedTo }
    });
    
    if (!assignedUser) {
      return res.status(400).json({ error: 'Assigned user not found' });
    }

    // Handle expected date: backlog tasks don't need expected date
    let expectedDateTime = null;
    if (!isBacklog) {
      if (expectedDate) {
        expectedDateTime = new Date(expectedDate);
      } else if (daysToComplete) {
        // If daysToComplete is provided, calculate expected date from today
        const today = new Date();
        today.setDate(today.getDate() + parseInt(daysToComplete));
        expectedDateTime = today;
      } else {
        return res.status(400).json({ error: 'Expected date or days to complete is required for non-backlog tasks' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        expectedDate: expectedDateTime,
        isBacklog: isBacklog || false,
        userId: req.user.userId, // Who created/assigned the task
        assignedToId: assignedTo // Who the task is assigned to
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true
          }
        }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task (mainly for adding comments)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { comments, title, description, expectedDate, isCompleted, isBacklog, daysToComplete } = req.body;

    // Check if task exists and is assigned to user (they can update their assigned tasks)
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        assignedToId: req.user.userId
      }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found or not assigned to you' });
    }

    const updateData = {};
    if (comments !== undefined) updateData.comments = comments;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isBacklog !== undefined) updateData.isBacklog = isBacklog;
    
    // Handle expected date
    if (expectedDate !== undefined) {
      updateData.expectedDate = expectedDate ? new Date(expectedDate) : null;
    } else if (daysToComplete !== undefined && !isBacklog) {
      const today = new Date();
      today.setDate(today.getDate() + parseInt(daysToComplete));
      updateData.expectedDate = today;
    }
    
    // If marking as backlog, remove expected date
    if (isBacklog === true) {
      updateData.expectedDate = null;
    }
    
    // Handle completion status
    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      if (isCompleted && !existingTask.completedDate) {
        updateData.completedDate = new Date();
      } else if (!isCompleted) {
        updateData.completedDate = null;
      }
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a task (only the creator can delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId // Only creator can delete
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or you are not authorized to delete it' });
    }

    await prisma.task.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
