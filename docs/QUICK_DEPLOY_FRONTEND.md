# 🚀 Frontend Deployment - Quick Reference

## ✅ Backend Status
**URL**: https://backend-lg6o89g7r9.dcdeploy.cloud  
**Status**: ✅ Deployed

---

## 📋 DCDeploy Settings

### Basic Configuration
- **Service Name**: `homeoffice-frontend`
- **Repository**: `https://github.com/vapmail16/homeoffice.git`
- **Branch**: `main`
- **Context**: `./frontend` ⚠️
- **Dockerfile**: `./frontend/Dockerfile`
- **Port**: `80`

### Build Arguments (Required!)
```
REACT_APP_API_URL=https://backend-lg6o89g7r9.dcdeploy.cloud
```

---

## ⚠️ Critical Points

1. **Context MUST be**: `./frontend` (not `frontend` or root)
2. **Build Argument MUST be set** (not runtime env var)
3. **After deployment**: Update backend CORS with frontend URL

---

## 🔄 After Deployment

1. Get frontend URL from DCDeploy
2. Update backend env vars:
   ```env
   FRONTEND_URL=https://your-frontend-url.dcdeploy.cloud
   ALLOWED_ORIGINS=https://your-frontend-url.dcdeploy.cloud
   ```
3. Redeploy backend

---

**Ready to deploy!** 🎉
