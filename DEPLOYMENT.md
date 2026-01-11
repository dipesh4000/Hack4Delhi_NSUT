# Complete Deployment Guide - Pollution Dashboard

## 🚀 Quick Start Deployment

This guide will help you deploy your pollution dashboard end-to-end in production.

---

## Prerequisites

Before starting, ensure you have:
- ✅ GitHub account
- ✅ MongoDB Atlas account (free tier available)
- ✅ Vercel account (free tier available)
- ✅ Railway or Render account (free tier available)
- ✅ WAQI API token ([Get it here](https://aqicn.org/data-platform/token/))
- ✅ Domain name (optional, but recommended)

---

## Step 1: Database Setup (MongoDB Atlas)

### 1.1 Create Cluster

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click **"Create"** → **"Shared"** (Free M0 Sandbox)
4. Choose:
   - **Cloud Provider**: AWS
   - **Region**: Mumbai (ap-south-1) or closest to your users
   - **Cluster Name**: `pollution-dashboard`
5. Click **"Create Cluster"**

### 1.2 Configure Database Access

1. Go to **Database Access** → **Add New Database User**
   ```
   Username: pollution-admin
   Password: <generate strong password - save this!>
   Role: Atlas Admin
   ```

2. Go to **Network Access** → **Add IP Address**
   ```
   IP Address: 0.0.0.0/0
   Description: Allow from anywhere
   ```
   > ⚠️ **Production Note**: For better security, restrict to specific IPs after deployment

### 1.3 Get Connection String

1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. **Save this connection string** - you'll need it later

---

## Step 2: Backend Deployment (Railway)

### 2.1 Install Railway CLI

```bash
npm install -g @railway/cli
```

### 2.2 Login and Initialize

```bash
# Login to Railway
railway login

# Navigate to backend directory
cd backend

# Initialize Railway project
railway init

# When prompted:
# - Choose: "Create new project"
# - Project name: pollution-dashboard-backend
```

### 2.3 Set Environment Variables

```bash
# Set MongoDB connection string
railway variables set MONGO_URI="mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority"

# Set WAQI token
railway variables set WAQI_TOKEN="your-waqi-token-here"

# Set JWT secret (generate a random string)
railway variables set JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

# Set environment
railway variables set NODE_ENV="production"

# Set port
railway variables set PORT="5001"
```

### 2.4 Deploy Backend

```bash
railway up
```

Wait for deployment to complete (usually 2-3 minutes).

### 2.5 Get Backend URL

```bash
railway domain
```

You'll get a URL like: `pollution-dashboard-backend.up.railway.app`

**Save this URL** - you'll need it for frontend deployment.

---

## Step 3: Frontend Deployment (Vercel)

### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 3.2 Deploy Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Deploy to Vercel
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? <Your account>
# - Link to existing project? No
# - Project name? pollution-dashboard
# - Directory? ./
# - Override settings? No
```

### 3.3 Set Environment Variables

```bash
# Set backend URL (use the Railway URL from Step 2.5)
vercel env add NEXT_PUBLIC_BACKEND_URL production
# Enter: https://pollution-dashboard-backend.up.railway.app

# Set WAQI token
vercel env add NEXT_PUBLIC_WAQI_TOKEN production
# Enter: your-waqi-token

# Optional: Set for preview deployments
vercel env add NEXT_PUBLIC_BACKEND_URL preview
# Enter: https://pollution-dashboard-backend.up.railway.app

vercel env add NEXT_PUBLIC_WAQI_TOKEN preview
# Enter: your-waqi-token
```

### 3.4 Deploy to Production

```bash
vercel --prod
```

You'll get a URL like: `pollution-dashboard.vercel.app`

---

## Step 4: Update CORS Settings

### 4.1 Update Backend CORS

Edit `backend/src/server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://pollution-dashboard.vercel.app',
    'https://pollution-dashboard-*.vercel.app', // Preview deployments
    'https://yourdomain.com' // Add your custom domain if you have one
  ],
  credentials: true
}));
```

### 4.2 Redeploy Backend

```bash
cd backend
railway up
```

---

## Step 5: Data Pipeline Automation

Choose **Option A** (recommended) or **Option B**:

### Option A: GitHub Actions (Recommended)

#### 5.1 Create Workflow Directory

```bash
mkdir -p .github/workflows
```

#### 5.2 Add GitHub Secret

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
   - Name: `WAQI_TOKEN`
   - Value: your-waqi-token
4. Click **Add secret**

#### 5.3 Create Workflow File

Create `.github/workflows/update-ward-data.yml`:

```yaml
name: Update Ward Data

