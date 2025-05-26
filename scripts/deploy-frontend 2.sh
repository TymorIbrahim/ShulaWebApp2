#!/bin/bash

# Frontend Deployment Script for AWS S3 + CloudFront
# Usage: ./scripts/deploy-frontend.sh

echo "🚀 Starting frontend deployment to AWS..."

# Configuration (Update these values)
S3_BUCKET="shula-webapp-frontend"
CLOUDFRONT_DISTRIBUTION_ID="YOUR_DISTRIBUTION_ID"
AWS_PROFILE="default"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    echo "Run: npm install -g aws-cli"
    exit 1
fi

# Check if bucket name is set
if [ "$S3_BUCKET" = "shula-webapp-frontend" ]; then
    echo "⚠️  Please update the S3_BUCKET variable in this script with your actual bucket name"
    echo "The bucket name must be globally unique across all AWS accounts"
    read -p "Enter your S3 bucket name: " S3_BUCKET
fi

# Build the React app
echo "📦 Building React app for production..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"

# Upload to S3
echo "⬆️  Uploading files to S3 bucket: $S3_BUCKET"
aws s3 sync build/ s3://$S3_BUCKET --delete --profile $AWS_PROFILE

if [ $? -ne 0 ]; then
    echo "❌ Upload to S3 failed. Please check your AWS credentials and bucket permissions."
    exit 1
fi

echo "✅ Files uploaded to S3 successfully!"

# Invalidate CloudFront cache (if distribution ID is provided)
if [ "$CLOUDFRONT_DISTRIBUTION_ID" != "YOUR_DISTRIBUTION_ID" ] && [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo "🔄 Invalidating CloudFront cache..."
    aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*" --profile $AWS_PROFILE
    
    if [ $? -eq 0 ]; then
        echo "✅ CloudFront cache invalidation started!"
    else
        echo "⚠️  CloudFront invalidation failed, but deployment was successful."
    fi
else
    echo "⚠️  CloudFront distribution ID not configured. Skipping cache invalidation."
    echo "Your changes may take time to appear due to caching."
fi

echo ""
echo "🎉 Frontend deployment completed!"
echo "📱 Your app should be available at:"
echo "   S3 Website URL: http://$S3_BUCKET.s3-website-us-east-1.amazonaws.com"
if [ "$CLOUDFRONT_DISTRIBUTION_ID" != "YOUR_DISTRIBUTION_ID" ]; then
    echo "   CloudFront URL: https://$CLOUDFRONT_DISTRIBUTION_ID.cloudfront.net"
fi
echo ""
echo "🔧 Next steps:"
echo "   1. Update your backend CORS settings with the frontend URL"
echo "   2. Test all functionality in production"
echo "   3. Set up monitoring in CloudWatch"

cd .. 