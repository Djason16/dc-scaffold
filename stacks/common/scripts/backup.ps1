# Backup of the local data into backups/<date-time>/: the MySQL database of Docker (database.sql), the SQLite files
# and the files sent from the site (uploads.zip). Started by start.bat then K. Restore: start.bat then O (scripts/restore.ps1).
# The site must be running (start.bat then D) when the database is in Docker.
$ErrorActionPreference = [System.Management.Automation.ActionPreference]::Stop
$Root = Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot 'data.ps1')
$Data = Get-ProjectData $Root
if (-not ($Data.MySql -or $Data.Sqlite.Count -or $Data.Uploads)) { Write-Host 'Nothing to back up in this project.'; exit 0 }

$Folder = Join-Path $Root ('backups\' + (Get-Date -Format 'yyyy-MM-dd_HH-mm'))
New-Item -ItemType Directory -Force $Folder | Out-Null

# MySQL of Docker: full export (structure and data)
if ($Data.MySql) {
    $Sql = Join-Path $Folder 'database.sql'
    docker exec $Data.MySql.Container sh -c "mysqldump -uroot -p`"`$MYSQL_ROOT_PASSWORD`" --single-transaction --routines --set-gtid-purged=OFF $($Data.MySql.Database) 2>/dev/null" | Out-File -Encoding utf8 $Sql
    if ($LASTEXITCODE -ne 0 -or (Get-Item $Sql).Length -lt 100) { throw 'The database could not be exported: start the site first (start.bat then D).' }
}

# SQLite: the files themselves
foreach ($File in $Data.Sqlite) { Copy-Item $File (Join-Path $Folder (Split-Path $File -Leaf)) }

# Files sent from the site (photos, documents...)
if ($Data.Uploads) { Compress-Archive -Path (Join-Path $Data.Uploads '*') -DestinationPath (Join-Path $Folder 'uploads.zip') -Force }

Write-Host "Backup done: $Folder" -ForegroundColor Green
