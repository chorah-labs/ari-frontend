# Chorah Labs ARI Frontend (React + TypeScript)

## Tech Stack
- React
- Vite
- Node.js

## Getting Started

**Prerequisites:**  Make sure you have your Org SSH key set up to clone/push code in Chorah Labs repos.

### 1. Clone the frontend repository
   ```bash
   git clone git@github.com-org:chorah-labs/ari-frontend.git
   cd ari-frontend
   ```

### 2. Install dependencies
   ```bash
   npm install
   ```

### 3. Run locally
   ```bash
   npm run dev
   ```

### 4. Test a production build locally
   ```bash
   npm run build
   npm run preview
   ```

## Workflow
### 1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   **Branch naming convention:**
   ```bash
   feature/    # feature implementation
   bugfix/     # fix issues
   hotfix/     # address critical issues in production (no hotfixes unless absolutely necessary)
   docs/       # changes to documentation
   chore/      # non-code tasks
   ```
### 2. Commit often
   ```bash
   git add .
   git commit -m "feat: add conversations siebar"
   ```
### 3. Push to remote repo when ready
   ```bash
   git push origin feature/your-feature-name
   ```
### 4. Open a PR to `staging` for testing
