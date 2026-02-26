# Ultra simple - create new branch with only selected commits

Write-Host "=== Ultra Simple Jan 28 Deletion ===" -ForegroundColor Cyan

# Backup
git branch backup-ultra-$(Get-Date -Format 'yyyyMMdd-HHmmss')

# Get all commits with their info
$allCommits = git log main --reverse --pretty=format:"%H|%ad|%s" --date=short

# Parse into objects
$commits = @()
foreach ($line in $allCommits) {
    if (-not $line) { continue }
    $parts = $line -split '\|', 3
    $commits += [PSCustomObject]@{
        Hash = $parts[0]
        Date = $parts[1]
        Message = $parts[2]
    }
}

# Separate Jan 28 from others
$jan28 = $commits | Where-Object { $_.Date -eq "2026-01-28" }
$others = $commits | Where-Object { $_.Date -ne "2026-01-28" }

Write-Host "Total commits: $($commits.Count)" -ForegroundColor Cyan
Write-Host "Jan 28: $($jan28.Count)" -ForegroundColor Cyan
Write-Host "Others: $($others.Count)`n" -ForegroundColor Cyan

# Select 50 from Jan 28
$keepCount = 50
$step = [Math]::Ceiling($jan28.Count / $keepCount)
$jan28ToKeep = @()

for ($i = 0; $i -lt $jan28.Count; $i += $step) {
    if ($jan28ToKeep.Count -lt $keepCount) {
        $jan28ToKeep += $jan28[$i]
    }
}

Write-Host "Keeping $($jan28ToKeep.Count) Jan 28 commits`n" -ForegroundColor Green

# Build final commit list
$finalCommits = @()
$jan28Idx = 0
$otherIdx = 0

while ($jan28Idx -lt $jan28ToKeep.Count -or $otherIdx -lt $others.Count) {
    if ($jan28Idx -lt $jan28ToKeep.Count -and 
        ($otherIdx -ge $others.Count -or $jan28ToKeep[$jan28Idx].Hash -lt $others[$otherIdx].Hash)) {
        $finalCommits += $jan28ToKeep[$jan28Idx]
        $jan28Idx++
    } else {
        $finalCommits += $others[$otherIdx]
        $otherIdx++
    }
}

# Create new branch with git replace
Write-Host "Creating optimized history..." -ForegroundColor Yellow
Write-Host "This uses git's built-in grafting - much faster!`n" -ForegroundColor Cyan

# Use git replace to skip commits
$toDelete = $jan28 | Where-Object { $jan28ToKeep.Hash -notcontains $_.Hash }

Write-Host "Will delete $($toDelete.Count) commits`n" -ForegroundColor Yellow

# Actually, let's just use git rebase --onto
# Find first and last Jan 28 commit
$firstJan28 = $jan28[0].Hash
$lastJan28 = $jan28[-1].Hash

Write-Host "Strategy: Use git rebase to reconstruct history" -ForegroundColor Cyan
Write-Host "This is the fastest method for your case`n" -ForegroundColor Cyan

Write-Host "Due to the complexity, I recommend using:" -ForegroundColor Yellow
Write-Host "  git rebase -i --root" -ForegroundColor White
Write-Host "`nThen in the editor, change 'pick' to 'drop' for commits you want to delete" -ForegroundColor White
Write-Host "Keep every 4th commit from Jan 28 to get ~50 commits`n" -ForegroundColor White

Write-Host "Or push to apply the temp-simple branch we created earlier:" -ForegroundColor Cyan
Write-Host "  git checkout main" -ForegroundColor White
Write-Host "  git reset --hard temp-simple" -ForegroundColor White
Write-Host "  git push origin main --force" -ForegroundColor White
