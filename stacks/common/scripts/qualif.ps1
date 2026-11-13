# Qualif (the site shown to the client before it goes online, menu of start.bat: Q): builds the site with .env.preprod
# and prepares qualif/ at the root of the project, to upload as it is into the qualif folder of the host:
#   qualif/<site>/       the site (static), or the site and its API (one Node.js server: npm start)
#   qualif/<site>-api/   the separate API, with .env.preprod as its production settings
# The folders come from the addresses of .env.preprod (https://qualifs.example.com/<site>): nothing else to set.
# The code of the API does not change: a small entry file of the qualif removes the folder from the address.
param([string]$AppDir, [string]$ApiDir)

$Root = Split-Path $PSScriptRoot -Parent
. (Join-Path $PSScriptRoot 'common.ps1')
$Utf8 = New-Object System.Text.UTF8Encoding($false)

# Values of a .env file (quotes removed)
function Read-EnvFile([string]$File) {
    $values = [ordered]@{}
    if (-not (Test-Path $File)) { return $values }
    foreach ($line in Get-Content $File -Encoding UTF8) {
        if ($line -match '^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$') { $values[$Matches[1]] = $Matches[2].Trim('"', "'") }
    }
    return $values
}

# Folder of an address: https://qualifs.example.com/my-site -> my-site
function Get-UrlFolder([string]$Url) {
    if (-not $Url) { return '' }
    return ([uri]$Url).AbsolutePath.Trim('/')
}

$Out = Join-Path $Root 'qualif'
if (Test-Path $Out) { Remove-Item $Out -Recurse -Force }

# 1. The site: its qualif command builds it with .env.preprod and puts it in qualif/<site>/
$package = Join-Path $AppDir 'package.json'
$scripts = if (Test-Path $package) { (Get-Content $package -Raw | ConvertFrom-Json).scripts } else { $null }
$siteCommand = if ($scripts.'generate:qualif') { { npm run generate:qualif } }
    elseif ($scripts.'build:qualif') { { npm run build:qualif } }
    elseif (Test-Path (Join-Path $AppDir 'scripts\qualif.mjs')) { { node scripts/qualif.mjs } }
    else { $null }
if (-not $siteCommand) { Write-Fail 'This project has no qualif command (npm run generate:qualif or build:qualif).'; exit 1 }
if (-not (Test-Path (Join-Path $AppDir '.env.preprod'))) { Write-Fail 'frontend/.env.preprod is missing: a copy of .env.production with the qualif addresses.'; exit 1 }
Write-Title 'Qualif: the site'
if (-not (Invoke-In $AppDir $siteCommand)) { Write-Fail 'The qualif build of the site failed.'; exit 1 }
Get-ChildItem $Out -Directory -ErrorAction SilentlyContinue | ForEach-Object { Write-Ok "qualif/$($_.Name)" }

