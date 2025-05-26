#!/bin/bash

# Backend Deployment Script for AWS EC2
# Usage: ./scripts/deploy-backend.sh

echo "🚀 Starting backend deployment to AWS EC2..."

# Configuration (Update these values)
EC2_HOST="your-ec2-public-ip"
EC2_USER="ec2-user"
KEY_PATH="path/to/your-key.pem"
APP_DIR="/home/ec2-user/ShulaWebApp2"

# Check if configuration is set
if [ "$EC2_HOST" = "your-ec2-public-ip" ]; then
    echo "⚠️  Please update the configuration variables in this script:"
    echo "   - EC2_HOST: Your EC2 instance public IP"
    echo "   - KEY_PATH: Path to your EC2 key pair file"
    read -p "Enter your EC2 public IP: " EC2_HOST
    read -p "Enter path to your .pem key file: " KEY_PATH
fi

# Check if key file exists
if [ ! -f "$KEY_PATH" ]; then
    echo "❌ Key file not found: $KEY_PATH"
    echo "Please provide the correct path to your EC2 key pair file."
    exit 1
fi

echo "📦 Preparing deployment package..."

# Create deployment package (excluding node_modules and git)
cd backend
zip -r ../backend-deploy.zip . -x "node_modules/*" ".git/*" "*.log" ".DS_Store"

if [ $? -ne 0 ]; then
    echo "❌ Failed to create deployment package."
    exit 1
fi

cd ..
echo "✅ Deployment package created successfully!"

# Upload to EC2
echo "⬆️  Uploading to EC2 instance..."
scp -i "$KEY_PATH" backend-deploy.zip $EC2_USER@$EC2_HOST:/tmp/

if [ $? -ne 0 ]; then
    echo "❌ Failed to upload to EC2. Check your connection and key permissions."
    echo "Make sure your key file has correct permissions: chmod 400 $KEY_PATH"
    exit 1
fi

echo "✅ Upload completed!"

# Deploy on EC2
echo "🔧 Deploying on EC2 instance..."
ssh -i "$KEY_PATH" $EC2_USER@$EC2_HOST << 'EOF'
    echo "📂 Extracting deployment package..."
    
    # Create app directory if it doesn't exist
    mkdir -p /home/ec2-user/ShulaWebApp2/backend
    
    # Extract new version
    cd /home/ec2-user/ShulaWebApp2/backend
    unzip -o /tmp/backend-deploy.zip
    
    echo "📦 Installing dependencies..."
    npm install --production
    
    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        echo "⬇️  Installing PM2..."
        sudo npm install -g pm2
    fi
    
    echo "🔄 Restarting application..."
    
    # Stop existing application
    pm2 stop shula-backend 2>/dev/null || echo "No existing application to stop"
    
    # Start/restart application
    pm2 start server.js --name shula-backend
    
    # Save PM2 process list
    pm2 save
    
    # Show status
    pm2 status
    
    echo "✅ Deployment completed on EC2!"
    
    # Cleanup
    rm /tmp/backend-deploy.zip
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Backend deployment completed successfully!"
    echo "🔗 Your API should be available at: http://$EC2_HOST:5002"
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Test your API endpoints"
    echo "   2. Update frontend environment variables with your EC2 URL"
    echo "   3. Set up SSL certificate for HTTPS"
    echo "   4. Configure domain name (optional)"
    echo ""
    echo "📊 Useful commands:"
    echo "   Check logs: ssh -i $KEY_PATH $EC2_USER@$EC2_HOST 'pm2 logs'"
    echo "   Check status: ssh -i $KEY_PATH $EC2_USER@$EC2_HOST 'pm2 status'"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi

# Cleanup local deployment package
rm -f backend-deploy.zip

echo "🧹 Cleanup completed!" 