#!/bin/bash

# Domain Setup Script for Shula Web App
# Usage: ./scripts/setup-domain.sh

echo "🌐 Domain Setup for Shula Web App"
echo "================================="
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI is configured!"
echo ""

# Domain configuration
echo "Let's set up your custom domain for Shula!"
echo ""
echo "📋 Suggested domain names for your project:"
echo "   • shula-rentals.com"
echo "   • shulaequipment.com"
echo "   • rentshula.com"
echo "   • shula-gear.com"
echo "   • myshulaapp.com"
echo ""

read -p "Enter your domain name (e.g., shula-rentals.com): " DOMAIN_NAME

if [ -z "$DOMAIN_NAME" ]; then
    echo "❌ Domain name is required."
    exit 1
fi

echo ""
echo "🔍 You chose: $DOMAIN_NAME"
echo ""

# Check if domain is available via Route 53
echo "🔍 Checking domain availability..."

# Create hosted zone first (this will work even if domain is registered elsewhere)
echo "📝 Creating hosted zone for $DOMAIN_NAME..."

HOSTED_ZONE_RESULT=$(aws route53 create-hosted-zone \
    --name "$DOMAIN_NAME" \
    --caller-reference "shula-$(date +%s)" \
    --hosted-zone-config Comment="Shula Web App Domain")

if [ $? -eq 0 ]; then
    HOSTED_ZONE_ID=$(echo $HOSTED_ZONE_RESULT | grep -o '"Id": "/hostedzone/[^"]*"' | cut -d'"' -f4 | cut -d'/' -f3)
    echo "✅ Hosted zone created: $HOSTED_ZONE_ID"
    
    # Get name servers
    NAME_SERVERS=$(aws route53 get-hosted-zone --id $HOSTED_ZONE_ID | grep -A 10 '"NameServers"' | grep -o '"[^"]*\.amazonaws\.com\."' | tr -d '"')
    
    echo ""
    echo "📋 Name Servers for your domain:"
    echo "$NAME_SERVERS" | while read ns; do
        echo "   • $ns"
    done
    
else
    echo "❌ Failed to create hosted zone. Domain might already exist."
fi

echo ""
echo "🚀 Domain Registration Options:"
echo ""
echo "Option 1: Register via AWS Route 53"
echo "  • Cost: ~$12/year"
echo "  • Automatic DNS management"
echo "  • Integrated with AWS services"
echo ""
echo "Option 2: Register elsewhere (Namecheap, GoDaddy, etc.)"
echo "  • Cost: ~$8-12/year"
echo "  • Manual DNS setup required"
echo ""

read -p "Do you want to try registering via AWS Route 53? (y/n): " REGISTER_AWS

if [[ $REGISTER_AWS =~ ^[Yy]$ ]]; then
    echo "🔍 Checking if domain is available for registration..."
    
    AVAILABILITY=$(aws route53domains check-domain-availability --domain-name "$DOMAIN_NAME" 2>/dev/null)
    
    if echo "$AVAILABILITY" | grep -q '"Availability": "AVAILABLE"'; then
        echo "✅ Domain is available for registration!"
        echo ""
        echo "💳 To register the domain:"
        echo "1. Go to AWS Console → Route 53 → Registered domains"
        echo "2. Click 'Register domain'"
        echo "3. Search for: $DOMAIN_NAME"
        echo "4. Complete the registration process"
        echo ""
    else
        echo "❌ Domain is not available for registration via AWS."
        echo "You can register it elsewhere and point DNS to AWS."
    fi
fi

# Update deployment scripts with domain
echo ""
echo "🔧 Updating deployment configuration..."

# Update server.js CORS settings
if [ -f "backend/server.js" ]; then
    # Create a backup
    cp backend/server.js backend/server.js.backup
    
    # Update CORS to include the new domain
    sed -i.tmp "s|process.env.FRONTEND_URL|process.env.FRONTEND_URL, 'https://$DOMAIN_NAME', 'https://www.$DOMAIN_NAME'|g" backend/server.js
    rm backend/server.js.tmp
    
    echo "✅ Updated backend CORS settings"
fi

# Create SSL certificate script
cat > scripts/setup-ssl.sh << 'EOF'
#!/bin/bash

# SSL Certificate Setup for Custom Domain
# Run this AFTER your domain DNS is pointing to AWS

DOMAIN_NAME="DOMAIN_PLACEHOLDER"

echo "🔒 Setting up SSL certificate for $DOMAIN_NAME"

# Request certificate via AWS Certificate Manager
aws acm request-certificate \
    --domain-name "$DOMAIN_NAME" \
    --domain-name "www.$DOMAIN_NAME" \
    --validation-method DNS \
    --region us-east-1

echo "✅ SSL certificate request submitted!"
echo ""
echo "📋 Next steps:"
echo "1. Go to AWS Console → Certificate Manager"
echo "2. Click on your certificate"
echo "3. Add the DNS validation records to your domain"
echo "4. Wait for validation (can take a few minutes)"
EOF

# Replace placeholder with actual domain
sed -i.tmp "s/DOMAIN_PLACEHOLDER/$DOMAIN_NAME/g" scripts/setup-ssl.sh
rm scripts/setup-ssl.sh.tmp
chmod +x scripts/setup-ssl.sh

echo "✅ Created SSL setup script"

echo ""
echo "🎉 Domain setup completed!"
echo ""
echo "📋 Summary:"
echo "============"
echo "Domain: $DOMAIN_NAME"
if [ ! -z "$HOSTED_ZONE_ID" ]; then
    echo "Hosted Zone ID: $HOSTED_ZONE_ID"
fi
echo ""
echo "🚀 Next Steps:"
echo "1. Register the domain (AWS Route 53 or external provider)"
echo "2. If using external provider, update DNS with the name servers above"
echo "3. Run: ./scripts/setup-ssl.sh (after DNS is configured)"
echo "4. Update CloudFront distribution to use your domain"
echo "5. Update your frontend environment variables"
echo ""
echo "📖 For detailed instructions, see: README-AWS.md" 