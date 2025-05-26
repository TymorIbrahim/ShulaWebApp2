# 🚀 Deploy Shula Web App to AWS Free Tier

Deploy your Shula web app to AWS using the free tier - **$0/month for the first year!**

## ⚡ Quick Start (5 minutes)

### 0. Create AWS Account (First Time Only)
1. Go to **[aws.amazon.com](https://aws.amazon.com)**
2. Click **"Create an AWS Account"**
3. Enter email, contact info, and payment method
4. Complete phone verification
5. Choose **"Basic support - Free"**

**Note**: You need a credit card but won't be charged with free tier usage!

### 1. Setup AWS (One-time)
```bash
./scripts/aws-setup.sh
```
This script will:
- Install/configure AWS CLI
- Create S3 bucket for frontend
- Setup static website hosting
- Optionally create CloudFront distribution

### 2. Setup Custom Domain (Optional but Recommended)
```bash
npm run aws:domain
```
Choose a domain like:
- `shula-rentals.com`
- `shulaequipment.com` 
- `rentshula.com`

### 3. Deploy Frontend to S3
```bash
./scripts/deploy-frontend.sh
```

### 4. Deploy Backend to EC2
First launch an EC2 instance (see guide below), then:
```bash
./scripts/deploy-backend.sh
```

**That's it! Your app is live on AWS! 🎉**

---

## 📋 Prerequisites

- **AWS Account** (free tier eligible) ⬅️ **You need to create this first**
- **GitHub repository** with your code
- **MongoDB Atlas** (already configured ✅)

---

## 🖥️ EC2 Instance Setup (One-time)

### Launch Instance
1. Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Click **"Launch Instance"**
3. Choose **Amazon Linux 2** (Free tier eligible)
4. Instance type: **t2.micro** (Free tier)
5. **Security Group** - Allow these ports:
   - SSH (22): Your IP only
   - HTTP (80): Anywhere
   - Custom TCP (5002): Anywhere
6. Create/download key pair
7. **Launch Instance**

### Connect to Instance
```bash
# Make key file secure
chmod 400 your-key.pem

# Connect to instance
ssh -i your-key.pem ec2-user@YOUR-EC2-PUBLIC-IP
```

### Initial Server Setup
```bash
# Update system
sudo yum update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git

# Install PM2 globally
sudo npm install -g pm2

# Create environment file
nano .env
```

Add your environment variables:
```env
MONGO_URI=mongodb+srv://Tymor:Tymor123@shulacluster.ged8w.mongodb.net/ShulaDB?retryWrites=true&w=majority&appName=ShulaCluster
PORT=5002
JWT_SECRET=yourStrongSecretHere123!@#$
NODE_ENV=production
FRONTEND_URL=https://your-s3-bucket.s3-website-us-east-1.amazonaws.com
```

---

## 🔄 Regular Updates

### Update Frontend
```bash
./scripts/deploy-frontend.sh
```

### Update Backend
```bash
./scripts/deploy-backend.sh
```

---

## 💰 AWS Free Tier Limits

✅ **EC2**: 750 hours/month (t2.micro)  
✅ **S3**: 5GB storage + 20,000 GET requests  
✅ **CloudFront**: 50GB data transfer  
✅ **Data Transfer**: 15GB/month outbound  

**Total Cost: $0/month for 12 months** 🎉

---

## 🔗 Your App URLs

After deployment:
- **Frontend**: `https://your-cloudfront-domain.cloudfront.net`
- **Backend API**: `http://your-ec2-ip:5002`
- **S3 Direct**: `http://your-bucket.s3-website-us-east-1.amazonaws.com`

---

## 🆘 Troubleshooting

### Common Issues

**CORS Errors:**
- Update backend CORS settings with your frontend URL
- Restart backend: `pm2 restart shula-backend`

**Frontend 404 Errors:**
- Ensure CloudFront error pages redirect to `index.html`

**API Not Accessible:**
- Check EC2 security group allows port 5002
- Verify backend is running: `pm2 status`

### Useful Commands

```bash
# Check backend logs
ssh -i key.pem ec2-user@your-ip 'pm2 logs'

# Restart backend
ssh -i key.pem ec2-user@your-ip 'pm2 restart shula-backend'

# Test API
curl http://your-ec2-ip:5002/api/test-rate-limit
```

---

## 🔒 Security (Optional)

### SSL Certificate (Free)
```bash
# On EC2 instance
sudo yum install -y certbot
sudo certbot certonly --standalone -d your-domain.com
```

### Domain Name
- Register domain with Route 53 ($12/year)
- Point to CloudFront distribution
- Get free SSL certificate

---

## 📊 Monitoring

AWS provides free monitoring:
- **CloudWatch**: Server metrics, logs, alarms
- **S3 Analytics**: Usage statistics
- **CloudFront Reports**: Traffic analytics

---

## 🚀 Advanced Deployment

For production scaling:
- **Load Balancer**: Distribute traffic
- **Auto Scaling**: Handle traffic spikes
- **RDS**: Managed database (if moving from Atlas)
- **Lambda**: Serverless functions

---

**Need help?** Check the detailed guide: `deploy-aws.md` 