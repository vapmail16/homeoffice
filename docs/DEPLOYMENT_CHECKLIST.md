# Home Office - Deployment Checklist

## Pre-Deployment

### Database
- [ ] Database URL configured: `postgresql://vtjFBU:AmYkzn-d79@database-lg6o89g7r9.tcp-proxy-2212.dcdeploy.cloud:30395/database-db`
- [ ] Migrations tested locally
- [ ] Run `./backend/migrate-production.sh` to migrate database

### Code
- [ ] All tests passing
- [ ] Code committed and pushed to repository
- [ ] Dockerfiles created
- [ ] Environment variables documented

## Backend Deployment

- [ ] Create backend service in DCDeploy
- [ ] Set context: `./backend`
- [ ] Set Dockerfile path: `./backend/Dockerfile`
- [ ] Set port: `3001`
- [ ] Set environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3001`
  - [ ] `DATABASE_URL` (from above)
  - [ ] `JWT_SECRET` (generate 32+ chars)
  - [ ] `FRONTEND_URL` (placeholder, update after frontend deploy)
  - [ ] `ALLOWED_ORIGINS` (placeholder, update after frontend deploy)
- [ ] Deploy backend
- [ ] Verify health endpoint: `GET /api/health`
- [ ] Check logs for "Database connected successfully"

## Frontend Deployment

- [ ] Create frontend service in DCDeploy
- [ ] Set context: `./frontend`
- [ ] Set Dockerfile path: `./frontend/Dockerfile`
- [ ] Set port: `80`
- [ ] Set build argument: `REACT_APP_API_URL=https://backend-url.dcdeploy.cloud`
- [ ] Deploy frontend
- [ ] Note frontend URL

## Post-Deployment

- [ ] Update backend CORS:
  - [ ] Update `FRONTEND_URL` environment variable
  - [ ] Update `ALLOWED_ORIGINS` environment variable
  - [ ] Redeploy backend
- [ ] Test complete flow:
  - [ ] User registration
  - [ ] User login
  - [ ] Create task
  - [ ] Mark task complete
  - [ ] View performance dashboard
  - [ ] Create backlog task

## Verification

- [ ] Backend health check: ✅
- [ ] Database connection: ✅
- [ ] Frontend loads: ✅
- [ ] API calls work: ✅
- [ ] Authentication works: ✅
- [ ] Tasks CRUD works: ✅
- [ ] Performance dashboard works: ✅
- [ ] Backlog feature works: ✅
