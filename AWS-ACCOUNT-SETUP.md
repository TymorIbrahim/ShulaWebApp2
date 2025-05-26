# 🏗️ Create Your AWS Account (Step by Step)

This guide will walk you through creating your AWS account to deploy your Shula web app.

## 🎯 Why AWS Free Tier?

- ✅ **$0/month for 12 months**
- ✅ Perfect for learning and small projects
- ✅ Professional cloud hosting experience
- ✅ Easy to scale when you grow

---

## 📝 Step-by-Step Account Creation

### Step 1: Go to AWS Website
1. Open your browser and go to **[aws.amazon.com](https://aws.amazon.com)**
2. Click the **"Create an AWS Account"** button (usually orange/yellow)

### Step 2: Account Details
You'll see a form asking for:
- **Email address**: Use your personal or business email
- **Password**: Create a strong password
- **AWS account name**: Choose something like "Shula-Project" or your name

Click **Continue**

### Step 3: Contact Information
You'll need to provide:
- **Account type**: Choose **Personal** (unless this is for a business)
- **Full name**
- **Phone number**
- **Country/Region**
- **Address**

**Important**: This information must be accurate for billing purposes.

Click **Create Account and Continue**

### Step 4: Payment Information 💳
**Don't worry!** You won't be charged if you stay within free tier limits.

- **Credit/Debit Card**: You must provide a valid card
- **Billing address**: Confirm or update if different

**Why a credit card?**
- AWS needs it for identity verification
- Protection against abuse
- In case you exceed free tier (you'll get alerts first!)

Click **Verify and Continue**

### Step 5: Identity Verification 📱
AWS will verify your identity via phone:

1. **Phone number**: Enter your mobile number
2. **Verification method**: Choose **Text message (SMS)** or **Voice call**
3. You'll receive a 4-digit code
4. Enter the code in the verification screen

Click **Continue**

### Step 6: Choose Support Plan
You'll see different support options:

- **Basic Support**: **FREE** ⬅️ **Choose this one!**
- Developer Support: $29/month
- Business Support: $100/month

**Select "Basic Support - Free"** and click **Complete sign up**

### Step 7: Welcome to AWS! 🎉
You'll see a welcome screen. You can now:
- Explore the AWS Management Console
- Set up billing alerts (recommended!)
- Start using AWS services

---

## 🚨 Important Next Steps

### 1. Set Up Billing Alerts
**Do this immediately to avoid surprise charges!**

1. Go to **Billing & Cost Management**
2. Click **Billing preferences**
3. Check **"Receive Billing Alerts"**
4. Create alerts for:
   - $1 (early warning)
   - $5 (getting close to paid usage)
   - $10 (definitely exceeded free tier)

### 2. Enable MFA (Multi-Factor Authentication)
Secure your account:
1. Click your account name (top right)
2. Go to **Security credentials**
3. Enable **MFA** using your phone

### 3. Note Your Account Details
Save these for reference:
- **AWS Account ID**: 12-digit number
- **Login email**: Your AWS account email
- **Region**: Where your resources will be created

---

## 💰 Free Tier Limits (12 Months)

What you get FREE with your new account:

### Compute (EC2)
- ✅ **750 hours/month** of t2.micro instances
- ✅ Perfect for your Shula backend

### Storage (S3)
- ✅ **5 GB** of standard storage
- ✅ **20,000 GET requests**
- ✅ **2,000 PUT requests**
- ✅ Perfect for your Shula frontend

### Content Delivery (CloudFront)
- ✅ **50 GB** data transfer out
- ✅ **2,000,000** HTTP/HTTPS requests
- ✅ Makes your app fast worldwide

### Data Transfer
- ✅ **15 GB** data transfer out per month
- ✅ Covers typical web app usage

**Total Value**: ~$200/month worth of services for FREE! 🎉

---

## ⚠️ How to Stay Within Free Tier

### Do's ✅
- Use **t2.micro** instances only
- Monitor your usage in billing dashboard
- Set up billing alerts
- Stop/start EC2 instances when not needed
- Use S3 for static file hosting

### Don'ts ❌
- Don't launch larger instance types
- Don't store more than 5GB in S3
- Don't forget to set up monitoring
- Don't ignore billing alerts

---

## 🔧 Troubleshooting Account Creation

### Common Issues:

**Credit Card Rejected**
- Try a different card
- Contact your bank (they might block international transactions)
- Ensure billing address matches card

**Phone Verification Failed**
- Check you entered the correct number
- Try voice call instead of SMS
- Wait a few minutes and try again

**Email Verification**
- Check spam folder
- Ensure email address is typed correctly
- Try a different email provider

**Account Under Review**
- AWS might review new accounts (can take 24 hours)
- You'll get an email when approved
- This is normal security procedure

---

## 🚀 Ready for Deployment!

Once your AWS account is created and verified:

1. **Return to your Shula project**
2. **Run**: `npm run aws:setup` (configures AWS CLI)
3. **Run**: `npm run aws:domain` (optional: set up custom domain)
4. **Follow the deployment guide**: `README-AWS.md`

**Your Shula web app will be live on the internet! 🌐**

---

## 📞 Need Help?

- **AWS Documentation**: [docs.aws.amazon.com](https://docs.aws.amazon.com)
- **AWS Free Tier FAQ**: [aws.amazon.com/free/free-tier-faq](https://aws.amazon.com/free/free-tier-faq/)
- **Billing Questions**: Contact AWS Support through your console

**Happy deploying! 🚀** 