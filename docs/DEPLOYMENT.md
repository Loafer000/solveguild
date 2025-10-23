# Deployment Guide

## Production Deployment

### Prerequisites
- Node.js 16+ and npm 8+
- MongoDB (Atlas or self-hosted)
- Domain name and SSL certificate
- Cloud storage (Cloudinary/AWS S3)
- Payment processor (Razorpay)

### Environment Setup

#### Backend Environment Variables (Render)
```env
NODE_ENV=production
PORT=10000
CLIENT_URL=https://solveguild.vercel.app
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/solveguild
JWT_SECRET=your-super-secret-jwt-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RAZORPAY_KEY_ID=rzp_test_your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

#### Frontend Environment Variables (Vercel)
```env
REACT_APP_API_URL=https://solveguild-api.onrender.com/api
REACT_APP_SOCKET_URL=https://solveguild-api.onrender.com
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your-razorpay-key-id
```

## Deployment Options

### 1. Render (Backend) + Vercel (Frontend)

#### Backend on Render
1. **Connect Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` folder

2. **Configure Build Settings**
   ```yaml
   Build Command: npm install
   Start Command: npm start
   Environment: Node
   ```

3. **Set Environment Variables**
   - Add all backend environment variables
   - Enable auto-deploy from main branch

4. **Database Setup**
   - Create MongoDB Atlas cluster
   - Get connection string
   - Add to environment variables

#### Frontend on Vercel
1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder

2. **Configure Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "build",
     "installCommand": "npm install"
   }
   ```

3. **Set Environment Variables**
   - Add frontend environment variables
   - Enable auto-deploy from main branch

### 2. Alternative: Railway (Full Stack)

#### Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy backend
cd backend
railway up

# Deploy frontend
cd ../frontend
railway up
```

### 3. Alternative: DigitalOcean App Platform

#### App Platform Configuration
```yaml
# .do/app.yaml
name: solveguild
services:
- name: api
  source_dir: /backend
  github:
    repo: your-username/solveguild
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: MONGODB_URI
    value: ${MONGODB_URI}
    type: SECRET

- name: web
  source_dir: /frontend
  github:
    repo: your-username/solveguild
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: REACT_APP_API_URL
    value: https://api.solveguild.com
```

## Database Setup

### MongoDB Atlas
1. **Create Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create new cluster
   - Choose free tier (M0)

2. **Configure Network Access**
   - Add IP addresses (0.0.0.0/0 for all)
   - Or add specific IPs for security

3. **Create Database User**
   - Go to Database Access
   - Create new user with read/write permissions
   - Save username and password

4. **Get Connection String**
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with user password

### Local MongoDB (Development)
```bash
# Install MongoDB
sudo apt install mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database
mongo
use solveguild
```

## Payment Integration (Razorpay)

### Razorpay Setup
1. **Create Account**
   - Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
   - Sign up for developer account
   - Complete KYC verification

2. **Get API Keys**
   - Go to Settings → API Keys
   - Generate test/live keys
   - Copy Key ID and Key Secret

3. **Configure Webhooks**
   - Go to Settings → Webhooks
   - Add webhook URL: `https://your-api-domain.com/api/payments/webhook`
   - Select events: payment.captured, payment.failed, subscription.activated

4. **Test Integration**
   - Use test keys for development
   - Switch to live keys for production
   - Test payment flow thoroughly

## SSL Certificate
```bash
# Using Let's Encrypt (if self-hosting)
sudo apt install certbot
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

## Monitoring and Logging

### Render Monitoring
- Built-in metrics and logs
- Uptime monitoring
- Performance insights
- Error tracking

### Vercel Analytics
- Real-time performance metrics
- User analytics
- Core Web Vitals
- Function execution times

### Custom Monitoring
```javascript
// Add to backend/server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Backup Strategy

### Database Backup
```bash
# MongoDB backup script
#!/bin/bash
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/solveguild" --out /backup/$(date +%Y%m%d)
```

### File Backup
```bash
# Backup uploaded files
rsync -av /app/uploads/ /backup/uploads/
```

## Security Checklist
- [ ] SSL certificates installed
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Helmet security headers enabled
- [ ] Input validation implemented
- [ ] XSS protection enabled
- [ ] NoSQL injection protection enabled
- [ ] Payment webhook verification
- [ ] Regular security updates

## Performance Optimization
- [ ] CDN configured for static assets
- [ ] Database indexes optimized
- [ ] Caching implemented
- [ ] Image optimization enabled
- [ ] Gzip compression enabled
- [ ] Database connection pooling
- [ ] Load balancing configured

## Troubleshooting

### Common Issues
1. **CORS Errors**
   - Check CORS configuration in backend
   - Verify frontend URL in CORS settings

2. **Database Connection**
   - Verify MongoDB URI
   - Check network access settings
   - Ensure database user has proper permissions

3. **Payment Issues**
   - Verify Razorpay keys
   - Check webhook configuration
   - Test with test mode first

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

### Debug Commands
```bash
# Check backend logs
railway logs

# Check frontend build
vercel logs

# Test API endpoints
curl https://your-api-domain.com/api/health

# Test payment webhook
curl -X POST https://your-api-domain.com/api/payments/webhook
```