# 🚀 30-Second Deploy Guide

## Do These 3 Things:

### 1. Enable Actions Permissions (10 seconds)
Go to: https://github.com/hexalty2/makeup-test/settings/actions
- Scroll to "Workflow permissions"  
- Select **"Read and write permissions"**
- Click **Save**

### 2. Configure GitHub Pages (10 seconds)
Go to: https://github.com/hexalty2/makeup-test/settings/pages
- Under "Source", select **"GitHub Actions"**
- Click **Save**

### 3. Trigger Deployment (10 seconds)
Go to: https://github.com/hexalty2/makeup-test/actions
- Click on "Deploy to gh-pages" workflow
- Click **"Run workflow"** dropdown
- Select branch: **copilot/update-github-pages-setup**
- Click green **"Run workflow"** button

## Done! ✅
Wait 3-4 minutes, then visit: **https://hexalty2.github.io/makeup-test/**

---

## If You Want to Use Main Branch Instead:
After steps 1 & 2, create a Pull Request:
- Go to: https://github.com/hexalty2/makeup-test/compare/main...copilot/update-github-pages-setup
- Click "Create pull request"
- Click "Merge pull request"
- Your site deploys automatically!
