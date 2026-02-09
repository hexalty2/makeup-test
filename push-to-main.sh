#!/bin/bash

# PUSH TO MAIN - Final Deployment Step
# This script pushes the configured code to the main branch to trigger GitHub Pages deployment

set -e

echo "=================================================="
echo "  GitHub Pages Deployment - Push to Main"
echo "=================================================="
echo ""

# Check we're in the right repo
if [ ! -f "frontend/package.json" ] || [ ! -d ".github/workflows" ]; then
    echo "❌ Error: Not in the makeup-test repository root"
    exit 1
fi

echo "✅ Repository validated"
echo ""

# Fetch latest
echo "📥 Fetching latest changes..."
git fetch origin --quiet

# Create/update main branch from the feature branch
echo "🔧 Setting up main branch..."
if git show-ref --verify --quiet refs/remotes/origin/main; then
    echo "   Main branch exists on remote, checking out..."
    git checkout main
    git merge origin/copilot/update-github-pages-setup --no-edit
else
    echo "   Creating main branch from copilot/update-github-pages-setup..."
    git checkout -b main origin/copilot/update-github-pages-setup 2>/dev/null || git checkout main
fi

echo ""
echo "📊 Ready to push to main branch"
echo "   Current commit: $(git log --oneline -1)"
echo ""

# Show what will happen
echo "🚀 This will:"
echo "   1. Push current code to 'origin/main'"
echo "   2. Trigger GitHub Actions workflow"
echo "   3. Deploy to https://hexalty2.github.io/makeup-test/"
echo ""

# Confirm
read -p "Continue with push? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⏸️  Cancelled. No changes were pushed."
    exit 0
fi

# Push to main
echo ""
echo "⬆️  Pushing to main..."

if git push origin main; then
    echo ""
    echo "=================================================="
    echo "  ✅ Successfully pushed to main!"
    echo "=================================================="
    echo ""
    echo "🎉 GitHub Actions is now deploying your app!"
    echo ""
    echo "📍 Monitor deployment:"
    echo "   https://github.com/hexalty2/makeup-test/actions"
    echo ""
    echo "⏱️  Deployment takes 2-5 minutes"
    echo ""
    echo "🌐 Your app will be live at:"
    echo "   https://hexalty2.github.io/makeup-test/"
    echo ""
    echo "💡 Next steps:"
    echo "   1. Watch the Actions tab for the workflow to complete"
    echo "   2. Look for a green checkmark ✅"
    echo "   3. Visit your live app!"
    echo ""
else
    echo ""
    echo "❌ Push failed!"
    echo ""
    echo "Common issues:"
    echo "   - Not authenticated: Run 'gh auth login' or configure git credentials"
    echo "   - No push permission: Check your GitHub account has write access"
    echo ""
    echo "Try:"
    echo "   gh auth login"
    echo "   git push origin main"
    echo ""
    exit 1
fi