on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:  # Allow manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd data-pipeline
          npm install
      
      - name: Run pipeline
        env:
          WAQI_TOKEN: ${{ secrets.WAQI_TOKEN }}
        run: |
          cd data-pipeline
          node run-pipeline.js
      
      - name: Commit and push changes
        run: |
          git config --global user.name 'GitHub Actions Bot'
          git config --global user.email 'actions@github.com'
          git add data-pipeline/ward_data/dynamic_ward_data/
          git diff --quiet && git diff --staged --quiet || git commit -m "chore: update ward data [skip ci]"
          git push
```

#### 5.4 Commit and Push

```bash
git add .github/workflows/update-ward-data.yml
git commit -m "Add automated ward data updates"
git push
```

The workflow will now run every hour automatically!

### Option B: Backend Cron Job

#### 5.1 Install node-cron

```bash
cd backend
npm install node-cron
```

#### 5.2 Add to server.js

Add this code to `backend/src/server.js`:

```javascript
const cron = require('node-cron');
const { WardDataPipeline } = require('./services/wardDataPipeline');

// Run every hour at minute 0
cron.schedule('0 * * * *', async () => {
  console.log('🔄 Running ward data pipeline...');
  try {
    const pipeline = new WardDataPipeline();
    await pipeline.processAllZones();
    console.log('✅ Ward data updated successfully');
  } catch (error) {
    console.error('❌ Pipeline error:', error);
  }
});

console.log('⏰ Cron job scheduled: Ward data will update every hour');
```

#### 5.3 Redeploy Backend

```bash
railway up
```

---

## Step 6: Custom Domain (Optional)

### 6.1 Frontend Domain (Vercel)

```bash
vercel domains add yourdomain.com
```

Follow the DNS configuration instructions provided by Vercel.

### 6.2 Backend Domain (Railway)

```bash
railway domain add api.yourdomain.com
```

Add a CNAME record in your DNS:
```
Type: CNAME
Name: api
Value: your-project.up.railway.app
```

### 6.3 Update CORS

Don't forget to add your custom domain to the CORS whitelist in Step 4!

---

## Step 7: Monitoring & Analytics

### 7.1 Error Tracking (Sentry)

```bash
# Install Sentry
npm install @sentry/nextjs @sentry/node

# Frontend setup
cd frontend
npx @sentry/wizard@latest -i nextjs

# Backend setup
cd ../backend
npx @sentry/wizard@latest -i express
```

### 7.2 Analytics (Google Analytics)

```bash
cd frontend
npm install @next/third-parties
```

Add to `frontend/app/layout.tsx`:

```typescript
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
      <GoogleAnalytics gaId="G-XXXXXXXXXX" />
    </html>
  )
}
```

### 7.3 Uptime Monitoring (UptimeRobot)

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up (free)
3. Add New Monitor:
   - **Type**: HTTP(s)
   - **Friendly Name**: Pollution Dashboard
   - **URL**: `https://pollution-dashboard.vercel.app`
   - **Monitoring Interval**: 5 minutes
4. Add email/SMS alerts

---

## 🧪 Testing Your Deployment

### Test Backend API

```bash
# Test wards endpoint
curl https://pollution-dashboard-backend.up.railway.app/api/pollution/wards

# Should return JSON with 250 wards
```

### Test Frontend

1. Visit: `https://pollution-dashboard.vercel.app`
2. Navigate to `/citizen/wards`
3. Verify real AQI values are displayed
4. Check that ward rankings are correct
5. Test ward selector functionality

### Test Alerts Page

1. Visit: `https://pollution-dashboard.vercel.app/citizen/alerts`
2. Verify AI insights load
3. Test severity filters
4. Check animations work smoothly

---

## 📋 Deployment Checklist

