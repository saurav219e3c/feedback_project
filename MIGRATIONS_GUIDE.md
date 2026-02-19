# Migration Management Guide

## Overview
Your local EF Core migrations are now protected from being overwritten during `git pull` operations.

## How It Works

### 1. `.gitignore`
The Migrations folder is excluded from git tracking:
```
backend/FeedbackSystem.API/FeedbackSystem.API/Migrations/
```

### 2. `.gitattributes`
Custom merge strategy ensures local migrations are preserved:
```
backend/FeedbackSystem.API/FeedbackSystem.API/Migrations/** merge=ours
```

### 3. Git Configuration
The "ours" merge driver is configured to keep local files during merge conflicts.

## Usage

### Normal Workflow
Just use git as usual:
```powershell
git pull
```
Your local migrations will remain unchanged!

### Manual Management
Use the helper script:
```powershell
.\manage-migrations.ps1
```

Options:
1. **Backup migrations** - Create timestamped backup
2. **Restore from backup** - Restore from previous backup
3. **Restore from git** - Get migrations from git history
4. **Check status** - View current migration state

### Manual Commands

#### Backup migrations:
```powershell
Copy-Item -Path "backend\FeedbackSystem.API\FeedbackSystem.API\Migrations" -Destination "migrations_backup" -Recurse
```

#### Restore from specific commit:
```powershell
git checkout <commit-hash> -- backend/FeedbackSystem.API/FeedbackSystem.API/Migrations/
```

#### Check if migrations are ignored:
```powershell
git check-ignore backend/FeedbackSystem.API/FeedbackSystem.API/Migrations/*
```

## Important Notes

1. **Local Only**: Migrations are NOT pushed to remote
2. **Team Members**: Each developer maintains their own local migrations
3. **Fresh Clone**: After cloning, you'll need to create migrations locally
4. **Database Sync**: Ensure your local database schema matches your migrations

## Troubleshooting

### Migrations deleted after pull?
Run the helper script and choose option 3, or:
```powershell
git checkout HEAD~1 -- backend/FeedbackSystem.API/FeedbackSystem.API/Migrations/
```

### Need to share migrations?
Create a backup and share the folder manually (not through git).

### Want to track migrations again?
1. Remove from `.gitignore`
2. Remove from `.gitattributes`
3. Run: `git add backend/FeedbackSystem.API/FeedbackSystem.API/Migrations/`
