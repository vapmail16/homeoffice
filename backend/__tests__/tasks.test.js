import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from '../routes/auth.js';
import taskRoutes from '../routes/tasks.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const prisma = new PrismaClient();

describe('Task Assignment and Visibility', () => {
  let husbandToken, wifeToken;
  let husbandId, wifeId;

  beforeAll(async () => {
    // Clean up
    await prisma.task.deleteMany({});
    await prisma.user.deleteMany({});

    // Create husband user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const husband = await prisma.user.create({
      data: {
        username: 'test_husband',
        password: hashedPassword,
        role: 'husband'
      }
    });
    husbandId = husband.id;

    // Create wife user
    const wife = await prisma.user.create({
      data: {
        username: 'test_wife',
        password: hashedPassword,
        role: 'wife'
      }
    });
    wifeId = wife.id;

    // Generate tokens
    husbandToken = jwt.sign(
      { userId: husbandId, username: 'test_husband', role: 'husband' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    wifeToken = jwt.sign(
      { userId: wifeId, username: 'test_wife', role: 'wife' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await prisma.task.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/tasks - Task Assignment', () => {
    test('husband should be able to create task assigned to himself', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${husbandToken}`)
        .send({
          title: 'My own task',
          description: 'Task for myself',
          daysToComplete: 5,
          assignedToId: husbandId
        });

      expect(response.status).toBe(201);
      expect(response.body.assignedToId).toBe(husbandId);
      expect(response.body.userId).toBe(husbandId);
    });

    test('husband should be able to create task assigned to wife', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${husbandToken}`)
        .send({
          title: 'Task for wife',
          description: 'Please do this',
          daysToComplete: 3,
          assignedToId: wifeId
        });

      expect(response.status).toBe(201);
      expect(response.body.assignedToId).toBe(wifeId);
      expect(response.body.userId).toBe(husbandId); // Created by husband
    });

    test('wife should be able to create task assigned to husband', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${wifeToken}`)
        .send({
          title: 'Task for husband',
          description: 'Please do this',
          daysToComplete: 7,
          assignedToId: husbandId
        });

      expect(response.status).toBe(201);
      expect(response.body.assignedToId).toBe(husbandId);
      expect(response.body.userId).toBe(wifeId); // Created by wife
    });
  });

  describe('GET /api/tasks - Task Visibility', () => {
    beforeEach(async () => {
      // Clean up tasks
      await prisma.task.deleteMany({});
    });

    test('husband should see tasks assigned to him (regardless of who created)', async () => {
      // Task created by wife, assigned to husband
      await prisma.task.create({
        data: {
          title: 'Wife assigned task',
          expectedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          userId: wifeId,
          assignedToId: husbandId
        }
      });

      // Task created by husband, assigned to husband
      await prisma.task.create({
        data: {
          title: 'My own task',
          expectedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          userId: husbandId,
          assignedToId: husbandId
        }
      });

      // Task created by wife, assigned to wife (should NOT appear)
      await prisma.task.create({
        data: {
          title: 'Wife personal task',
          expectedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          userId: wifeId,
          assignedToId: wifeId
        }
      });

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${husbandToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body.some(t => t.title === 'Wife assigned task')).toBe(true);
      expect(response.body.some(t => t.title === 'My own task')).toBe(true);
      expect(response.body.some(t => t.title === 'Wife personal task')).toBe(false);
    });

    test('wife should see tasks assigned to her (regardless of who created)', async () => {
      // Task created by husband, assigned to wife
      await prisma.task.create({
        data: {
          title: 'Husband assigned task',
          expectedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          userId: husbandId,
          assignedToId: wifeId
        }
      });

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${wifeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Husband assigned task');
    });
  });
});
