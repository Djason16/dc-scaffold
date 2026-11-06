# Data of the project that a backup keeps (scripts/backup.ps1, scripts/restore.ps1, menu of start.bat):
#   MySql    container and database of docker-compose.yml ($null without MySQL in Docker)
#   Sqlite   the SQLite files of backend/ and frontend/ (database/ and data/ folders, outside node_modules)
#   Uploads  folder of the files sent from the site ($null when there is none)
function Get-ProjectData([string]$Root) {
    $MySql = $null
    $Compose = Join-Path $Root 'docker-compose.yml'
    if (Test-Path $Compose) {
        $Text = Get-Content -Raw $Compose
        $Container = if ($Text -match 'container_name:\s*(\S+-db)\s') { $Matches[1] }
        $Database = if ($Text -match 'MYSQL_DATABASE:\s*(\S+)') { $Matches[1] }
        # ${DB_NAME:-name}: the value of the .env files, else the default value
        if ($Database -match '^\$\{(\w+)(?::-([^}]*))?\}$') {
            $Key, $Default = $Matches[1], $Matches[2]
            $Found = foreach ($Env in '.env', 'frontend\.env', 'backend\.env', 'app\.env') {
                $File = Join-Path $Root $Env
                if ((Test-Path $File) -and ((Get-Content -Raw $File) -match "(?m)^$Key=`"?([^`"\r\n]+)")) { $Matches[1]; break }
            }
            $Database = if ($Found) { $Found } else { $Default }
        }
        if ($Container -and $Database) { $MySql = [pscustomobject]@{ Container = $Container; Database = $Database } }
    }
    $Sqlite = @(foreach ($Side in 'backend', 'frontend') {
        foreach ($Folder in 'database', 'data', '.data') {
            $Path = Join-Path $Root "$Side\$Folder"
            if (Test-Path $Path) { Get-ChildItem $Path -Recurse -File -Include '*.sqlite', '*.db' | Where-Object { $_.FullName -notmatch '\\node_modules\\' } | ForEach-Object FullName }
        }
    })
    $Uploads = @('backend\uploads', 'backend\public\uploads', 'frontend\uploads') | ForEach-Object { Join-Path $Root $_ } | Where-Object { Test-Path $_ } | Select-Object -First 1
    [pscustomobject]@{ MySql = $MySql; Sqlite = $Sqlite; Uploads = $Uploads }
}
