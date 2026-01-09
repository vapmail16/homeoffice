# Frontend Deployment Guide - Home Office

**Backend URL**: https://backend-lg6o89g7r9.dcdeploy.cloud  
**Status**: ✅ Ready for Deployment

---

## 🚀 Quick Deployment Steps

### Step 1: Create Frontend Service in DCDeploy

1. Go to DCDeploy Dashboard: https://dash.dcdeploy.com
2. Click **"New Service"** → **"Web Service"**
3. Configure Service:

   **Basic Settings**:
   - **Name**: `homeoffice-frontend`
   - **Repository**: `https://github.com/vapmail16/homeoffice.git`
   - **Branch**: `main`
   - **Context**: `./frontend` ⚠️ **Important: Set this!**

   **Build Settings**:
   - **Dockerfile Path**: `./frontend/Dockerfile`
   - **Build Arguments**: ⚠️ **CRITICAL - Set this:**
     ```
     REACT_APP_API_URL=https://backend-lg6o89g7r9.dcdeploy.cloud
     ```
   - **Port**: `80`

   **Runtime**:
   - **Machine Type**: Choose based on your needs
   - **Region**: Your preferred region

### Step 2: Deploy

1. **Save Configuration**
2. **Click "Deploy"**
3. **Monitor Build Logs**

### Step 3: Verify Deployment

After deployment:
1. Note your frontend URL (e.g., `https://homeoffice-frontend-xxxxx.dcdeploy.cloud`)
2. Open in browser
3. Check browser console for errors
4. Test login/registration

### Step 4: Update Backend CORS

1. Go to **Backend Service** → **Environment Variables**
2. Update:
   ```env
   FRONTEND_URL=https://your-frontend-url.dcdeploy.cloud
   ALLOWED_ORIGINS=https://your-frontend-url.dcdeploy.cloud
   ```
3. **Redeploy Backend** (CORS changes require redeploy)

---

## ⚠️ Important Notes

### Build Argument (Critical!)
- `REACT_APP_API_URL` **MUST** be set as a **Build Argument** in DCDeploy
- It is **NOT** a runtime environment variable
- It is injected during Docker build
- Value: `https://backend-lg6o89g7r9.dcdeploy.cloud`

### Context Path
- Set Context to `./frontend` (not just `frontend` or root)
- This tells DCDeploy where the frontend code is located

---

## 🔍 Verification Checklist

After deployment:
- [ ] Frontend loads in browser
- [ ] No console errors
- [ ] API calls work (check Network tab)
- [ ] Login page loads
- [ ] Registration works
- [ ] Tasks can be created
- [ ] Performance dashboard works

---

## 🐛 Troubleshooting

### Issue: API Calls Fail
**Solution**: 
- Verify `REACT_APP_API_URL` build argument is set correctly
- Rebuild frontend with correct build argument
- Check browser console Network tab for API call URLs

### Issue: CORS Errors
**Solution**:
- Update backend `FRONTEND_URL` and `ALLOWED_ORIGINS`
- Redeploy backend
- Clear browser cache

### Issue: 404 on Routes
**Solution**:
- Verify `nginx.conf` is included in Dockerfile
- Check nginx configuration

---

## 📋 Build Arguments for DCDeploy

**Copy this exactly:**
```
REACT_APP_API_URL=https://backend-lg6o89g7r9.dcdeploy.cloud
```

---

**Ready to deploy!** 🚀
