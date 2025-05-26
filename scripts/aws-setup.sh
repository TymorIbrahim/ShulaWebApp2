#!/bin/bash

# AWS Setup Script for Shula Web App
# Usage: ./scripts/aws-setup.sh

echo "🏗️  AWS Setup Assistant for Shula Web App"
echo "========================================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed."
    echo ""
    echo "📥 Installing AWS CLI..."
    
    # Detect OS and install accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install awscli
        else
            echo "Please install Homebrew first or install AWS CLI manually:"
            echo "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip awscliv2.zip
        sudo ./aws/install
        rm -rf awscliv2.zip aws/
    else
        echo "Please install AWS CLI manually:"
        echo "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi
fi

echo "✅ AWS CLI is installed!"
echo ""

# Configure AWS credentials
echo "🔑 Setting up AWS credentials..."
echo ""
echo "You'll need your AWS Access Key ID and Secret Access Key."
echo "Get them from: AWS Console → IAM → Users → Your User → Security credentials"
echo ""

aws configure

if [ $? -ne 0 ]; then
    echo "❌ AWS configuration failed. Please try again."
    exit 1
fi

echo ""
echo "✅ AWS credentials configured!"
echo ""

# Test AWS connection
echo "🔗 Testing AWS connection..."
aws sts get-caller-identity

if [ $? -ne 0 ]; then
    echo "❌ AWS connection test failed. Please check your credentials."
    exit 1
fi

echo "✅ AWS connection successful!"
echo ""

# Create S3 bucket for frontend
echo "📦 Setting up S3 bucket for frontend..."
echo ""

# Generate a unique bucket name
TIMESTAMP=$(date +%s)
DEFAULT_BUCKET="shula-webapp-$TIMESTAMP"

read -p "Enter S3 bucket name [$DEFAULT_BUCKET]: " S3_BUCKET
S3_BUCKET=${S3_BUCKET:-$DEFAULT_BUCKET}

# Get AWS region
AWS_REGION=$(aws configure get region)
if [ -z "$AWS_REGION" ]; then
    AWS_REGION="us-east-1"
fi

echo "Creating S3 bucket: $S3_BUCKET in region: $AWS_REGION"

# Create bucket
if [ "$AWS_REGION" = "us-east-1" ]; then
    aws s3 mb s3://$S3_BUCKET
else
    aws s3 mb s3://$S3_BUCKET --region $AWS_REGION
fi

if [ $? -ne 0 ]; then
    echo "❌ Failed to create S3 bucket. The name might already exist."
    echo "Please try with a different bucket name."
    exit 1
fi

# Configure bucket for static website hosting
echo "🌐 Configuring static website hosting..."
aws s3 website s3://$S3_BUCKET --index-document index.html --error-document index.html

# Set bucket policy for public read
cat > /tmp/bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$S3_BUCKET/*"
        }
    ]
}
EOF

# Remove public access block
aws s3api delete-public-access-block --bucket $S3_BUCKET

# Apply bucket policy
aws s3api put-bucket-policy --bucket $S3_BUCKET --policy file:///tmp/bucket-policy.json

rm /tmp/bucket-policy.json

echo "✅ S3 bucket configured successfully!"
echo ""

# Update deployment scripts
echo "🔧 Updating deployment scripts..."

# Update frontend deployment script
sed -i.bak "s/S3_BUCKET=\"shula-webapp-frontend\"/S3_BUCKET=\"$S3_BUCKET\"/" scripts/deploy-frontend.sh

echo "✅ Deployment scripts updated!"
echo ""

# Create CloudFront distribution (optional)
read -p "Do you want to create a CloudFront distribution? (y/n): " CREATE_CF

if [[ $CREATE_CF =~ ^[Yy]$ ]]; then
    echo "📡 Creating CloudFront distribution..."
    
    # Get S3 bucket website endpoint
    S3_WEBSITE_ENDPOINT="$S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com"
    
    cat > /tmp/cloudfront-config.json << EOF
{
    "CallerReference": "shula-app-$(date +%s)",
    "Comment": "Shula Web App Distribution",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$S3_BUCKET",
                "DomainName": "$S3_WEBSITE_ENDPOINT",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$S3_BUCKET",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0
    },
    "CustomErrorResponses": {
        "Quantity": 2,
        "Items": [
            {
                "ErrorCode": 403,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            },
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
}
EOF
    
    CF_RESULT=$(aws cloudfront create-distribution --distribution-config file:///tmp/cloudfront-config.json)
    CF_DISTRIBUTION_ID=$(echo $CF_RESULT | grep -o '"Id":"[^"]*"' | cut -d'"' -f4 | head -1)
    CF_DOMAIN=$(echo $CF_RESULT | grep -o '"DomainName":"[^"]*"' | cut -d'"' -f4 | head -1)
    
    rm /tmp/cloudfront-config.json
    
    if [ ! -z "$CF_DISTRIBUTION_ID" ]; then
        echo "✅ CloudFront distribution created!"
        echo "Distribution ID: $CF_DISTRIBUTION_ID"
        echo "Domain: $CF_DOMAIN"
        
        # Update deployment script with CloudFront ID
        sed -i.bak "s/CLOUDFRONT_DISTRIBUTION_ID=\"YOUR_DISTRIBUTION_ID\"/CLOUDFRONT_DISTRIBUTION_ID=\"$CF_DISTRIBUTION_ID\"/" scripts/deploy-frontend.sh
        
        echo "🔧 Frontend deployment script updated with CloudFront ID!"
    else
        echo "⚠️  CloudFront distribution creation may have failed. You can create it manually later."
    fi
    
    rm -f scripts/deploy-frontend.sh.bak
fi

echo ""
echo "🎉 AWS setup completed successfully!"
echo ""
echo "📋 Configuration Summary:"
echo "========================"
echo "S3 Bucket: $S3_BUCKET"
echo "S3 Website URL: http://$S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com"
if [ ! -z "$CF_DOMAIN" ]; then
    echo "CloudFront URL: https://$CF_DOMAIN"
fi
echo "AWS Region: $AWS_REGION"
echo ""
echo "🚀 Next Steps:"
echo "1. Launch an EC2 instance for your backend"
echo "2. Run: ./scripts/deploy-frontend.sh (to deploy frontend)"
echo "3. Run: ./scripts/deploy-backend.sh (to deploy backend)"
echo "4. Update frontend environment variables with your backend URL"
echo ""
echo "📖 For detailed instructions, see: deploy-aws.md" 