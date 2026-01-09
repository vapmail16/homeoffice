# Home Office - Deployment Guide

**Date**: January 9, 2025  
**Status**: Ready for Deployment  
**Platform**: DCDeploy  
**Database**: PostgreSQL on DCDeploy

---

## 🎯 Overview

This guide provides step-by-step instructions for deploying the Home Office app to DCDeploy.

**Prerequisites**:
- ✅ Database URL: `postgresql://vtjFBU:AmYkzn-d79@database-lg6o89g7r9.tcp-proxy-2212.dcdeploy.cloud:30395/database-db`
- ✅ All migrations tested
- ✅ Dockerfiles created

---

## 📋 Pre-Deployment Checklist

### 1. Database Migration ✅

The database URL is already provided:
```
postgresql://vtjFBU:AmYkzn-d79@database-lg6o89g7r9.tcp-proxy-2212.dcdeploy.cloud:30395/database-db
```

**Run migration script**:
```bash
cd backend
npm install
npx prisma migrate deploy
```

### 2. Environment Variables

Prepare these values:

**Backend Required**:
- `DATABASE_URL` - Provided above ✅
- `JWT_SECRET` - Generate 32+ character secret
- `PORT=3001`
- `NODE_ENV=production`
- `FRONTEND_URL` - Set after frontend deployment
- `ALLOWED_ORIGINS` - Set after frontend deployment

**Frontend Required**:
- `REACT_APP_API_URL` - Backend URL (set as build argument)

---

## 🚀 Backend Deployment

### Step 1: Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save this value - you'll need it in Step 3.

### Step 2: Create Backend Service in DCDeploy

1. **Go to DCDeploy Dashboard**: https://dash.dcdeploy.com
2. **Click "New Service"** → **"Web Service"**
3. **Configure Service**:

   **Basic Settings**:
   - **Name**: `homeoffice-backend`
   - **Repository**: Your GitHub repository URL
   - **Branch**: `main`
   - **Context**: `./backend`

   **Build Settings**:
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Port**: `3001`

### Step 3: Set Environment Variables

```env
NODE_ENV=production
PORT=3001

DATABASE_URL=postgresql://vtjFBU:AmYkzn-d79@database-lg6o89g7r9.tcp-proxy-2212.dcdeploy.cloud:30395/database-db

JWT_SECRET=<your-generated-jwt-secret-32-chars-minimum>

FRONTEND_URL=https://your-frontend-url.dcdeploy.cloud
ALLOWED_ORIGINS=https://your-frontend-url.dcdeploy.cloud
```

### Step 4: Deploy Backend

1. Save configuration
2. Monitor build logs
3. Note your backend URL

### Step 5: Verify Backend

```bash
curl https://your-backend-url.dcdeploy.cloud/api/health
```

Expected response:
```json
{"status":"ok"}
```

---

## 🚀 Frontend Deployment

### Step 1: Create Frontend Service in DCDeploy

1. **Go to DCDeploy Dashboard**
2. **Click "New Service"** → **"Web Service"**
3. **Configure Service**:

   **Basic Settings**:
   - **Name**: `homeoffice-frontend`
   - **Repository**: Your GitHub repository URL
   - **Branch**: `main`
   - **Context**: `./frontend`

   **Build Settings**:
   - **Dockerfile Path**: `./frontend/Dockerfile`
   - **Build Arguments**:
     ```
     REACT_APP_API_URL=https://your-backend-url.dcdeploy.cloud
     ```
   - **Port**: `80`

### Step 2: Deploy Frontend

1. Save configuration
2. Monitor build logs
3. Note your frontend URL

### Step 3: Update Backend CORS

After frontend is deployed, update backend environment variables:

```env
FRONTEND_URL=https://your-frontend-url.dcdeploy.cloud
ALLOWED_ORIGINS=https://your-frontend-url.dcdeploy.cloud
```

Then **redeploy backend** to apply CORS changes.

---

## ✅ Verification Checklist

### Backend
- [ ] Service status is "Running"
- [ ] Health endpoint returns 200 OK
- [ ] Database connection successful (check logs)
- [ ] API endpoints responding
- [ ] Authentication working

### Frontend
- [ ] Service status is "Running"
- [ ] Frontend loads in browser
- [ ] No console errors
- [ ] API calls working
- [ ] Authentication flow working
- [ ] Tasks can be created
- [ ] Performance dashboard works

---

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database is accessible
- Verify OpenSSL is installed (included in Dockerfile)

### CORS Errors
- Update `FRONTEND_URL` and `ALLOWED_ORIGINS` in backend
- Redeploy backend after updating CORS
- Clear browser cache

### Build Failures
- Check build logs in DCDeploy
- Verify Dockerfiles are in correct locations
- Ensure package-lock.json is committed

---

## 📝 Database Migration

To migrate database to production:

```bash
cd backend
export DATABASE_URL="postgresql://vtjFBU:AmYkzn-d79@database-lg6o89g7r9.tcp-proxy-2212.dcdeploy.cloud:30395/database-db"
npx prisma migrate deploy
```

This will apply all migrations to the production database.

---

**Document Version**: 1.0  
**Created**: January 9, 2025  
**Database**: DCDeploy PostgreSQL
