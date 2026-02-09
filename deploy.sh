#!/bin/bash

# Deploy to GitHub Pages - Step 2 Automation Script
# This script merges the deployment configuration to main and triggers deployment

set -e  # Exit on error

echo "🚀 Starting GitHub Pages Deployment Process..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "frontend" ]; then
    echo "❌ Error: This doesn't appear to be the makeup-test repository root"
    echo "   Please run this script from the repository root directory"
    exit 1
fi

# Get the current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"
echo ""

# Fetch latest changes
echo "📥 Fetching latest changes from remote..."
git fetch origin
echo ""

# Check if main branch exists
if git show-ref --verify --quiet refs/heads/main; then
    echo "ℹ️  Main branch already exists locally"
    git checkout main
    git merge origin/copilot/update-github-pages-setup --no-edit
else
    echo "✨ Creating main branch from copilot/update-github-pages-setup..."
    git checkout -b main origin/copilot/update-github-pages-setup
fi

echo ""
echo "🔧 Branch setup complete"
echo ""

# Show what will be pushed
echo "📋 Files configured for deployment:"
echo "   - .github/workflows/deploy.yml (GitHub Actions workflow)"
echo "   - frontend/package.json (homepage + deploy scripts)"
echo "   - frontend/src/App.js (basename configured)"
echo ""

# Confirm before pushing
read -p "⚡ Ready to push to main and trigger deployment? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Pushing to main branch..."
    git push origin main
    
    echo ""
    echo "✅ Successfully pushed to main!"
    echo ""
    echo "📊 Deployment Status:"
    echo "   1. GitHub Actions is now building and deploying your app"
    echo "   2. View progress: https://github.com/hexalty2/makeup-test/actions"
    echo "   3. Expected completion: 2-5 minutes"
    echo ""
    echo "🌐 Once deployed, your app will be available at:"
    echo "   https://hexalty2.github.io/makeup-test/"
    echo ""
    echo "💡 Next steps:"
    echo "   - Monitor the Actions tab for deployment progress"
    echo "   - Wait for the green checkmark ✅"
    echo "   - Visit the live URL to test your app"
    echo ""
    echo "🎉 Deployment initiated successfully!"
else
    echo ""
    echo "⏸️  Deployment cancelled. No changes were pushed."
    echo "   Run this script again when you're ready to deploy."
fi
