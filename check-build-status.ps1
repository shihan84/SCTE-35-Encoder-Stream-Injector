# Check GitHub Actions Build Status
Write-Host "========================================" -ForegroundColor Green
Write-Host "Checking GitHub Actions Build Status" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "âŒ Not in a git repository" -ForegroundColor Red
    exit 1
}

# Get repository URL
try {
     = git remote get-url origin 2>
    if (-not ) {
        Write-Host "âŒ No remote repository configured" -ForegroundColor Red
        Write-Host "Please run: git remote add origin <your-github-repo-url>" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "âœ… Repository: " -ForegroundColor Green
} catch {
    Write-Host "âŒ Error getting repository URL" -ForegroundColor Red
}
Write-Host ""

# Check if GitHub Actions are enabled
if (Test-Path ".github/workflows") {
    Write-Host "âœ… GitHub Actions workflows found" -ForegroundColor Green
    Get-ChildItem ".github/workflows" | ForEach-Object { Write-Host "  - " -ForegroundColor White }
} else {
    Write-Host "âŒ No GitHub Actions workflows found" -ForegroundColor Red
}
Write-Host ""

# Check if files are committed
 = git status --porcelain 2>
if ( -match "\.github/workflows/") {
    Write-Host "âš ï¸  GitHub Actions workflows not committed" -ForegroundColor Yellow
    Write-Host "Please run: git add .github/workflows/ && git commit -m 'Add FFmpeg SCTE-35 build workflows'" -ForegroundColor Yellow
} else {
    Write-Host "âœ… GitHub Actions workflows are committed" -ForegroundColor Green
}
Write-Host ""

# Check if pushed to remote
if ( -match "ahead") {
    Write-Host "âš ï¸  Local commits not pushed to remote" -ForegroundColor Yellow
    Write-Host "Please run: git push origin main" -ForegroundColor Yellow
} else {
    Write-Host "âœ… All commits are pushed to remote" -ForegroundColor Green
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to GitHub Actions tab in your repository" -ForegroundColor White
Write-Host "2. Enable workflows if prompted" -ForegroundColor White
Write-Host "3. Run 'Build FFmpeg with SCTE-35' workflow" -ForegroundColor White
Write-Host "4. Download build artifacts when complete" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
