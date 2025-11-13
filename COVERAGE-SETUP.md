# Code Coverage & Reporting Setup Guide

## Tools Overview

| Tool | Purpose | Cost | Best For |
|------|---------|------|----------|
| **Jest Coverage** | Local coverage reports | Free | Development, CI logs |
| **Codecov** | Cloud coverage tracking | Free (OSS) | PR insights, trends |
| **SonarCloud** | Code quality + coverage | Free (OSS) | Comprehensive analysis |
| **Code Climate** | Maintainability score | Free (OSS) | Code health dashboard |
| **Coveralls** | Coverage tracking | Free (OSS) | Legacy projects |

---

## 1. Jest Coverage (Built-in)

### Configuration in `jest.config.js`

```javascript
module.exports = {
  collectCoverage: false, // Set to true to always collect coverage
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'database/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
  ],
  coverageReporters: [
    'html',
    'text',
    'text-summary',
    'lcov',
    'json'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Run Locally

```bash
npm test -- --coverage --watchAll=false
```

View HTML report:
```bash
open coverage/index.html
```

---

## 2. Codecov Setup (Recommended)

### Step 1: Create Codecov Account
1. Go to https://codecov.io
2. Sign in with GitHub
3. Select your repository

### Step 2: Update Workflow

Already added to `lint-and-tests.yml` — no additional secrets needed for public repos.

### Step 3: Verify in GitHub

- Push a commit to main
- Check the PR for a Codecov bot comment
- View your coverage dashboard at https://codecov.io/gh/LeoZoe09/event-app

### Example Coverage Badge for README

```markdown
[![codecov](https://codecov.io/gh/LeoZoe09/event-app/branch/main/graph/badge.svg?token=YOUR_TOKEN)](https://codecov.io/gh/LeoZoe09/event-app)
```

---

## 3. SonarCloud Setup (Optional but Recommended)

### Step 1: Create SonarCloud Account
1. Go to https://sonarcloud.io
2. Sign in with GitHub
3. Create organization
4. Add your repository

### Step 2: Get Token
- Go to Account → Security → Generate token
- Save as GitHub secret: `SONARCLOUD_TOKEN`

### Step 3: Create `sonar-project.properties`

```properties
sonar.projectKey=LeoZoe09_event-app
sonar.organization=leoZoe09
sonar.sources=app,components,lib,database
sonar.exclusions=**/*.d.ts,**/node_modules/**,**/.next/**
sonar.coverage.exclusions=**/*.test.ts,**/*.test.tsx
sonar.tests=app,components
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx
sonar.typescript.lcov.reportPaths=coverage/lcov.info
```

### Step 4: Add to Workflow

Create `.github/workflows/sonarcloud.yml`:

```yaml
name: SonarCloud Quality Gate

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  sonarcloud:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm test -- --coverage --watchAll=false

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONARCLOUD_TOKEN: ${{ secrets.SONARCLOUD_TOKEN }}
```

---

## 4. Code Climate Setup (Optional)

### Step 1: Add Token to Secrets
1. Go to https://codeclimate.com
2. Sign in with GitHub
3. Find your repo's Test Reporter ID
4. Add to GitHub secrets as `CC_TEST_REPORTER_ID`

### Step 2: Add to Workflow

```yaml
- name: Upload to Code Climate
  uses: paambaati/codeclimate-action@v5
  env:
    CC_TEST_REPORTER_ID: ${{ secrets.CC_TEST_REPORTER_ID }}
  with:
    coverageCommand: npm test -- --coverage --watchAll=false
    coverageLocations: ./coverage/lcov.info:lcov
```

---

## npm Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage --watchAll=false",
    "test:watch": "jest --watch",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  }
}
```

---

## Interpreting Coverage Reports

### HTML Report
- **Lines**: Code execution coverage
- **Statements**: Individual statements executed
- **Functions**: Functions called
- **Branches**: If/else paths taken

### Targets
- **90%+**: Excellent
- **75-89%**: Good
- **50-74%**: Acceptable
- **<50%**: Needs improvement

---

## CI/CD Integration

### Current Workflow (`lint-and-tests.yml`)
✅ Jest coverage reports generated
✅ Codecov upload enabled
✅ Artifacts stored for review

### Next Steps
1. Push code to trigger workflow
2. Check GitHub Actions for Codecov upload
3. Review PR comments from Codecov bot
4. (Optional) Add SonarCloud for broader analysis

---

## GitHub Secrets Needed

```
SONARCLOUD_TOKEN       (if using SonarCloud)
CC_TEST_REPORTER_ID    (if using Code Climate)
```

Codecov works without secrets for public repos!

---

## Troubleshooting

### Coverage reports not uploading to Codecov
- Verify repository is public or use token in workflow
- Check Codecov logs for errors

### SonarCloud failing
- Ensure `sonar-project.properties` exists
- Verify SONARCLOUD_TOKEN is set
- Check organization name matches

### Jest not generating LCOV report
- Update `jest.config.js` to include `lcov` in `coverageReporters`
- Run: `npm test -- --coverage --watchAll=false`

