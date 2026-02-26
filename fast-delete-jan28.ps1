# Fast method - Use git filter-branch to remove Jan 28 commits

Write-Host "=== Fast Jan 28 Commit Deletion ===" -ForegroundColor Cyan

# Backup
$backup = "backup-fast-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git branch $backup
Write-Host "Backup: $backup`n" -ForegroundColor Green

# Get Jan 28 commits on main
$jan28Hashes = git log main --reverse --pretty=format:"%H|%ad" --date=short | Select-String "2026-01-28" | ForEach-Object { ($_ -split '\|')[0] }
$total = $jan28Hashes.Count
Write-Host "Found $total Jan 28 commits`n" -ForegroundColor Cyan

# Select 50 to keep
$keepCount = 50
$step = [Math]::Ceiling($total / $keepCount)
$toKeep = @{}

for ($i = 0; $i -lt $total; $i += $step) {
    if ($toKeep.Count -lt $keepCount) {
        $toKeep[$jan28Hashes[$i]] = $true
    }
}

Write-Host "Keeping $($toKeep.Count) commits, deleting $($total - $toKeep.Count)`n" -ForegroundColor Yellow

# Create filter script
$filterScript = @"
#!/bin/bash
COMMIT_HASH=`$(git rev-parse HEAD)
if [[ "$($jan28Hashes -join '|')" =~ `$COMMIT_HASH ]]; then
    if [[ "$($toKeep.Keys -join '|')" =~ `$COMMIT_HASH ]]; then
        git commit-tree "`$@"
    else
        skip_commit "`$@"
    fi
else
    git commit-tree "`$@"
fi
"@

$filterScript | Out-File -FilePath ".git/filter-script.sh" -Encoding ASCII

# Run filter-branch
Write-Host "Running git filter-branch (this may take a moment)..." -ForegroundColor Yellow
git filter-branch --commit-filter "bash .git/filter-script.sh" -- --all 2>$null

Remove-Item .git/filter-script.sh -Force

Write-Host "`n=== DONE ===" -ForegroundColor Green
$newCount = (git log main --pretty=format:"%ad" --date=short | Select-String "2026-01-28" | Measure-Object).Count
Write-Host "New Jan 28 count: $newCount`n" -ForegroundColor Cyan

Write-Host "To push:" -ForegroundColor Yellow
Write-Host "  git push origin main --force" -ForegroundColor White
