# Plasmit HMS Frontend Project - New Intern Setup Guide

## 1. Purpose

This guide explains how a new intern can install tools, download the project from GitHub, open it in VS Code, install dependencies, and run the Next.js frontend locally.

## 2. Required Software

| Software | Purpose | Link |
| --- | --- | --- |
| Git | Clone and manage code | https://git-scm.com/downloads |
| Node.js LTS | Run Next.js and npm | https://nodejs.org |
| VS Code | Code editor | https://code.visualstudio.com |
| Google Chrome | Browser testing | https://www.google.com/chrome |

## 3. Install Git

```bash
git --version
```

## 4. Install Node.js

```bash
node -v
npm -v
```

## 5. Clone the Project

```bash
cd Desktop
git clone https://github.com/Aman305-bit/plasmit-web-application-UI.git
cd plasmit-web-application-UI
```

If the repository is private, ask the project owner to add your GitHub account.

## 6. Open in VS Code

```bash
code .
```

If this command does not work, open VS Code manually and use File > Open Folder.

## 7. Install Dependencies

```bash
npm install
```

## 8. Environment File

If `.env.example` exists:

```bash
copy .env.example .env.local
```

Ask the senior developer for actual environment values. Never commit `.env` or `.env.local`.

## 9. Run the Project

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 10. Useful Commands

| Command | Purpose |
| --- | --- |
| npm run dev | Start local development server |
| npm run build | Production build |
| npm run typecheck | Check TypeScript errors |
| npm run lint | Check linting |
| git status | Check changed files |
| git pull origin dev | Get latest dev code |
| git checkout -b feature/my-task-name | Create feature branch |

## 11. Daily Git Workflow

```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-task-name

# after code changes
git status
git add .
git commit -m "feat: describe your change"
git push origin feature/your-task-name
```

## 12. Project Folder Overview

| Folder/File | Meaning |
| --- | --- |
| src/app | Next.js App Router pages/routes |
| src/features | Module-wise frontend code |
| src/components | Reusable UI components |
| src/data | Static app data |
| public | Static assets |
| docs | Documentation |
| database | SQL/database scripts |
| package.json | Scripts and dependencies |

## 13. Common Problems

| Problem | Solution |
| --- | --- |
| npm is not recognized | Install Node.js LTS and reopen terminal |
| git is not recognized | Install Git and reopen terminal |
| Port 3000 already in use | Stop old server or run on another port |
| Module not found | Run npm install again |
| Private repo access denied | Ask owner to add your GitHub account |

## 14. Final Checklist

- Git installed
- Node.js LTS installed
- VS Code installed
- Project cloned
- Project opened in VS Code
- `npm install` completed
- `npm run dev` started
- Website opened at `http://localhost:3000`
