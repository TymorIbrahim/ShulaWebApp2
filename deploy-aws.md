# 🚀 AWS Deployment Guide for Shula Web App

## Overview
This guide will help you deploy your Shula web app to AWS free tier:
- **Frontend**: React app on S3 + CloudFront
- **Backend**: Node.js API on EC2/Elastic Beanstalk  
- **Database**: MongoDB Atlas (already configured)

## Prerequisites
- AWS Account (free tier eligible)
- AWS CLI installed
- Your app is ready for production

---

## 🎯 Phase 1: Frontend Deployment (S3 + CloudFront)

### Step 1: Build React App for Production
```bash
cd frontend
npm run build
```

### Step 2: Create S3 Bucket
1. Go to **AWS S3 Console**
2. Click **"Create bucket"**
3. Name: `shula-webapp-frontend` (must be globally unique)
4. Region: Choose closest to your users
5. **Uncheck** "Block all public access"
6. Create bucket

### Step 3: Configure S3 for Static Website Hosting
1. Select your bucket → **Properties** tab
2. Scroll to **"Static website hosting"**
3. Click **Edit** → **Enable**
4. **Index document**: `index.html`
5. **Error document**: `index.html` (for React routing)
6. **Save changes**

### Step 4: Upload Built Files
```bash
# Install AWS CLI if not already installed
npm install -g aws-cli

# Configure AWS credentials
aws configure

# Upload build files to S3
cd frontend/build
aws s3 sync . s3://shula-webapp-frontend --delete
```

### Step 5: Set S3 Bucket Policy (Public Read)
In S3 Console → **Permissions** → **Bucket Policy**:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::shula-webapp-frontend/*"
        }
    ]
}
```

### Step 6: Setup CloudFront (CDN)
1. Go to **CloudFront Console**
2. **Create Distribution**
3. **Origin Domain**: Your S3 bucket endpoint
4. **Default Root Object**: `index.html`
5. **Error Pages**: Add custom error response:
   - HTTP Error Code: `403, 404`
   - Response Page Path: `/index.html`
   - HTTP Response Code: `200`
6. **Create Distribution**

Your frontend will be available at the CloudFront URL!

---

## 🖥️ Phase 2: Backend Deployment (EC2)

### Option A: EC2 Manual Setup

#### Step 1: Launch EC2 Instance
1. Go to **EC2 Console** → **Launch Instance**
2. Choose **Amazon Linux 2** (free tier eligible)
3. Instance Type: **t2.micro** (free tier)
4. Configure Security Group:
   - SSH (22): Your IP
   - HTTP (80): Anywhere
   - HTTPS (443): Anywhere
   - Custom TCP (5002): Anywhere (for API)
5. Create/Select Key Pair
6. **Launch Instance**

#### Step 2: Connect and Setup Server
```bash
# Connect to EC2
ssh -i your-key.pem ec2-user@your-ec2-public-ip

# Update system
sudo yum update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install -y git

# Clone your repository
git clone https://github.com/TymorIbrahim/ShulaWebApp2.git
cd ShulaWebApp2/backend

# Install dependencies
npm install

# Install PM2 for process management
sudo npm install -g pm2

# Create environment file
sudo nano .env
```

#### Step 3: Environment Variables (.env)
```env
MONGO_URI=mongodb+srv://Tymor:Tymor123@shulacluster.ged8w.mongodb.net/ShulaDB?retryWrites=true&w=majority&appName=ShulaCluster
PORT=5002
JWT_SECRET=yourRandomStrongSecretKeyHere123!@#$
NODE_ENV=production
FRONTEND_URL=https://your-cloudfront-domain.cloudfront.net
```

#### Step 4: Start Application
```bash
# Start with PM2
pm2 start server.js --name "shula-backend"

# Setup PM2 to restart on boot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs
```

### Option B: Elastic Beanstalk (Easier)

#### Step 1: Prepare Application
```bash
# Create deployment package
cd backend
zip -r shula-backend.zip . -x "node_modules/*" ".git/*"
```

#### Step 2: Deploy to Elastic Beanstalk
1. Go to **Elastic Beanstalk Console**
2. **Create Application**
3. **Application name**: `shula-backend`
4. **Platform**: Node.js
5. **Upload Code**: Select `shula-backend.zip`
6. **Create Application**

#### Step 3: Configure Environment Variables
In Elastic Beanstalk → **Configuration** → **Software**:
- `MONGO_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret
- `NODE_ENV`: `production`
- `FRONTEND_URL`: Your CloudFront URL

---

## 🔧 Phase 3: Connect Frontend to Backend

### Update Frontend API URL
In your React app, update environment variables:

Create `frontend/.env.production`:
```env
REACT_APP_API_URL=https://your-backend-url.com
```

### Rebuild and Deploy Frontend
```bash
cd frontend
npm run build
aws s3 sync build/ s3://shula-webapp-frontend --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR-DISTRIBUTION-ID --paths "/*"
```

---

## 🔒 Phase 4: Security & Optimization

### Backend Security (EC2)
```bash
# Setup firewall
sudo yum install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Allow only necessary ports
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=5002/tcp
sudo firewall-cmd --reload
```

### SSL Certificate (Free with Let's Encrypt)
```bash
# Install Certbot
sudo yum install -y certbot

# Get certificate (replace with your domain)
sudo certbot certonly --standalone -d your-domain.com

# Setup auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

---

## 📊 Phase 5: Monitoring & Maintenance

### CloudWatch (Free tier includes)
- Monitor EC2 instance metrics
- Set up alarms for high CPU/memory usage
- Track application logs

### Backup Strategy
- **MongoDB**: Atlas handles backups
- **Code**: Already in GitHub
- **Uploads**: Sync to S3 bucket periodically

---

## 💰 Cost Estimate (Free Tier)
- **EC2 t2.micro**: FREE (750 hours/month for 12 months)
- **S3 Storage**: FREE (5GB for 12 months)  
- **CloudFront**: FREE (50GB data transfer + 2M requests/month)
- **Data Transfer**: FREE (15GB/month)

**Total**: $0/month for the first year! 🎉

---

## 🚀 Deployment Commands Summary

### One-time Setup
```bash
# 1. Build frontend
cd frontend && npm run build

# 2. Upload to S3
aws s3 sync build/ s3://shula-webapp-frontend

# 3. Deploy backend to EC2/EB
# (Follow steps above)
```

### Regular Updates
```bash
# Update frontend
cd frontend
npm run build
aws s3 sync build/ s3://shula-webapp-frontend --delete
aws cloudfront create-invalidation --distribution-id YOUR-ID --paths "/*"

# Update backend (EC2)
ssh -i key.pem ec2-user@your-ip
cd ShulaWebApp2
git pull
cd backend
npm install
pm2 restart shula-backend
```

---

## 🆘 Troubleshooting

### Common Issues
1. **CORS Errors**: Update backend CORS settings with your CloudFront URL
2. **404 on React Routes**: Ensure CloudFront error pages redirect to index.html
3. **API Connection**: Check security groups allow port 5002
4. **Environment Variables**: Verify all environment variables are set correctly

### Useful Commands
```bash
# Check backend logs
pm2 logs shula-backend

# Check EC2 instance status
aws ec2 describe-instances

# Test API endpoint
curl https://your-backend-url.com/api/test-rate-limit
```

Your Shula web app will be live on AWS! 🌟 