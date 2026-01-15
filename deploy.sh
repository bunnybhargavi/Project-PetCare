#!/bin/bash
# Quick Deploy Script for Render
# Run this script to commit and push all changes

echo "🚀 PawHaven - Render Deployment Script"
echo "======================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Not a git repository"
    exit 1
fi

echo "📋 Step 1: Adding all changes to git..."
git add .

echo ""
echo "📝 Step 2: Committing changes..."
git commit -m "Configure for Render deployment with PostgreSQL

- Updated render.yaml with PostgreSQL database service
- Modified application-prod.properties for PostgreSQL
- Updated Dockerfile with PORT handling
- Fixed duplicate Flyway migrations
- Disabled Flyway for initial deployment
- Added comprehensive deployment documentation"

echo ""
echo "📤 Step 3: Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Changes pushed successfully!"
echo ""
echo "🎯 Next Steps:"
echo "1. Go to https://render.com"
echo "2. Click 'New +' → 'Blueprint'"
echo "3. Connect your GitHub repository"
echo "4. Click 'Apply' to deploy"
echo ""
echo "📖 For detailed instructions, see RENDER_DEPLOYMENT_GUIDE.md"
echo ""
