# Deploying to GitHub Pages

This guide will help you deploy your Spotify History Analyzer to GitHub Pages.

## Option 1: Automatic Deployment with GitHub Actions (Recommended)

This method automatically deploys your app whenever you push to the `main` branch.

### Steps:

1. **Your GitHub Repository**
   - Repository: `https://github.com/praisekenedy84/spotyfy.git`
   - Repository name: `spotyfy`

2. **Initialize Git and Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/praisekenedy84/spotyfy.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository on GitHub: https://github.com/praisekenedy84/spotyfy
   - Click on **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - The workflow will automatically run and deploy your site

4. **Access Your Site**
   - After deployment, your site will be available at:
   - `https://praisekenedy84.github.io/spotyfy/`

## Option 2: Manual Deployment

If you prefer to deploy manually:

1. **Install gh-pages package**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Deploy**
   ```bash
   npm run deploy
   ```

3. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click on **Settings** → **Pages**
   - Under **Source**, select the `gh-pages` branch
   - Click **Save**

## Important Notes

- **Repository Name**: Your repository is `spotyfy`, so the base path is set to `/spotyfy/` in `vite.config.js`. If you change the repository name, update the `REPO_NAME` constant in `vite.config.js`.

- **Custom Domain**: If you're using a custom domain, set the base path to `/` in `vite.config.js`.

- **Build Output**: The built files are in the `dist` directory, which gets deployed to GitHub Pages.

## Troubleshooting

- **404 Errors**: Make sure the base path in `vite.config.js` matches your repository name
- **Build Fails**: Check that all dependencies are installed (`npm install`)
- **Assets Not Loading**: Verify the base path is correct for your repository structure

## Updating Your Site

After making changes:
1. Commit and push to the `main` branch
2. GitHub Actions will automatically rebuild and redeploy your site
3. Wait a few minutes for the deployment to complete

