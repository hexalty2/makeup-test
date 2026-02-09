# GitHub Pages Deployment Guide

## 🚀 Quick Start

This repository is configured for automatic deployment to GitHub Pages.

### Live URL
Once deployed, the app will be available at:
**https://hexalty2.github.io/makeup-test/**

## 📋 Deployment Methods

### Method 1: Automatic Deployment (Recommended)

The repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages when changes are pushed to the `main` branch.

**Steps:**
1. Merge this PR to the `main` branch
2. GitHub Actions will automatically:
   - Install dependencies
   - Build the React app
   - Deploy to GitHub Pages
3. The app will be live at https://hexalty2.github.io/makeup-test/ within a few minutes

**First-time setup:**
- Go to your repository's **Settings** → **Pages**
- Under "Build and deployment", select **Source**: "GitHub Actions"
- Save the settings

### Method 2: Manual Deployment

If you prefer to deploy manually from your local machine:

```bash
cd frontend
npm install --legacy-peer-deps
npm run deploy
```

**Note:** This requires Git credentials with push access to the repository.

## 🔧 Configuration Details

### Package.json
```json
{
  "homepage": "https://hexalty2.github.io/makeup-test",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

### React Router
The app uses `BrowserRouter` with `basename="/makeup-test"` to ensure proper routing on GitHub Pages.

```javascript
<BrowserRouter basename="/makeup-test">
```

### GitHub Actions Workflow
Location: `.github/workflows/deploy.yml`

The workflow:
- Triggers on push to `main` branch
- Can also be manually triggered via workflow_dispatch
- Uses Node.js 18
- Installs dependencies with `--legacy-peer-deps` flag
- Builds the production bundle
- Deploys to GitHub Pages

## 🧪 Testing the Build Locally

Before deploying, you can test the production build locally:

```bash
cd frontend
npm install --legacy-peer-deps
npm run build
npx serve -s build -l 3000
```

Then open http://localhost:3000/makeup-test/ to test the app.

## 📊 Monitoring Deployments

### GitHub Actions
- View deployment status: Go to the **Actions** tab in your repository
- Each push to `main` will create a new workflow run
- Click on a run to see detailed logs

### GitHub Pages
- Check deployment status: **Settings** → **Pages**
- View deployed site: Click the URL shown in the Pages settings

## 🐛 Troubleshooting

### Build Fails in GitHub Actions
- Check the Actions tab for error logs
- Common issues:
  - Missing dependencies: Ensure package-lock.json is committed
  - Build errors: Test the build locally first with `npm run build`

### App Shows 404 or Blank Page
- Verify the homepage field in package.json matches your repository
- Ensure basename in BrowserRouter matches the repository name
- Check browser console for errors

### Routes Don't Work
- Verify BrowserRouter has the correct basename prop
- GitHub Pages serves the app from a subdirectory (e.g., `/makeup-test`)
- All routes must account for this base path

## ✅ Verification Checklist

Before merging to main:
- [ ] `npm run build` succeeds locally
- [ ] homepage field in package.json is correct
- [ ] BrowserRouter basename matches repository name
- [ ] GitHub Actions workflow file exists
- [ ] GitHub Pages is enabled in repository settings

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Create React App Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [gh-pages Package](https://www.npmjs.com/package/gh-pages)
