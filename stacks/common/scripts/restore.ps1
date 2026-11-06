# Puts back a backup of scripts/backup.ps1: the local database and the files sent become exactly those of the backup.
#   scripts/restore.ps1                      the latest one of backups/
#   scripts/restore.ps1 2026-11-06_21-30     a given backup
# Started by start.bat then O. The site must be running (start.bat then D) when the database is in Docker.
param([string]$Name)
$ErrorActionPreference = [System.Management.Automation.ActionPreference]::Stop
$Root = Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot 'data.ps1')
$Data = Get-ProjectData $Root
$Backups = Join-Path $Root 'backups'
$Folder = if ($Name) { Join-Path $Backups $Name } elseif (Test-Path $Backups) { Get-ChildItem $Backups -Directory | Sort-Object Name | Select-Object -Last 1 -ExpandProperty FullName }
if (-not $Folder -or -not (Test-Path $Folder)) { throw 'No backup found in backups/.' }

$Answer = Read-Host "Replace the local data with the backup $(Split-Path -Leaf $Folder)? (y/n)"
if ($Answer -notin 'y', 'o') { Write-Host 'Nothing changed.'; exit 0 }

# MySQL of Docker: a dump made with GTIDs cannot be imported as it is, those lines are skipped
$Sql = Join-Path $Folder 'database.sql'
if ($Data.MySql -and (Test-Path $Sql)) {
    (Get-Content -Encoding utf8 $Sql | Where-Object { $_ -notmatch 'GTID_PURGED|SQL_LOG_BIN' }) -join "`n" |
        docker exec -i $Data.MySql.Container sh -c "mysql -uroot -p`"`$MYSQL_ROOT_PASSWORD`" $($Data.MySql.Database) 2>/dev/null"
    if ($LASTEXITCODE -ne 0) { throw 'The database could not be imported: start the site first (start.bat then D).' }
}

# SQLite: the files of the backup take the place of the current ones (stop the API first)
foreach ($File in $Data.Sqlite) {
    $Saved = Join-Path $Folder (Split-Path $File -Leaf)
    if (Test-Path $Saved) { Copy-Item $Saved $File -Force }
}

# Files sent: the files kept in Git (.htaccess, .gitkeep) stay, everything else is replaced by the backup
$Zip = Join-Path $Folder 'uploads.zip'
if ($Data.Uploads -and (Test-Path $Zip)) {
    Get-ChildItem $Data.Uploads -Force | Where-Object { $_.Name -notin '.htaccess', '.gitkeep' } | Remove-Item -Recurse -Force
    Expand-Archive -Path $Zip -DestinationPath $Data.Uploads -Force
}

Write-Host "Backup $(Split-Path -Leaf $Folder) put back." -ForegroundColor Green
