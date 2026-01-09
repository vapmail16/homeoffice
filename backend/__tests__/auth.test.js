import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from '../routes/auth.js';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

const prisma = new PrismaClient();

describe('Authentication with Roles', () => {
  let husbandUser, wifeUser;

  beforeAll(async () => {
    // Clean up existing test users
    await prisma.task.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.task.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    test('should register a user with default role (husband)', async () => {
      const username = `husband_${Date.now()}`;
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username,
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toHaveProperty('username', username);
      expect(response.body.user).toHaveProperty('id');
      
      // Verify role in database
      const user = await prisma.user.findUnique({ where: { username } });
      expect(user.role).toBe('husband');
    });

    test('should register a user with explicit wife role', async () => {
      const username = `wife_${Date.now()}`;
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username,
          password: 'password123',
          role: 'wife'
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toHaveProperty('username', username);
      
      // Verify role in database
      const user = await prisma.user.findUnique({ where: { username } });
      expect(user.role).toBe('wife');
    });

    test('should not allow duplicate usernames', async () => {
      const username = `duplicate_${Date.now()}`;
      
      // First registration should succeed
      const firstResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username,
          password: 'password123'
        });
      expect(firstResponse.status).toBe(201);
      
      // Second registration with same username should fail
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username,
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login and return JWT with user role', async () => {
      // Create a user first
      const username = `login_test_${Date.now()}`;
      await request(app)
        .post('/api/auth/register')
        .send({
          username,
          password: 'password123',
          role: 'husband'
        });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username,
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', username);
      expect(response.body.user).toHaveProperty('role', 'husband');
    });

    test('should fail with invalid credentials', async () => {
      const username = `invalid_test_${Date.now()}`;
      // Create a user first
      await request(app)
        .post('/api/auth/register')
        .send({
          username,
          password: 'password123'
        });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
});
