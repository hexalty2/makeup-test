# GlowGuide - Personalized Makeup Coach

A web application that provides personalized makeup guidance through a step-by-step process.

## 🌐 Live Demo

View the app at: [https://hexalty2.github.io/makeup-test/](https://hexalty2.github.io/makeup-test/)

## 📦 Project Structure

- `frontend/` - React application with Tailwind CSS and Shadcn UI components
- `backend/` - FastAPI backend with rule-based recommendation engine

## 🚀 Getting Started

### Frontend Development

```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

The app will run at http://localhost:3000

### Building for Production

```bash
cd frontend
npm run build
```

## 🌍 Deployment

This app is configured to deploy to GitHub Pages automatically.

### Automatic Deployment

Push to the `main` branch and GitHub Actions will automatically build and deploy the app.

### Manual Deployment

```bash
cd frontend
npm run deploy
```

## 📝 Configuration

The app is configured for GitHub Pages deployment:
- Homepage: `https://hexalty2.github.io/makeup-test/`
- Base path: `/makeup-test`
- GitHub Actions workflow: `.github/workflows/deploy.yml`

