# Production Environment Variables - DCDeploy

Copy these to DCDeploy backend service environment variables:

```env
NODE_ENV=production
PORT=3001

DATABASE_URL=postgresql://vtjFBU:AmYkzn-d79@database-lg6o89g7r9.tcp-proxy-2212.dcdeploy.cloud:30395/database-db

JWT_SECRET=<generate-32-char-secret>

FRONTEND_URL=https://your-frontend-url.dcdeploy.cloud
ALLOWED_ORIGINS=https://your-frontend-url.dcdeploy.cloud
```

**Generate JWT_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important**:
- Update `FRONTEND_URL` and `ALLOWED_ORIGINS` after frontend deployment
- Redeploy backend after updating CORS settings
