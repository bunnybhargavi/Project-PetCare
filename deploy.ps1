# Quick Deploy Script for Render (PowerShell)
# Run this script to commit and push all changes

Write-Host "🚀 PawHaven - Render Deployment Script" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Not a git repository" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Step 1: Adding all changes to git..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "📝 Step 2: Committing changes..." -ForegroundColor Yellow
git commit -m "Configure for Render deployment with PostgreSQL

- Updated render.yaml with PostgreSQL database service
- Modified application-prod.properties for PostgreSQL
- Updated Dockerfile with PORT handling
- Fixed duplicate Flyway migrations
- Disabled Flyway for initial deployment
- Added comprehensive deployment documentation"

Write-Host ""
Write-Host "📤 Step 3: Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ Changes pushed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://render.com" -ForegroundColor White
Write-Host "2. Click 'New +' → 'Blueprint'" -ForegroundColor White
Write-Host "3. Connect your GitHub repository" -ForegroundColor White
Write-Host "4. Click 'Apply' to deploy" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see RENDER_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