# 2. The separate API, in its own folder next to the site
$apiEnv = Join-Path $ApiDir '.env.preprod'
$isPhp = Test-Path (Join-Path $ApiDir 'public\index.php')
$isNode = -not $isPhp -and (Test-Path (Join-Path $ApiDir 'package.json'))
if (($isPhp -or $isNode) -and (Test-Path $apiEnv)) {
    # Its folder: the address of the API given to the site, else the one of the API itself, else <site>-api
    $front = Read-EnvFile (Join-Path $AppDir '.env.preprod')
    $back = Read-EnvFile $apiEnv
    $apiUrl = @($front.Keys | Where-Object { $_ -match '(API_URL|BACKEND_DOMAIN)$' } | ForEach-Object { $front[$_] }) + @($back.API_BASE_URL, $back.APP_URL) | Where-Object { $_ } | Select-Object -First 1
    $ApiFolder = Get-UrlFolder $apiUrl
    if (-not $ApiFolder) { Write-Fail 'Write the qualif address of the API in frontend/.env.preprod, with its folder.'; exit 1 }
    Write-Title 'Qualif: the API'
    $Api = Join-Path $Out $ApiFolder
    New-Item -ItemType Directory -Force $Api | Out-Null

    # The build of the API first when it has one (NestJS, AdonisJS, Nitro)
    $apiScripts = if ($isNode) { (Get-Content (Join-Path $ApiDir 'package.json') -Raw | ConvertFrom-Json).scripts } else { $null }
    if ($apiScripts.build -and -not (Invoke-In $ApiDir { npm run build })) { Write-Fail 'The build of the API failed.'; exit 1 }

    # AdonisJS is put online from its build/ folder; the others as they are
    $isAdonis = Test-Path (Join-Path $ApiDir 'adonisrc.ts')
    $from = if ($isAdonis) { Join-Path $ApiDir 'build' } else { $ApiDir }
    # Everything but the settings of dev and production, the local sessions, data and files sent, and the dev tools
    $skip = @('.env', '.env.local', '.env.dev', '.env.test', '.env.production', '.env.prod.local', '.env.preprod', '.env.example', 'Dockerfile', 'node_modules', 'sessions', 'var', 'uploads', 'storage', 'tests', '.startup.log')
    # Symfony reads its .env first (default values), then .env.prod.local
    $isSymfony = Test-Path (Join-Path $ApiDir 'bin\console')
    if ($isSymfony) { $skip = $skip | Where-Object { $_ -ne '.env' } }
    Get-ChildItem $from -Force | Where-Object { $skip -notcontains $_.Name } | ForEach-Object { Copy-Item $_.FullName $Api -Recurse -Force }
    # database/ holds code (migrations, schema): only the local data stays behind (SQLite files)
    $dataFiles = Join-Path $Api 'database'
    if (Test-Path $dataFiles) { Get-ChildItem $dataFiles -Recurse -File -Include '*.sqlite', '*.sqlite-*', '*.db', '*.db-*' | Remove-Item -Force }
    # Folders the API writes into: empty, with their .htaccess (the files sent never run as code)
    foreach ($dir in 'uploads', 'sessions', 'var', 'storage') {
        $source = Join-Path $ApiDir $dir
        if (-not (Test-Path $source)) { continue }
        New-Item -ItemType Directory -Force (Join-Path $Api $dir) | Out-Null
        Get-ChildItem $source -Recurse -Directory | ForEach-Object { New-Item -ItemType Directory -Force (Join-Path $Api $_.FullName.Substring($ApiDir.Length + 1)) | Out-Null }
        Get-ChildItem $source -Recurse -Force -File | Where-Object { $_.Name -in '.htaccess', '.gitkeep', '.gitignore' } |
            ForEach-Object { Copy-Item $_.FullName (Join-Path $Api $_.FullName.Substring($ApiDir.Length + 1)) -Force }
    }
    # The settings of the qualif, under the name the API reads online
    # (Laravel and AdonisJS only read .env)
    $isLaravel = Test-Path (Join-Path $ApiDir 'artisan')
    $settingsName = if ($isSymfony) { '.env.prod.local' } elseif ($isAdonis -or $isLaravel) { '.env' } else { '.env.production' }
    Copy-Item $apiEnv (Join-Path $Api $settingsName) -Force

    if ($isPhp) {
        # Entry .htaccess: everything goes into public/ (the code and the settings are never served)
        $rootRules = Join-Path $Api '.htaccess'
        $rules = if (Test-Path $rootRules) {
            (Get-Content $rootRules -Raw -Encoding UTF8).Replace('^/uploads/', "^/$ApiFolder/uploads/").Replace('!^/public/', "!^/$ApiFolder/public/").Replace(' /public/$1', " /$ApiFolder/public/`$1")
        } else {
            "RewriteEngine On`nRewriteCond %{REQUEST_URI} !^/$ApiFolder/public/`nRewriteRule ^(.*)$ /$ApiFolder/public/`$1 [L]`n"
        }
        $guard = "# Qualif: the settings, the code and the tools of the API are never served (only public/ and uploads/)`n" +
            "<FilesMatch `"^(\.env.*|composer\.(json|lock)|artisan|.*\.(md|ini|log|sql|neon|dist))$`">`n    Require all denied`n</FilesMatch>`n`n"
        [IO.File]::WriteAllText($rootRules, $guard + $rules, $Utf8)
        $publicRules = Join-Path $Api 'public\.htaccess'
        if (Test-Path $publicRules) {
            $text = (Get-Content $publicRules -Raw -Encoding UTF8) -replace '(?m)^(\s*)RewriteBase\s+/\s*$', "`$1RewriteBase /$ApiFolder/public/"
            [IO.File]::WriteAllText($publicRules, $text, $Utf8)
        }
        # Entry file of the qualif: the routes of the API start after its folder (its own index.php runs next)
        $index = Join-Path $Api 'public\index.php'
        Move-Item $index (Join-Path $Api 'public\index.api.php') -Force
        $entry = "<?php`n// Qualif: the API is served from /$ApiFolder/ of its address: its routes start after it (start.bat then Q)`n" +
            "if (str_starts_with(`$_SERVER['REQUEST_URI'] ?? '', '/$ApiFolder')) {`n" +
            "    `$_SERVER['REQUEST_URI'] = substr(`$_SERVER['REQUEST_URI'], strlen('/$ApiFolder')) ?: '/';`n}`n" +
            "`$_SERVER['SCRIPT_FILENAME'] = __DIR__ . '/index.api.php';`n`$_SERVER['SCRIPT_NAME'] = '/index.php';`n" +
            "return require __DIR__ . '/index.api.php';`n"
        [IO.File]::WriteAllText($index, $entry, $Utf8)
    } else {
        # Node.js: a start module of the qualif removes the folder from the address before the API sees it
        $preload = "// Qualif: the API is served from /$ApiFolder/ of its address: its routes start after it (start.bat then Q)`n" +
            "import http from 'node:http'`nconst emit = http.Server.prototype.emit`n" +
            "http.Server.prototype.emit = function (event, request, ...rest) {`n" +
            "    if (event === 'request' && request.url.startsWith('/$ApiFolder')) request.url = request.url.slice('/$ApiFolder'.length) || '/'`n" +
            "    return emit.call(this, event, request, ...rest)`n}`n"
        [IO.File]::WriteAllText((Join-Path $Api 'qualif-base.mjs'), $preload, $Utf8)
        $apiPackage = Join-Path $Api 'package.json'
        if (Test-Path $apiPackage) {
            $text = Get-Content $apiPackage -Raw -Encoding UTF8
            $text = $text -replace '("start"\s*:\s*"node)\s', '$1 --import ./qualif-base.mjs '
            if ($isAdonis -and $text -notmatch '"start"') { $text = $text -replace '"scripts"\s*:\s*\{', '"scripts": { "start": "node --import ./qualif-base.mjs bin/server.js",' }
            [IO.File]::WriteAllText($apiPackage, $text, $Utf8)
        }
    }
    Write-Ok "qualif/$ApiFolder"
}

Write-Host ''
Write-Info 'Upload the content of qualif/ into the qualif folder of the host (one folder per site), then:'
Write-Info '- API: create the qualif database (.env.preprod), import the tables with generic data, never the data of production'
Write-Info '- Node.js server (site or API): npm install --omit=dev then npm start in its folder'