Use this checklist to ensure everything is set up correctly:

- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with proper permissions
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string saved securely
- [ ] Backend deployed to Railway
- [ ] Backend environment variables set (MONGO_URI, WAQI_TOKEN, JWT_SECRET, NODE_ENV, PORT)
- [ ] Backend URL obtained and saved
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables set (NEXT_PUBLIC_BACKEND_URL, NEXT_PUBLIC_WAQI_TOKEN)
- [ ] CORS settings updated in backend
- [ ] Data pipeline automated (GitHub Actions or cron)
- [ ] Custom domains configured (optional)
- [ ] SSL certificates active (automatic with Vercel/Railway)
- [ ] Error monitoring setup (Sentry)
- [ ] Analytics configured (Google Analytics)
- [ ] Uptime monitoring setup (UptimeRobot)
- [ ] All endpoints tested and working
- [ ] Performance verified
- [ ] Mobile responsiveness checked

---

## 🔧 Troubleshooting

### Issue: Ward data not loading

**Symptoms**: Frontend shows "Loading..." or empty ward list

**Solutions**:
1. Check backend logs: `railway logs`
2. Verify WAQI_TOKEN is valid
3. Test backend endpoint directly with curl
4. Check browser console for CORS errors

### Issue: CORS errors

**Symptoms**: Browser console shows "blocked by CORS policy"

**Solutions**:
1. Verify frontend URL is in backend CORS whitelist
2. Include preview deployment URLs (`*.vercel.app`)
3. Redeploy backend after CORS changes
4. Clear browser cache

### Issue: Environment variables not working

**Symptoms**: Backend can't connect to database or API calls fail

**Solutions**:
1. List variables: `railway variables`
2. Verify no typos in variable names
3. Check for special characters in values (escape if needed)
4. Redeploy after setting variables

### Issue: Data pipeline not running

**Symptoms**: Ward data is outdated

**Solutions**:
1. **GitHub Actions**: Check Actions tab for errors
2. **Cron Job**: Check backend logs for cron execution
3. Verify WAQI_TOKEN is set correctly
4. Manually trigger: `railway run node data-pipeline/run-pipeline.js`

### Issue: Slow performance

**Symptoms**: Pages load slowly, API responses are delayed

**Solutions**:
1. Enable database indexes
2. Add Redis caching layer
3. Use CDN for static assets
4. Optimize images with Next.js Image component
5. Check Railway/Vercel resource usage

---

## 🚀 Performance Optimization

### Frontend Optimizations

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  swcMinify: true,
}
```

### Backend Optimizations

```javascript
// Add compression
const compression = require('compression');
app.use(compression());

// Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### Database Optimizations

```javascript
// Create indexes in MongoDB
db.wards.createIndex({ ward_number: 1 });
db.wards.createIndex({ aqi: 1 });
db.wards.createIndex({ zone: 1 });
```

---

## 📊 Monitoring Dashboard

After deployment, monitor these metrics:

1. **Uptime**: Should be >99.9%
2. **Response Time**: <500ms for API calls
3. **Error Rate**: <0.1%
4. **Database Connections**: Monitor for leaks
5. **Memory Usage**: Should stay below 80%
6. **API Rate Limits**: Track WAQI API usage

---

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Rotate keys every 90 days
3. **Database**: Use strong passwords (20+ characters)
4. **CORS**: Restrict to specific domains in production
5. **Rate Limiting**: Implement on all public endpoints
6. **HTTPS**: Always use HTTPS (automatic with Vercel/Railway)
7. **Dependencies**: Run `npm audit` regularly

---

## 📚 Additional Resources

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/actions)

---

## 🎉 Deployment Complete!

Your pollution dashboard is now live and running in production!

**Frontend**: `https://pollution-dashboard.vercel.app`  
**Backend**: `https://pollution-dashboard-backend.up.railway.app`

### Next Steps:

1. ✅ Share the URL with stakeholders
2. ✅ Monitor error rates and performance
3. ✅ Set up automated backups
4. ✅ Plan for scaling (if needed)
5. ✅ Implement additional features from the roadmap

---

**Need help?** Create an issue on GitHub or check the troubleshooting section above.

**Happy Deploying! 🚀**
