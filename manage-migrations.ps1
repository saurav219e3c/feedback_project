# Migration Management Script
# This script helps preserve local migrations during git operations

Write-Host "=== Migration Management Tool ===" -ForegroundColor Cyan

# Check if migrations exist
$migrationsPath = "backend\FeedbackSystem.API\FeedbackSystem.API\Migrations"
$migrationsExist = Test-Path $migrationsPath

if ($migrationsExist) {
    $fileCount = (Get-ChildItem $migrationsPath).Count
    Write-Host "✓ Migrations folder exists with $fileCount files" -ForegroundColor Green
} else {
    Write-Host "✗ Migrations folder not found!" -ForegroundColor Red
}

Write-Host "`nAvailable Commands:" -ForegroundColor Yellow
Write-Host "1. Backup current migrations"
Write-Host "2. Restore migrations from backup"
Write-Host "3. Restore migrations from last commit"
Write-Host "4. Check migration status"
Write-Host "5. Exit"

$choice = Read-Host "`nEnter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "`nBacking up migrations..." -ForegroundColor Cyan
        $backupPath = "migrations_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Copy-Item -Path $migrationsPath -Destination $backupPath -Recurse
        Write-Host "✓ Migrations backed up to: $backupPath" -ForegroundColor Green
    }
    "2" {
        Write-Host "`nAvailable backups:" -ForegroundColor Cyan
        Get-ChildItem -Directory -Filter "migrations_backup_*" | ForEach-Object { Write-Host $_.Name }
        $backupName = Read-Host "`nEnter backup folder name"
        if (Test-Path $backupName) {
            Remove-Item -Path $migrationsPath -Recurse -Force -ErrorAction SilentlyContinue
            Copy-Item -Path $backupName -Destination $migrationsPath -Recurse
            Write-Host "✓ Migrations restored from backup" -ForegroundColor Green
        } else {
            Write-Host "✗ Backup not found!" -ForegroundColor Red
        }
    }
    "3" {
        Write-Host "`nRestoring migrations from last commit..." -ForegroundColor Cyan
        git checkout HEAD~1 -- $migrationsPath
        Write-Host "✓ Migrations restored from git history" -ForegroundColor Green
    }
    "4" {
        Write-Host "`nMigration Status:" -ForegroundColor Cyan
        Write-Host "Local files: $(if ($migrationsExist) { $fileCount } else { '0' })"
        Write-Host "`nGit ignore status:"
        git check-ignore "$migrationsPath/*"
        Write-Host "`nGit attributes:"
        Get-Content .gitattributes | Select-String "Migrations"
    }
    "5" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit
    }
    default {
        Write-Host "Invalid choice!" -ForegroundColor Red
    }
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
