<#
.SYNOPSIS
    DC Scaffold engine - by Djason CHERY.
    Creates a web project from any front + any back end described in stacks/.

.DESCRIPTION
    Every front and back end is a folder in stacks/fronts or stacks/backs with a stack.json
    describing how to create it (see stacks/README.md). This engine only reads those files:
    adding a stack never requires changing this script.

    Usually started through DCScaffold.exe. Direct use:
        .\dc-scaffold.ps1 -Lang en -Name "My site" -Front vanilla -Back none
#>
[CmdletBinding()]
param(
    [ValidateSet('fr', 'en')]
    [string]$Lang,
    [string]$Name,
    [string]$Destination,
    [string]$Front,
    [string]$Back,
    [ValidateSet('mysql', 'sqlite', 'none')]
    [string]$Database,
    [ValidateSet('mysqli', 'pdo')]
    [string]$Driver,
    [ValidateSet('fr', 'en', 'fr,en', 'en,fr')]
    [string]$Languages,
    [int]$AppPort,
    [int]$ApiPort = 8000,
    [int]$PmaPort = 8081,
    [int]$DbPort = 3306,
    [switch]$UseLatest,
    [switch]$SkipToolCheck,
    [switch]$SkipInstall,
    [switch]$NoGit,
    # No VS Code / extension check (by default: VS Code, GitHub Copilot and the extensions of the chosen stacks)
    [switch]$NoEditor,
    [switch]$Force,
    # Started by the DC Scaffold window (DCScaffold.exe): no question, progress sent as "##DCS {json}" lines
    [switch]$Ui
)

$AppName = 'DC Scaffold'
# Version of the VERSION file at the root (next to engine/), the only place to change it
$AppVersion = (Get-Content (Join-Path (Split-Path $PSScriptRoot -Parent) 'VERSION') -ErrorAction SilentlyContinue | Select-Object -First 1)
if (-not $AppVersion) { $AppVersion = '0.0.0' }
$AppAuthor = 'Djason CHERY'

# Version "2026.10.19.1" or "1.0.0" -> [version] (0.0 when empty or unreadable)
function ConvertTo-Version([string]$Text) {
    $parsed = $null
    if ([version]::TryParse(("$Text".Trim() -replace '^v', ''), [ref]$parsed)) { return $parsed }
    return [version]'0.0'
}

# The downloaded stacks when they fit this version of DC Scaffold and are newer than the installed ones
function Get-NewestStacks([string]$InstalledDir) {
    if (-not $env:LOCALAPPDATA) { return $InstalledDir }
    $folder = Join-Path $env:LOCALAPPDATA 'DC Scaffold\catalog\current'
    $file = Join-Path $folder 'catalog.json'
    if (-not (Test-Path (Join-Path $folder 'stacks\fronts')) -or -not (Test-Path $file)) { return $InstalledDir }
    try { $downloaded = Get-Content $file -Raw -Encoding UTF8 | ConvertFrom-Json } catch { return $InstalledDir }
    $installed = Get-Content (Join-Path $InstalledDir 'version.txt') -ErrorAction SilentlyContinue | Select-Object -First 1
    $fits = -not $downloaded.minApp -or (ConvertTo-Version $downloaded.minApp) -le (ConvertTo-Version $AppVersion)
    if ($fits -and (ConvertTo-Version $downloaded.version) -gt (ConvertTo-Version $installed)) { return (Join-Path $folder 'stacks') }
    return $InstalledDir
}

$EngineDir = $PSScriptRoot
# Stacks of the installation, or the newer ones downloaded by DC Scaffold from the online catalog
# (%LOCALAPPDATA%\DC Scaffold\catalog\current): same rule as stacksDir() in launcher/catalog.go
$StacksDir = Join-Path (Split-Path $EngineDir -Parent) 'stacks'
$StacksDir = Get-NewestStacks $StacksDir
. (Join-Path $StacksDir 'common\scripts\common.ps1')

$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$Utf8Bom = New-Object System.Text.UTF8Encoding($true)
# The window reads this output through a pipe: UTF-8 keeps the accents
if ($Ui) { try { [Console]::OutputEncoding = $Utf8NoBom } catch { } }
try { [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12 } catch { }

# ===========================================================================
# Settings (language and last folder, remembered between runs)
# ===========================================================================

$SettingsDir = if ($env:APPDATA) { Join-Path $env:APPDATA $AppName } else { Join-Path $HOME '.dc-scaffold' }
$SettingsFile = Join-Path $SettingsDir 'settings.json'

function Get-Settings {
    try { return Get-Content $SettingsFile -Raw -Encoding UTF8 -ErrorAction Stop | ConvertFrom-Json } catch { return [pscustomobject]@{} }
}

function Save-Settings([hashtable]$Values) {
    $settings = @{}
    (Get-Settings).PSObject.Properties | ForEach-Object { $settings[$_.Name] = $_.Value }
    foreach ($key in $Values.Keys) { $settings[$key] = $Values[$key] }
    New-Item -ItemType Directory -Path $SettingsDir -Force | Out-Null
    [System.IO.File]::WriteAllText($SettingsFile, ($settings | ConvertTo-Json), $Utf8NoBom)
}

$Settings = Get-Settings

# ===========================================================================
# Language
# ===========================================================================

if (-not $Ui) { Clear-Host }
if (-not $Lang) {
    $previous = if ($Settings.lang) { $Settings.lang } else { 'fr' }
    Write-Host ''
    Write-MenuItem '1' 'Français' ''
    Write-MenuItem '2' 'English' ''
    $answer = Read-Default 'Langue / Language' $(if ($previous -eq 'en') { '2' } else { '1' })
    $Lang = if ($answer -in '2', 'en', 'english') { 'en' } else { 'fr' }
    Save-Settings @{ lang = $Lang }
}

$Strings = Get-Content (Join-Path $EngineDir "lang\$Lang.json") -Raw -Encoding UTF8 | ConvertFrom-Json
$YesKey = $Strings.yes_key
$NoKey = $Strings.no_key

# Comments of the generated code in the language picked at the start: the template files are written in English,
# stacks/shared/i18n/<lang>.json gives the text of each comment (and of the start.ps1 messages) in the other languages
$CommentTexts = New-Object 'System.Collections.Generic.Dictionary[string,string]'
$MessageTexts = [ordered]@{}
$i18nFile = Join-Path $StacksDir "shared\i18n\$Lang.json"
if (Test-Path $i18nFile) {
    $i18n = Get-Content $i18nFile -Raw -Encoding UTF8 | ConvertFrom-Json
    foreach ($entry in $i18n.comments.PSObject.Properties) { $CommentTexts[$entry.Name] = $entry.Value }
    foreach ($entry in $i18n.strings.PSObject.Properties) { $MessageTexts[$entry.Name] = $entry.Value }
}
# A whole comment line (// # * /* <!-- {/* -- ; REM ::), or a comment at the end of a line of code
$CommentPatterns = @(
    @{ Regex = [regex]'^(\s*)(//+|#+|\*|/\*\*?|<!--|\{/\*|--|;|REM|::|\|)(\s+)(.*?)(\s*(\*/\}|\*/|-->))?\s*$'; Group = 4 }
    @{ Regex = [regex]'^(\s*\S.*?)(\s+)(//|#|<!--|/\*|\{/\*)(\s+)(.*?)(\s*(\*/\}|\*/|-->))?\s*$'; Group = 5 }
)

function Convert-Comments([string]$Text, [string]$RelativePath) {
    if ($CommentTexts.Count -eq 0 -or -not $Text -or $RelativePath.EndsWith('.md')) { return $Text }
    $lines = $Text -split "`n"
    for ($i = 0; $i -lt $lines.Count; $i++) {
        foreach ($pattern in $CommentPatterns) {
            $match = $pattern.Regex.Match($lines[$i])
            if (-not $match.Success) { continue }
            $group = $match.Groups[$pattern.Group]
            $translated = $null
            if ($CommentTexts.TryGetValue($group.Value, [ref]$translated)) {
                $lines[$i] = $lines[$i].Substring(0, $group.Index) + $translated + $lines[$i].Substring($group.Index + $group.Length)
                break
            }
        }
    }
    $Text = $lines -join "`n"
    # Messages shown by start.ps1, between single or double quotes
    if ($RelativePath.EndsWith('.ps1')) {
        foreach ($key in $MessageTexts.Keys) {
            $Text = $Text.Replace("'$key'", "'" + $MessageTexts[$key].Replace("'", "''") + "'").Replace("`"$key`"", "`"$($MessageTexts[$key])`"")
        }
    }
    return $Text
}

# Translated text; extra arguments fill {0}, {1}...
function T([string]$Key) {
    $text = $Strings.$Key
    if (-not $text) { return $Key }
    # An empty value ("Git {1}" without a version) leaves no double space
    if ($args.Count) { return (($text -f $args) -replace '  +', ' ') }
    return $text
}

# Yes / no question (install a tool, update Node.js, new major version...):
#   console          -> asked in the console
#   window (-Ui)     -> asked in the window: a "question" event, then the answer is read from the file
#                       <DCS_ANSWERS>\<id> written by DCScaffold.exe ("y" or "n")
#   -Name given      -> no question: no
function Confirm-Choice([string]$Question, [bool]$Default) {
    if ($Ui -and $env:DCS_ANSWERS) {
        $id = [guid]::NewGuid().ToString('n')
        Send-UiEvent @{ type = 'question'; id = $id; text = $Question; default = $Default }
        $file = Join-Path $env:DCS_ANSWERS $id
        while (-not (Test-Path $file)) { Start-Sleep -Milliseconds 250 }
        $answer = ([System.IO.File]::ReadAllText($file).Trim() -eq 'y')
        Send-UiEvent @{ type = 'answered'; id = $id }
        Write-Info "$Question  ->  $(if ($answer) { T 'answer_yes' } else { T 'answer_no' })"
        return $answer
    }
    if ($Ui) {
        Write-Info "$Question  ->  $(if ($Default) { T 'answer_yes' } else { T 'answer_no' })"
        return $Default
    }
    if ($Interactive) { return Read-YesNo $Question $Default }
    return $false
}

# Progress for the window: one "##DCS {json}" line, read by DCScaffold.exe and never shown
function Send-UiEvent([hashtable]$Event) {
    if ($Ui) { Write-Host ('##DCS ' + ($Event | ConvertTo-Json -Compress -Depth 5)) }
}

# Text in the chosen language from a { "fr": "...", "en": "..." } object (or a plain string)
function Get-Localized($Value) {
    if ($Value -is [string]) { return $Value }
    if ($Value.$Lang) { return $Value.$Lang }
    return $Value.en
}

# ===========================================================================
# Helpers
# ===========================================================================

function ConvertTo-Slug([string]$Text) {
    $withoutAccents = -join ($Text.Normalize([Text.NormalizationForm]::FormD).ToCharArray() |
        Where-Object { [Globalization.CharUnicodeInfo]::GetUnicodeCategory($_) -ne 'NonSpacingMark' })
    return ($withoutAccents.ToLowerInvariant() -replace '[^a-z0-9]+', '-').Trim('-')
}

function New-RandomBytes([int]$Count) {
    $bytes = New-Object byte[] $Count
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    return $bytes
}

function New-Secret([int]$Length = 20) {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
    return -join (New-RandomBytes $Length | ForEach-Object { $chars[$_ % $chars.Length] })
}

function Test-PortInUse([int]$Port) {
    try { return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop) } catch { return $false }
}

# Replaces every {{TOKEN}}; {{NEW_SECRET}} / {{NEW_LARAVEL_KEY}} get a fresh value each time
function Expand-Tokens([string]$Text) {
    if (-not $Text) { return $Text }
    foreach ($key in $Tokens.Keys) { $Text = $Text.Replace("{{$key}}", [string]$Tokens[$key]) }
    while ($Text.Contains('{{NEW_SECRET}}')) {
        $Text = ([regex]'\{\{NEW_SECRET\}\}').Replace($Text, (New-Secret 32), 1)
    }
    while ($Text.Contains('{{NEW_LARAVEL_KEY}}')) {
        $Text = ([regex]'\{\{NEW_LARAVEL_KEY\}\}').Replace($Text, ('base64:' + [Convert]::ToBase64String((New-RandomBytes 32))), 1)
    }
    return $Text
}

# Only what the project asked for: the code between "@two-languages" and "@end-two-languages" (language buttons,
# saved language...) is kept for a site in two languages, the code between "@one-language" and "@end-one-language"
# for a site in one; the marker lines always go.
# For a site in one language, the texts of the other language are removed too (plugins/translations).
function Select-LanguageBlocks([string]$Text, [string]$RelativePath) {
    if (-not $Text -or -not ($Text.Contains('@two-languages') -or $Text.Contains('@one-language'))) { return Select-TranslationBlocks $Text $RelativePath }
    $twoLanguages = $SiteLanguages.Count -gt 1
    $block = ''
    $lines = foreach ($line in $Text -split "`n") {
        if ($line.Contains('@end-two-languages') -or $line.Contains('@end-one-language')) { $block = ''; continue }
        if ($line.Contains('@two-languages')) { $block = 'two'; continue }
        if ($line.Contains('@one-language')) { $block = 'one'; continue }
        if (-not $block -or ($block -eq 'two') -eq $twoLanguages) { $line }
    }
    # A removed block leaves no double blank line
    $text = [regex]::Replace(($lines -join "`n"), '\n[ \t]*\n([ \t]*\n)+', "`n`n")
    return Select-TranslationBlocks $text $RelativePath
}

function Select-TranslationBlocks([string]$Text, [string]$RelativePath) {
    if ($SiteLanguages.Count -gt 1 -or $RelativePath -notmatch 'plugins/translations/.+/[^/]+\.js$') { return $Text }
    foreach ($code in 'fr', 'en') {
        if ($code -notin $SiteLanguages) { $Text = [regex]::Replace($Text, "(?ms)^    $code`: \{\n.*?^    \},\n", '') }
    }
    return $Text
}

# ===========================================================================
# Site in one language: texts written straight into the components
# ===========================================================================
# With one language there is no translation system: plugins/lang, plugins/translations and useLang are not
# created, and every t('key') / getTranslation('key') / data-i18n="key" of the templates becomes its text,
# in the syntax of the file (Vue, JSX, Svelte, Astro, Angular, HTML or JavaScript).

# Texts of the language of the site, read in stacks/shared/front-core/plugins/translations and shared/dc-scaffold/texts
function Get-InlineTexts {
    $texts = New-Object 'System.Collections.Generic.Dictionary[string,string]' ([StringComparer]::Ordinal)
    $folders = (Join-Path $StacksDir 'shared\front-core\plugins\translations'), (Join-Path $StacksDir 'shared\dc-scaffold\texts')
    foreach ($file in Get-ChildItem -LiteralPath $folders -Recurse -File -Filter '*.js') {
        $text = Select-LanguageBlocks ([IO.File]::ReadAllText($file.FullName) -replace "`r`n", "`n") ''
        $block = [regex]::Match($text, "(?ms)^    $($SiteLanguages[0]):\s*\{\n(.*?)^    \},?")
        if (-not $block.Success) { continue }
        foreach ($line in $block.Groups[1].Value -split "`n") {
            $entry = [regex]::Match($line, '^\s+(\w+):\s*(?:''((?:[^''\\]|\\.)*)''|"((?:[^"\\]|\\.)*)"),?\s*$')
            if (-not $entry.Success) { continue }
            $value = if ($entry.Groups[2].Success) { $entry.Groups[2].Value } else { $entry.Groups[3].Value }
            $texts[$entry.Groups[1].Value] = [regex]::Replace($value, '\\(.)', '$1')
        }
    }
    return $texts
}

function ConvertTo-HtmlText([string]$Text) { return $Text.Replace('&', '&amp;').Replace('<', '&lt;').Replace('>', '&gt;') }
function ConvertTo-HtmlAttribute([string]$Text) { return (ConvertTo-HtmlText $Text).Replace('"', '&quot;') }
function ConvertTo-JsString([string]$Text) { return "'" + $Text.Replace('\', '\\').Replace("'", "\'") + "'" }
function ConvertTo-JsTemplate([string]$Text, [string]$Variable, [string]$Expression) {
    if ($Text -eq "{{$Variable}}") { return $Expression }  # the text is only the value: site.name
    $escaped = $Text.Replace('\', '\\').Replace('`', '\`').Replace('${', '\${')
    return '`' + $escaped.Replace("{{$Variable}}", '${' + $Expression + '}') + '`'
}

# Text of a key ("{{name}}" left in place when the call gives no value). The examples of the comments
# (about, contact...) are not in the translations: their text comes from engine/lang (text_<key>)
function Get-InlineText([string]$Key) {
    $text = $null
    if ($InlineTexts.TryGetValue($Key, [ref]$text)) { return $text }
    if ($Strings."text_$Key") { return $Strings."text_$Key" }
    Write-Warn "Text not found: $Key"
    return $Key
}

# A call of the templates: t('key'), getTranslation('key'), lang.getTranslation('key', { name: site.name }), t(lang, 'key') of Qwik...
$InlineCall = '(?:\$?lang\.getTranslation|\bgetTranslation|\bt)\(\s*(?:lang,\s*)?''(?<key>\w+)''\s*(?:,\s*\{\s*(?<var>\w+)\s*:\s*(?<expr>[^{}()]+?)\s*\}\s*)?\)'

function Convert-InlineTexts([string]$Text) {
    if (-not $Text) { return $Text }
    $code = $SiteLanguages[0]

    # 1. Vue / Angular text: {{ t('home') }} -> Accueil, a value -> {{ site.name }}
    $Text = [regex]::Replace($Text, "\{\{\s*$InlineCall\s*\}\}", {
        param($m)
        $html = ConvertTo-HtmlText (Get-InlineText $m.Groups['key'].Value)
        if ($m.Groups['var'].Success) { $html = $html.Replace("{{$($m.Groups['var'].Value)}}", "{{ $($m.Groups['expr'].Value) }}") }
        $html
    })
    # 2. Vue attribute: :aria-label="t('home')" -> aria-label="Accueil"
    $Text = [regex]::Replace($Text, "(?<=\s):(?<attr>[\w-]+)=""$InlineCall""", {
        param($m)
        $value = Get-InlineText $m.Groups['key'].Value
        if ($m.Groups['var'].Success) { return ":$($m.Groups['attr'].Value)=""$(ConvertTo-JsTemplate $value $m.Groups['var'].Value $m.Groups['expr'].Value)""" }
        "$($m.Groups['attr'].Value)=""$(ConvertTo-HtmlAttribute $value)"""
    })
    # 3. Angular attribute: [attr.aria-label]="lang.getTranslation('home')" -> aria-label="Accueil"
    $Text = [regex]::Replace($Text, "\[(?:attr\.)?(?<attr>[\w-]+)\]=""$InlineCall""", {
        param($m)
        $value = Get-InlineText $m.Groups['key'].Value
        if ($m.Groups['var'].Success) {
            $parts = $value -split [regex]::Escape("{{$($m.Groups['var'].Value)}}"), 2
            $joined = @((ConvertTo-JsString $parts[0]), $m.Groups['expr'].Value) + $(if ($parts.Count -gt 1) { ConvertTo-JsString $parts[1] } else { @() })
            return "[$($m.Groups['attr'].Value)]=""$(($joined | Where-Object { $_ -ne "''" }) -join ' + ')"""
        }
        "$($m.Groups['attr'].Value)=""$(ConvertTo-HtmlAttribute $value)"""
    })
    # 4. JSX / Svelte / Astro attribute: aria-label={t('home')} -> aria-label="Accueil"
    $Text = [regex]::Replace($Text, "(?<attr>[\w:-]+)=\{\s*$InlineCall\s*\}", {
        param($m)
        $value = Get-InlineText $m.Groups['key'].Value
        if ($m.Groups['var'].Success) { return "$($m.Groups['attr'].Value)={$(ConvertTo-JsTemplate $value $m.Groups['var'].Value $m.Groups['expr'].Value)}" }
        "$($m.Groups['attr'].Value)=""$(ConvertTo-HtmlAttribute $value)"""
    })
    # 5. JSX / Svelte / Astro text: {t('home')} -> Accueil, a value -> {site.name}
    $Text = [regex]::Replace($Text, "(?<!\$)\{\s*$InlineCall\s*\}", {
        param($m)
        $html = ConvertTo-HtmlText (Get-InlineText $m.Groups['key'].Value)
        if ($m.Groups['var'].Success) { $html = $html.Replace("{{$($m.Groups['var'].Value)}}", "{$($m.Groups['expr'].Value)}") }
        $html
    })
    # 6. JavaScript: t('home') -> 'Accueil', a value -> a template string
    $Text = [regex]::Replace($Text, $InlineCall, {
        param($m)
        $value = Get-InlineText $m.Groups['key'].Value
        if ($m.Groups['var'].Success) { return ConvertTo-JsTemplate $value $m.Groups['var'].Value $m.Groups['expr'].Value }
        ConvertTo-JsString $value
    })
    # 7. HTML filled by the browser: <h1 data-i18n="heroTitle"></h1> -> <h1>...</h1> ({{name}}: the element filled with the site name)
    $Text = [regex]::Replace($Text, '<(?<tag>\w+)(?<before>[^>]*?)\s+data-i18n="(?<key>\w+)"(?<after>[^>]*)>[^<]*</\k<tag>>', {
        param($m)
        $html = (ConvertTo-HtmlText (Get-InlineText $m.Groups['key'].Value)).Replace('{{name}}', '<span data-site-name>{{PROJECT_NAME}}</span>')
        "<$($m.Groups['tag'].Value)$($m.Groups['before'].Value)$($m.Groups['after'].Value)>$html</$($m.Groups['tag'].Value)>"
    })
    $Text = [regex]::Replace($Text, '\s+data-i18n=(?:"[^"]*"|\{[^}]*\})', '')
    # The same in JavaScript (h() of the HTML / CSS / JS front): { href: '/', 'data-i18n': 'home' }) -> { href: '/' }, 'Accueil')
    $Text = [regex]::Replace($Text, "\{\s*'data-i18n':\s*'(\w+)'\s*\}\)", { param($m) "{}, $(ConvertTo-JsString (Get-InlineText $m.Groups[1].Value)))" })
    $Text = [regex]::Replace($Text, ",\s*'data-i18n':\s*'(\w+)'\s*\}\)", { param($m) " }, $(ConvertTo-JsString (Get-InlineText $m.Groups[1].Value)))" })
    $Text = [regex]::Replace($Text, "'data-i18n-attr':\s*'([^']*)'", {
        param($m)
        ($m.Groups[1].Value -split ';' | ForEach-Object { $attribute, $key = $_ -split ':', 2; "'$attribute': $(ConvertTo-JsString (Get-InlineText $key))" }) -join ', '
    })
    # data-i18n-attr="aria-label:loading" -> aria-label="Chargement" (unless the tag already has it)
    $Text = [regex]::Replace($Text, '<[^<>]*\sdata-i18n-attr="(?<pairs>[^"]*)"[^<>]*>', {
        param($m)
        $tag = $m.Value -replace '\s+data-i18n-attr="[^"]*"', ''
        foreach ($pair in $m.Groups['pairs'].Value -split ';') {
            $attribute, $key = $pair -split ':', 2
            if ($key -and $tag -notmatch "\s$([regex]::Escape($attribute))=") {
                $tag = $tag -replace '(\s*/?>)$', " $attribute=""$(ConvertTo-HtmlAttribute (Get-InlineText $key))""`$1"
            }
        }
        $tag
    })
    # 8. Language of the page: lang.current -> 'fr'
    $Text = [regex]::Replace($Text, '=\{\s*lang\.current(?:\.value|\(\))?\s*\}', "=""$code""")
    $Text = [regex]::Replace($Text, '\blang\.current(?:\.value|\(\))?', "'$code'")
    $Text = [regex]::Replace($Text, '\bt:\s*lang\.getTranslation,\s*', '')
    $Text = $Text.Replace('.use(lang)', '')
    # 9. {{TEXT:key}} / {{TEXT_JS:key}} of the one-language blocks
    $Text = [regex]::Replace($Text, '\{\{TEXT:(\w+)\}\}', { param($m) Get-InlineText $m.Groups[1].Value })
    $Text = [regex]::Replace($Text, '\{\{TEXT_JS:(\w+)\}\}', { param($m) (Get-InlineText $m.Groups[1].Value).Replace('\', '\\').Replace("'", "\'") })

    # 10. Lines of the translation system: imports, "const t = ...", <LangProvider> (its content moves back one level)
    $lines = New-Object System.Collections.Generic.List[string]
    $dedent = 0
    foreach ($line in $Text -split "`n") {
        if ($line -match '^\s*import\s.*\bfrom\s+[''"][^''"]*(?:/useLang|/plugins/lang|\./lang|translations/translations)(?:\.\w+)*[''"];?\s*$') { continue }
        if ($line -match '^\s*(?:const|let|protected|private)\s+(?:\{\s*getTranslation\s*:\s*t\s*\}|lang|t)\s*=\s*(?:useLang\(\)|lang\.getTranslation|\([^)]*\)\s*=>\s*lang\.getTranslation\([^)]*\))\s*;?\s*$') { continue }
        if ($line -match '^\s*<LangProvider>\s*$') { $dedent++; continue }
        if ($line -match '^\s*</LangProvider>\s*$') { $dedent--; continue }
        if ($dedent -gt 0 -and $line.StartsWith('    ')) { $line = $line.Substring(4 * [Math]::Min($dedent, [int](($line.Length - $line.TrimStart().Length) / 4))) }
        # Comments that point to the translation files
        $line = [regex]::Replace($line, '\s*\((?:texts in|textes dans) [^)]*translations/[^)]*\)', '')
        $lines.Add($line)
    }
    return ($lines -join "`n")
}

# Writes a project file: tokens replaced, CRLF (+ BOM for PowerShell) for Windows scripts, LF otherwise
function Write-ProjectFile([string]$RelativePath, [string]$Content) {
    # Comments translated before the tokens are replaced: the keys of shared/i18n hold the {{TOKENS}} as written
    $text = Convert-Comments (Select-LanguageBlocks ($Content -replace "`r`n", "`n") $RelativePath) $RelativePath
    # One language: the texts straight into the components of the site (see Convert-InlineTexts)
    if ($InlineTexts -and $RelativePath -match '^frontend[\\/].*\.(vue|jsx?|tsx?|svelte|astro|html|mjs)$') { $text = Convert-InlineTexts $text }
    $text = Expand-Tokens $text
    $isPs1 = $RelativePath.EndsWith('.ps1')
    if ($isPs1 -or $RelativePath.EndsWith('.bat')) { $text = $text -replace "`n", "`r`n" }

    $path = Join-Path $Root $RelativePath
    New-Item -ItemType Directory -Path (Split-Path $path -Parent) -Force | Out-Null
    # Several stacks fill the same .env file (site, then API...): add to it instead of replacing it
    if ((Split-Path $path -Leaf) -like '.env*' -and (Test-Path $path)) {
        $text = ([System.IO.File]::ReadAllText($path) -replace "`r`n", "`n").TrimEnd() + "`n`n" + $text
    }
    [System.IO.File]::WriteAllText($path, $text, $(if ($isPs1) { $Utf8Bom } else { $Utf8NoBom }))

    if (-not $RelativePath.EndsWith('.gitkeep')) {
        Write-Host '    + ' -NoNewline -ForegroundColor Green
        Write-Host $RelativePath -ForegroundColor DarkGray
    }
}

# The two files of the design switch (frontend/dc-scaffold.config.js), with the DC Scaffold design on:
# the same text as frontend/scripts/design.mjs writes before every "npm run dev" and build.
function Write-DesignFiles {
    $relative = {
        param([string]$From, [string]$To)
        $path = [IO.Path]::GetRelativePath((Split-Path "/$From" -Parent), "/$To").Replace('\', '/')
        if ($path.StartsWith('.')) { $path } else { "./$path" }
    }
    $files = [ordered]@{
        $Tokens['DESIGN_JS']  = "export * from '$(& $relative $Tokens['DESIGN_JS'] "$($Tokens['DESIGN_FOLDER'])/index$($Tokens['DESIGN_INDEX_EXT'])")'`n"
        $Tokens['DESIGN_CSS'] = "@import `"$(& $relative $Tokens['DESIGN_CSS'] "$($Tokens['DESIGN_FOLDER'])/theme.css")`";`n"
    }
    if ($Tokens['DESIGN_TEXTS_JS']) {
        $files[$Tokens['DESIGN_TEXTS_JS']] = "import '$(& $relative $Tokens['DESIGN_TEXTS_JS'] "$($Tokens['DESIGN_FOLDER'])/texts/index.js")'`n"
    }
    foreach ($file in $files.Keys) {
        $comment = if ($file.EndsWith('.css')) { '/* {0} */' } else { '// {0}' }
        $header = $comment -f $Strings.design_generated.Replace('{0}', 'true')
        $path = Join-Path $Root "frontend/$file"
        New-Item -ItemType Directory -Path (Split-Path $path -Parent) -Force | Out-Null
        [System.IO.File]::WriteAllText($path, "$header`n$($files[$file])", $Utf8NoBom)
    }
}

# Copies a folder into the project. _gitignore / _gitattributes become .gitignore / .gitattributes.
function Copy-Template([string]$Source, [string]$To = '') {
    if (-not (Test-Path $Source)) { return }
    foreach ($file in Get-ChildItem -LiteralPath $Source -Recurse -File -Force) {
        $name = $file.Name -replace '^_(git\w+)$', '.$1'
        $inside = (Split-Path ($file.FullName.Substring($Source.Length).TrimStart('\', '/')) -Parent) -replace '\\', '/'
        $target = (@($To, $inside, $name) | Where-Object { $_ }) -join '/'
        # Fonts and images (the DC Scaffold design): copied as they are
        if ($file.Extension -in '.woff', '.woff2', '.ttf', '.png', '.jpg', '.ico', '.webp', '.avif', '.gif') {
            $path = Join-Path $Root $target
            New-Item -ItemType Directory -Path (Split-Path $path -Parent) -Force | Out-Null
            Copy-Item -LiteralPath $file.FullName -Destination $path -Force
            continue
        }
        Write-ProjectFile $target ([System.IO.File]::ReadAllText($file.FullName))
    }
}

# Copies images and other binary files as-is (Copy-Template would read them as text)
function Copy-Binary([string]$Source, [string]$To) {
    foreach ($file in Get-ChildItem -LiteralPath $Source -Recurse -File) {
        $relative = $file.FullName.Substring($Source.Length).TrimStart('\', '/') -replace '\\', '/'
        $target = Join-Path $Root "$To/$relative"
        New-Item -ItemType Directory -Path (Split-Path $target -Parent) -Force | Out-Null
        Copy-Item -LiteralPath $file.FullName -Destination $target -Force
    }
}

function Read-StackFile([string]$Path) {
    if (Test-Path $Path) { return Expand-Tokens ([System.IO.File]::ReadAllText($Path)) }
    return ''
}

# Sets KEY=value in a .env file (uncomments or appends the line when needed)
function Set-EnvValue([string]$Path, [string]$Key, [string]$Value) {
    $content = if (Test-Path $Path) { [System.IO.File]::ReadAllText($Path) } else { '' }
    $line = "$Key=$Value"
    $pattern = "(?m)^#?\s*$([regex]::Escape($Key))=.*$"
    $evaluator = [System.Text.RegularExpressions.MatchEvaluator] { $line }
    $content = if ($content -match $pattern) { ([regex]$pattern).Replace($content, $evaluator, 1) } else { $content.TrimEnd() + "`n$line`n" }
    [System.IO.File]::WriteAllText($Path, $content.TrimStart(), $Utf8NoBom)
}

# Replaces the first regex match in a file
function Edit-TextFile([string]$Path, [string]$Pattern, [scriptblock]$Replacement) {
    if (-not (Test-Path $Path)) { return }
    $content = [System.IO.File]::ReadAllText($Path)
    $evaluator = [System.Text.RegularExpressions.MatchEvaluator] $Replacement
    [System.IO.File]::WriteAllText($Path, ([regex]$Pattern).Replace($content, $evaluator, 1), $Utf8NoBom)
}

# ===========================================================================
# Stacks (stacks/fronts/*/stack.json and stacks/backs/*/stack.json)
# ===========================================================================

# Stacks of the installation, then your own ones in %APPDATA%\DC Scaffold\stacks (kept by updates, same id = replaces)
function Get-Stacks([string]$Kind) {
    $roots = @((Join-Path $StacksDir $Kind), (Join-Path $SettingsDir "stacks\$Kind")) | Where-Object { Test-Path $_ }
    $stacks = foreach ($folder in Get-ChildItem $roots -Directory) {
        $file = Join-Path $folder.FullName 'stack.json'
        if (-not (Test-Path $file)) { continue }
        try {
            $stack = Get-Content $file -Raw -Encoding UTF8 | ConvertFrom-Json
        } catch {
            Write-Warn (T 'stack_invalid' $file)
            continue
        }
        $stack | Add-Member -NotePropertyName id -NotePropertyValue $folder.Name -Force
        $stack | Add-Member -NotePropertyName path -NotePropertyValue $folder.FullName -Force
        $stack | Add-Member -NotePropertyName custom -NotePropertyValue $folder.FullName.StartsWith($SettingsDir) -Force
        $stack
    }

    $ordered = [ordered]@{}
    $stacks | Sort-Object { if ($_.order) { [int]$_.order } else { 50 } }, label, custom | ForEach-Object { $ordered[$_.id] = $_ }
    return $ordered
}

# Numbered menu; nothing is preselected, the user must pick
function Read-Stack([string]$Prompt, $Stacks) {
    $ids = @($Stacks.Keys)
    for ($i = 0; $i -lt $ids.Count; $i++) {
        $stack = $Stacks[$ids[$i]]
        Write-MenuItem ($i + 1) $stack.label (Get-Localized $stack.description)
    }
    while ($true) {
        $answer = Read-Default $Prompt ''
        if ($answer -match '^\d+$' -and [int]$answer -ge 1 -and [int]$answer -le $ids.Count) { return $ids[[int]$answer - 1] }
        if ($ids -contains "$answer".ToLower()) { return "$answer".ToLower() }
        Write-Warn (T 'invalid_choice')
    }
}

# Runs the steps of a stack.json inside backend/ or frontend/ (see stacks/README.md for every step)
function Invoke-StackSteps($Stack, [string]$Dir) {
    $target = Join-Path $Root $Dir
    $Tokens['DIR'] = $Dir
    $conditions = @{ api = $HasBack; noApi = -not $HasBack; front = $HasFront; noFront = -not $HasFront; db = $HasDatabase; noDb = -not $HasDatabase }

    foreach ($step in @($Stack.steps)) {
        if ($step.when -and -not $conditions[$step.when]) { continue }
        $operation = @($step.PSObject.Properties.Name | Where-Object { $_ -notin 'when', 'in', 'to' })[0]

        switch ($operation) {
            'run' {
                $command = @($step.run | ForEach-Object { Expand-Tokens $_ })
                $where = if ($step.in -eq 'root') { $Root } else { $target }
                $tool = $command[0]
                $arguments = @($command | Select-Object -Skip 1)
                Write-Info ($command -join ' ')
                $ok = switch ($tool) {
                    'composer' { Invoke-Composer $where $arguments }
                    'npm' { Invoke-In $where { & $Npm @arguments } }
                    'npx' { Invoke-In $where { & $Npx @arguments } }
                    default { Invoke-In $where { & $tool @arguments } }
                }
                # A failed command stops the stack, unless the step is marked "optional"
                if (-not $ok -and -not $step.optional) { return $false }
            }
            'check' {
                if (-not (Test-Path (Join-Path $target $step.check))) { return $false }
            }
            'flatten' {
                $nested = Join-Path $target $step.flatten
                if (Test-Path $nested) {
                    Get-ChildItem -LiteralPath $nested -Force | Move-Item -Destination $target -Force
                    Remove-Item -LiteralPath $nested -Recurse -Force
                    Write-Ok (T 'flattened' "$Dir/$($step.flatten)" $Dir)
                }
            }
            'copy' {
                $from = Expand-Tokens $step.copy
                $source = if ($from.StartsWith('@')) { Join-Path $StacksDir $from.Substring(1) } else { Join-Path $Stack.path $from }
                Copy-Template $source $(if ($step.to) { "$Dir/$($step.to)" } else { $Dir })
            }
            'touch' {
                $file = Join-Path $target $step.touch
                New-Item -ItemType Directory -Path (Split-Path $file -Parent) -Force | Out-Null
                if (-not (Test-Path $file)) { New-Item -ItemType File -Path $file | Out-Null }
            }
            'remove' {
                foreach ($pattern in @($step.remove)) {
                    # Get-Item: a folder is removed itself, not only its content
                    Get-Item -Path (Join-Path $target $pattern) -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
                }
            }
            'replace' {
                # Comments of the inserted text in the language of the project, like the copied files
                $with = Expand-Tokens (Convert-Comments $step.replace.with $step.replace.file)
                Edit-TextFile (Join-Path $target $step.replace.file) $step.replace.find { $with }
            }
            'insert' {
                # Keeps the original line break + indentation for what follows
                $text = Expand-Tokens (Convert-Comments $step.insert.text $step.insert.file)
                Edit-TextFile (Join-Path $target $step.insert.file) "(?<head>$($step.insert.after))(?<space>\s*)" {
                    param($match) $match.Groups['head'].Value + "`n" + $text + "`n" + $match.Groups['space'].Value
                }
            }
            'npm' {
                $set = @($step.npm.set.PSObject.Properties | Where-Object { $_ } | ForEach-Object { "$($_.Name)=$(Expand-Tokens $_.Value)" })
                $delete = @($step.npm.delete | Where-Object { $_ })
                if ($delete.Count) { Invoke-In $target { & $Npm pkg delete @delete } | Out-Null }
                if ($set.Count) { Invoke-In $target { & $Npm pkg set @set } | Out-Null }
            }
            'env' {
                $file = Join-Path $target $step.env.file
                if ($step.env.from -and -not (Test-Path $file)) { Copy-Item (Join-Path $target $step.env.from) $file -ErrorAction SilentlyContinue }
                foreach ($entry in $step.env.values.PSObject.Properties) { Set-EnvValue $file $entry.Name (Expand-Tokens $entry.Value) }
                Write-Host '    ~ ' -NoNewline -ForegroundColor Green
                Write-Host "$Dir/$($step.env.file)" -ForegroundColor DarkGray
            }
            default { Write-Warn (T 'unknown_step' $operation) }
        }
    }
    return $true
}

# Pins a package back to its stable major when the scaffolder installed a newer one
function Set-PinnedVersions($Stack, [string]$Dir) {
    foreach ($entry in @($Stack.versions | Where-Object { $_.pin })) {
        $resolved = $Resolved[$entry.token]
        if (-not $resolved.Latest -or (Get-Major $resolved.Version) -eq (Get-Major $resolved.Latest)) { continue }
        $pairs = @($entry.pin | ForEach-Object { "$_=^$($resolved.Version)" })
        Invoke-In (Join-Path $Root $Dir) { & $Npm pkg set @pairs } | Out-Null
        Write-Ok (T 'pinned' $entry.package $resolved.Version)
    }
}

# ===========================================================================
# Versions
# ===========================================================================

# Downloads JSON once per URL, $null when unreachable
$JsonCache = @{}
function Get-Json([string]$Url) {
    if (-not $JsonCache.ContainsKey($Url)) {
        try { $JsonCache[$Url] = Invoke-RestMethod $Url -TimeoutSec 10 } catch { $JsonCache[$Url] = $null }
    }
    return $JsonCache[$Url]
}

function Get-Major([string]$Version) { return [int]($Version.Split('.')[0]) }
function Get-MajorMinor([string]$Version) { return (($Version.Split('.') | Select-Object -First 2) -join '.') }

function Get-LatestVersion([string]$Package, [string]$Registry) {
    if ($Registry -eq 'npm') { return (Get-Json "https://registry.npmjs.org/$Package/latest").version }
    return (Get-Json "https://repo.packagist.org/p2/$Package.json").packages.$Package.version |
        ForEach-Object { $_ -replace '^v', '' } |
        Where-Object { $_ -match '^\d+\.\d+\.\d+$' } |
        Sort-Object { [version]$_ } -Descending |
        Select-Object -First 1
}

function Write-VersionLine([string]$Package, [string]$Found, [string]$Used, [string]$Note, [string]$Color) {
    Write-Host ('    ' + $Package.PadRight(22)) -NoNewline -ForegroundColor White
    Write-Host ($Found.PadRight(14) + '→ ') -NoNewline -ForegroundColor DarkGray
    Write-Host $Used.PadRight(9) -NoNewline -ForegroundColor $Color
    Write-Host $Note -ForegroundColor DarkGray
}

# Latest version within the stable major; asks before switching to a new major
function Resolve-Version($Entry) {
    $stable = [string]$Entry.stable
    $latest = Get-LatestVersion $Entry.package $Entry.registry

    if (-not $latest) {
        Write-VersionLine $Entry.package '?' "^$stable" (T 'registry_unreachable') 'Yellow'
        return [pscustomobject]@{ Version = $stable; Latest = $null }
    }
    if ((Get-Major $latest) -le (Get-Major $stable)) {
        $used = if ((Get-Major $latest) -eq (Get-Major $stable)) { Get-MajorMinor $latest } else { $stable }
        Write-VersionLine $Entry.package $latest "^$used" (T 'up_to_date') 'Green'
        return [pscustomobject]@{ Version = $used; Latest = $latest }
    }

    Write-VersionLine $Entry.package $latest '?' (T 'new_major' $stable) 'Yellow'
    $upgrade = $UseLatest -or (Confirm-Choice (T 'upgrade_question' $Entry.package $latest) $false)
    $used = if ($upgrade) { Get-MajorMinor $latest } else { $stable }
    Write-Info "$($Entry.package) -> ^$used"
    return [pscustomobject]@{ Version = $used; Latest = $latest }
}

# ===========================================================================
# Tools (Node, npm, Composer, Docker, Git)
# ===========================================================================

# Installed version of a command ("v22.19.0", "Composer version 2.8.12" -> "22.19.0"), $null if missing
function Get-ToolVersion([string]$Command) {
    if (-not (Test-Command $Command)) { return $null }
    $output = & $Command --version 2>$null | Out-String
    if ($output -match '(\d+\.\d+\.\d+)') { return $Matches[1] }
    return $null
}

# Checks a version against an npm "engines" range such as "^22.22.3 || ^24.15.0 || >=26.0.0"
function Test-VersionRange([string]$Version, [string]$Range) {
    if (-not $Range) { return $true }
    $current = [version]$Version
    foreach ($part in $Range -split '\|\|') {
        if ($part.Trim() -notmatch '^(\^|>=)\s*(\d+)(?:\.(\d+))?(?:\.(\d+))?$') { continue }
        $minimum = [version]('{0}.{1}.{2}' -f $Matches[2], [int]$Matches[3], [int]$Matches[4])
        if ($current -lt $minimum) { continue }
        if ($Matches[1] -eq '>=' -or $current.Major -eq $minimum.Major) { return $true }
    }
    return $false
}

# Reloads PATH from the registry so freshly installed tools work without reopening the console
function Update-SessionPath {
    $paths = foreach ($scope in 'Machine', 'User') { [Environment]::GetEnvironmentVariable('Path', $scope) }
    $joined = ($paths | Where-Object { $_ }) -join [IO.Path]::PathSeparator
    if ($joined) { $env:Path = $joined }
    $script:Npm = if (Test-Command 'npm.cmd') { 'npm.cmd' } else { 'npm' }
    $script:Npx = if (Test-Command 'npx.cmd') { 'npx.cmd' } else { 'npx' }
}

# Installs a tool with winget (Windows package manager), or opens its download page
function Install-Tool([string]$Label, [string]$WingetId, [string]$Url) {
    if (-not (Test-Command 'winget')) {
        Write-Warn (T 'winget_missing' $Label $Url)
        Start-Process $Url
        return $false
    }
    Write-Info (T 'installing' $Label)
    winget install --id $WingetId -e --accept-source-agreements --accept-package-agreements | Out-Host
    $ok = $LASTEXITCODE -eq 0
    Update-SessionPath
    if ($ok) { Write-Ok (T 'install_done' $Label) } else { Write-Warn (T 'install_failed' $Label $Url) }
    return $ok
}

function Install-Node([string]$Version) {
    if (Test-Command 'nvm') {
        nvm install $Version | Out-Host
        nvm use $Version | Out-Host
        Update-SessionPath
    } else {
        Install-Tool 'Node.js LTS' 'OpenJS.NodeJS.LTS' 'https://nodejs.org/' | Out-Null
    }
}

# VS Code command line (code.cmd): in the PATH, or in its usual folders right after its installation
function Find-VSCode {
    foreach ($command in 'code.cmd', 'code') { if (Test-Command $command) { return $command } }
    foreach ($folder in @($env:LOCALAPPDATA, $env:ProgramFiles) | Where-Object { $_ }) {
        $path = Join-Path $folder 'Programs\Microsoft VS Code\bin\code.cmd'
        if (Test-Path $path) { return $path }
        $path = Join-Path $folder 'Microsoft VS Code\bin\code.cmd'
        if (Test-Path $path) { return $path }
    }
    return $null
}

# Extensions recommended for this project: GitHub Copilot, then those of the chosen stacks ("vscode" in stack.json)
function Get-EditorExtensions {
    return @('GitHub.copilot-chat') + @($FrontStack.vscode) + @($BackStack.vscode) | Where-Object { $_ } | Select-Object -Unique
}

# VS Code and the recommended extensions: installed if missing (each time after asking)
function Test-Editor([string[]]$Extensions) {
    $code = Find-VSCode
    if (-not $code) {
        Write-VersionLine 'VS Code' (T 'missing') '-' (T 'editor_recommended') 'Yellow'
        if (Confirm-Choice (T 'install_question' 'Visual Studio Code' '') $true) {
            Install-Tool 'Visual Studio Code' 'Microsoft.VisualStudioCode' 'https://code.visualstudio.com/' | Out-Null
            $code = Find-VSCode
        }
        if (-not $code) { return }
    }
    $version = (& $code --version 2>$null | Select-Object -First 1)
    Write-VersionLine 'VS Code' "$version" "$version" (T 'installed') 'Green'

    $installed = @(& $code --list-extensions 2>$null)
    $missing = @($Extensions | Where-Object { $installed -notcontains $_ })
    if (-not $missing.Count) {
        Write-VersionLine (T 'extensions') "$($Extensions.Count)" "$($Extensions.Count)" (T 'installed') 'Green'
        return
    }
    Write-VersionLine (T 'extensions') "$($installed.Count)" "+$($missing.Count)" ($missing -join ', ') 'Yellow'
    if (-not (Confirm-Choice (T 'extensions_question' ($missing -join ', ')) $true)) { return }
    foreach ($id in $missing) {
        & $code --install-extension $id --force 2>&1 | Out-Host
        if ($LASTEXITCODE -eq 0) { Write-Ok (T 'install_done' $id) } else { Write-Warn (T 'extension_failed' $id) }
    }
}

# Composer without installer: composer.phar (checked with its sha256) and composer.cmd in
# %LOCALAPPDATA%\Programs\Composer, added to the PATH of the user
function Install-Composer([string]$Site = 'https://getcomposer.org') {
    $folder = Join-Path $env:LOCALAPPDATA 'Programs\Composer'
    $phar = Join-Path $folder 'composer.phar'
    Write-Info (T 'installing' 'Composer')
    try {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Invoke-WebRequest "$Site/download/latest-stable/composer.phar" -OutFile $phar -UseBasicParsing
        Invoke-WebRequest "$Site/download/latest-stable/composer.phar.sha256" -OutFile "$phar.sha256" -UseBasicParsing
        $expected = ([IO.File]::ReadAllText("$phar.sha256").Trim() -split '\s+')[0]
        Remove-Item "$phar.sha256"
        if ((Get-FileHash $phar -Algorithm SHA256).Hash -ne $expected) { throw 'sha256' }
        [IO.File]::WriteAllText((Join-Path $folder 'composer.cmd'), "@php `"%~dp0composer.phar`" %*`r`n")
        $userPath = "$([Environment]::GetEnvironmentVariable('Path', 'User'))"
        if (($userPath -split ';') -notcontains $folder) {
            [Environment]::SetEnvironmentVariable('Path', (($userPath.TrimEnd(';'), $folder) -join ';').TrimStart(';'), 'User')
        }
        Update-SessionPath
        Write-Ok (T 'install_done' 'Composer')
        return $true
    } catch {
        Remove-Item $phar -ErrorAction SilentlyContinue
        Write-Warn (T 'install_failed' 'Composer' 'https://getcomposer.org/download/')
        return $false
    }
}

function Test-DockerRunning {
    docker info *> $null
    return $LASTEXITCODE -eq 0
}

# Starts Docker Desktop and waits until the engine answers (up to 3 minutes)
function Start-DockerDesktop {
    if (-not $env:ProgramFiles) { return $false }
    $exe = Join-Path $env:ProgramFiles 'Docker\Docker\Docker Desktop.exe'
    if (-not (Test-Path $exe)) { return $false }
    Start-Process $exe
    Write-Info (T 'docker_starting')
    for ($i = 0; $i -lt 60; $i++) {
        if (Test-DockerRunning) { return $true }
        Start-Sleep -Seconds 3
    }
    return $false
}

# Enables PHP extensions in a php.ini: uncomments ";extension=name" or adds the line. Returns the names enabled.
function Enable-PhpIniExtensions([string]$IniPath, [string]$ExtDir, [string[]]$Names) {
    $text = [IO.File]::ReadAllText($IniPath)
    $enabled = @()
    foreach ($name in $Names) {
        if (-not (Test-Path (Join-Path $ExtDir "php_$name.dll"))) { continue }
        $pattern = '(?m)^[ \t]*;[ \t]*extension[ \t]*=[ \t]*"?(php_)?' + [regex]::Escape($name) + '(\.dll)?"?[ \t]*(?=\r?$)'
        if ($text -match $pattern) { $text = [regex]::Replace($text, $pattern, "extension=$name") }
        else { $text = $text.TrimEnd() + "`r`nextension=$name`r`n" }
        $enabled += $name
    }
    # Absolute extension_dir: a relative "ext" depends on the folder PHP is started from
    if ($enabled -and $text -notmatch '(?m)^[ \t]*extension_dir[ \t]*=') {
        $text = $text.TrimEnd() + "`r`nextension_dir = `"$ExtDir`"`r`n"
    }
    if ($enabled) { [IO.File]::WriteAllText($IniPath, $text, (New-Object Text.UTF8Encoding $false)) }
    return $enabled
}

# PHP of the computer, used by Composer (the API runs in Docker): offers to enable the extensions the stack expects
function Test-PhpExtensions([string[]]$Extensions) {
    if (-not $Extensions -or -not (Test-Command 'php')) { return }
    $loaded = @(php -m 2>$null | ForEach-Object { $_.Trim().ToLower() })
    $missing = @($Extensions | Where-Object { $_.ToLower() -notin $loaded })
    if (-not $missing) {
        Write-VersionLine (T 'php_extensions') "$($Extensions.Count)" "$($Extensions.Count)" (T 'php_ext_ok') 'Green'
        return
    }
    Write-VersionLine (T 'php_extensions') "$($Extensions.Count - $missing.Count)" "$($Extensions.Count)" (T 'php_ext_missing' ($missing -join ', ')) 'Yellow'
    if ($env:OS -ne 'Windows_NT') { Write-Info (T 'php_ext_manual'); return }

    $phpDir = Split-Path (php -r 'echo PHP_BINARY;')
    $ini = "$(php -r 'echo php_ini_loaded_file();')"
    if (-not $ini) { $ini = Join-Path $phpDir 'php.ini' }
    if (-not (Confirm-Choice (T 'php_ext_question' $ini) $true)) { Write-Info (T 'php_ext_skipped'); return }

    try {
        if (-not (Test-Path $ini)) {
            $template = Join-Path $phpDir 'php.ini-development'
            if (Test-Path $template) { Copy-Item $template $ini -ErrorAction Stop } else { Set-Content $ini '[PHP]' -ErrorAction Stop }
            Write-Ok (T 'php_ini_created' $ini)
        } else {
            Copy-Item $ini "$ini.bak" -Force -ErrorAction Stop
        }
        $enabled = @(Enable-PhpIniExtensions $ini (Join-Path $phpDir 'ext') $missing)
    } catch {
        Write-Fail (T 'php_ext_failed' $ini $_.Exception.Message)
        return
    }

    $loaded = @(php -m 2>$null | ForEach-Object { $_.Trim().ToLower() })
    $active = @($enabled | Where-Object { $_.ToLower() -in $loaded })
    $absent = @($missing | Where-Object { $_.ToLower() -notin $loaded })
    if ($active) { Write-Ok (T 'php_ext_done' ($active -join ', ')) }
    if ($absent) { Write-Warn (T 'php_ext_unavailable' ($absent -join ', ')) }
}

# Checks every tool the chosen stack needs and installs or updates what is missing, before anything is created
function Test-Tools([string[]]$Needs, [string[]]$NpmPackages, [object[]]$NodeRanges = @(), [string[]]$PhpExtensions = @()) {
    if ($Needs -contains 'node') {
        # Node.js must match the "engines" range of every npm package of the stack
        $lts = Get-Json 'https://nodejs.org/dist/index.json' | Where-Object { $_.lts } | Select-Object -First 1
        $target = if ($lts) { $lts.version -replace '^v', '' } else { 'lts' }
        # Shown in the messages (nodejs.org unreachable: "LTS", the install still takes the latest LTS)
        $targetLabel = if ($lts) { $target } else { 'LTS' }
        $node = Get-ToolVersion 'node'

        if (-not $node) {
            Write-VersionLine 'Node.js' (T 'missing') $targetLabel (T 'required') 'Red'
            if (Confirm-Choice (T 'install_question' 'Node.js' $targetLabel) $true) {
                Install-Node $target
                $node = Get-ToolVersion 'node'
            }
            if (-not $node) { Write-Fail (T 'tool_still_missing' 'Node.js'); exit 1 }
        }

        $blocking = @($NodeRanges) + @($NpmPackages |
            ForEach-Object { [pscustomobject]@{ Package = $_; Range = (Get-Json "https://registry.npmjs.org/$_/latest").engines.node } }) |
            Where-Object { $_.Range -and -not (Test-VersionRange $node $_.Range) } |
            Select-Object -First 1
        if ($blocking) {
            Write-VersionLine 'Node.js' $node $targetLabel (T 'too_old_for' $blocking.Package $blocking.Range) 'Yellow'
            if (Confirm-Choice (T 'update_node_question' $targetLabel) $true) {
                Install-Node $target
                $node = Get-ToolVersion 'node'
                Write-VersionLine 'Node.js' $node $node (T 'installed') 'Green'
            }
        } elseif ($lts -and [version]$node -lt [version]$target) {
            # Optional: the current Node.js works, the new LTS also brings its own npm
            Write-VersionLine 'Node.js' $node $targetLabel (T 'lts_available' $target) 'Yellow'
            if (Confirm-Choice (T 'update_node_question' $targetLabel) $false) {
                Install-Node $target
                $node = Get-ToolVersion 'node'
                Write-VersionLine 'Node.js' $node $node (T 'installed') 'Green'
            }
        } else {
            Write-VersionLine 'Node.js' $node $node (T 'compatible') 'Green'
        }

        # npm ships with Node.js and is updated with it: shown for information only
        $npm = Get-ToolVersion $Npm
        if ($npm) { Write-VersionLine 'npm' $npm $npm (T 'npm_with_node') 'Green' }
    }

    if ($Needs -contains 'docker') {
        $docker = Get-ToolVersion 'docker'
        if (-not $docker) {
            Write-VersionLine 'Docker' (T 'missing') 'Desktop' (T 'docker_required') 'Red'
            if (Confirm-Choice (T 'install_question' 'Docker Desktop' '') $true) {
                if (Install-Tool 'Docker Desktop' 'Docker.DockerDesktop' 'https://www.docker.com/products/docker-desktop/') {
                    Write-Warn (T 'docker_restart_hint')
                }
                $docker = Get-ToolVersion 'docker'
            }
        } else {
            Write-VersionLine 'Docker' $docker $docker (T 'installed') 'Green'
        }

        if ($docker -and -not (Test-DockerRunning)) {
            Write-Warn (T 'docker_not_running')
            if (Confirm-Choice (T 'start_docker_question') $true) {
                if (Start-DockerDesktop) { Write-Ok (T 'docker_started') } else { Write-Warn (T 'docker_start_failed') }
            }
        }
    }

    if ($Needs -contains 'php') {
        # PHP on the computer: the project runs in Docker, but the editor, Composer and "php artisan"
        # are simpler with PHP installed (the same version as the Docker image)
        $php = Get-ToolVersion 'php'
        if (-not $php) {
            Write-VersionLine 'PHP' (T 'missing') $PhpVersion (T 'php_recommended') 'Yellow'
            if (Confirm-Choice (T 'install_question' 'PHP' $PhpVersion) $true) {
                Install-Tool "PHP $PhpVersion" "PHP.PHP.$PhpVersion" 'https://windows.php.net/download/' | Out-Null
                $php = Get-ToolVersion 'php'
            }
        }
        if ($php) {
            $note = if ((Get-MajorMinor $php) -eq $PhpVersion) { T 'installed' } else { T 'php_docker_version' $PhpVersion }
            Write-VersionLine 'PHP' $php $php $note 'Green'
        }
    }

    if ($Needs -contains 'composer') {
        # Composer: installed when PHP is there; without PHP, the composer:2 Docker image is used
        $composer = Get-ToolVersion 'composer'
        $asked = $false
        if (-not $composer -and (Get-ToolVersion 'php')) {
            $asked = $true
            Write-VersionLine 'Composer' (T 'missing') '-' (T 'composer_recommended') 'Yellow'
            if ((Confirm-Choice (T 'install_question' 'Composer' '') $true) -and (Install-Composer)) { $composer = Get-ToolVersion 'composer' }
        }
        $releases = Get-Json 'https://getcomposer.org/versions'
        $latest = if ($releases) { $releases.stable[0].version } else { $null }
        if (-not $composer -and -not $asked) {
            $docker = Get-ToolVersion 'docker'
            Write-VersionLine 'Composer' (T 'missing') '-' $(if ($docker) { T 'composer_via_docker' } else { T 'composer_needs_docker' }) $(if ($docker) { 'DarkGray' } else { 'Red' })
        } elseif (-not $composer) {
            Write-Info (T 'composer_via_docker')
        } elseif ($latest -and [version]$composer -lt [version]$latest) {
            Write-VersionLine 'Composer' $composer $latest (T 'update_available') 'Yellow'
            if (Confirm-Choice (T 'update_composer_question' $latest) $true) {
                composer self-update | Out-Host
                if ($LASTEXITCODE -ne 0) { Write-Warn (T 'composer_update_failed') }
            }
        } else {
            Write-VersionLine 'Composer' $composer $composer $(if ($latest) { T 'up_to_date' } else { T 'installed' }) 'Green'
        }
        if ($composer) { Test-PhpExtensions $PhpExtensions }
    }

    $git = Get-ToolVersion 'git'
    if (-not $git) {
        Write-VersionLine 'Git' (T 'missing') '-' (T 'git_skipped') 'Yellow'
        if (-not $NoGit -and (Confirm-Choice (T 'install_question' 'Git' '') $true)) {
            Install-Tool 'Git' 'Git.Git' 'https://git-scm.com/download/win' | Out-Null
            $git = Get-ToolVersion 'git'
        }
    }
    if ($git) { Write-VersionLine 'Git' $git $git (T 'installed') 'Green' }

    if (-not $NoEditor) { Test-Editor (Get-EditorExtensions) }
}

# ===========================================================================
# Banner
# ===========================================================================

if (-not $Ui) { Clear-Host }
Write-Host ''
$banner = Join-Path $EngineDir 'banner.txt'
$width = try { $Host.UI.RawUI.WindowSize.Width } catch { 0 }
if (-not $Ui -and (Test-Path $banner) -and $width -ge 90) {
    Get-Content $banner -Encoding UTF8 | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    Write-Host ''
}
# The window shows its own title: no frame in its log
if (-not $Ui) {
    Write-Box @(
        "$AppName  v$AppVersion"
        (T 'tagline')
        "$(T 'by') $AppAuthor"
    )
}

$Fronts = Get-Stacks 'fronts'
$Backs = Get-Stacks 'backs'
$Interactive = [string]::IsNullOrWhiteSpace($Name)

# ===========================================================================
# 1. Configuration
# ===========================================================================

Write-Title "[1/8] $(T 'step_config')"
Send-UiEvent @{ type = 'step'; step = 1; total = 8; title = "$(T 'step_config')" }

if ($Interactive) {
    do { $Name = Read-Default (T 'ask_name') '' } while ([string]::IsNullOrWhiteSpace($Name))
    $lastFolder = if ($Settings.destination -and (Test-Path $Settings.destination)) { $Settings.destination } else { (Get-Location).Path }
    $Destination = Read-Default (T 'ask_destination') $(if ($Destination) { $Destination } else { $lastFolder })

    while ($true) {
        Write-Host ''
        Write-Info (T 'front_title')
        $Front = Read-Stack (T 'ask_choice') $Fronts
        Write-Host ''
        Write-Info (T 'back_title')
        $Back = Read-Stack (T 'ask_choice') $Backs
        if ($Front -ne 'none' -or $Back -ne 'none') { break }
        Write-Warn (T 'need_one_side')
    }
    Write-Host ''
}

if (-not $Destination) { $Destination = (Get-Location).Path }
if (-not $Fronts.Contains("$Front")) { Write-Fail (T 'unknown_stack' $Front ($Fronts.Keys -join ', ')); exit 1 }
if (-not $Backs.Contains("$Back")) { Write-Fail (T 'unknown_stack' $Back ($Backs.Keys -join ', ')); exit 1 }

$FrontStack = $Fronts[$Front]
$BackStack = $Backs[$Back]
$HasFront = $Front -ne 'none'
$HasBack = $Back -ne 'none'
$NodeBack = $BackStack.runtime -eq 'node'

# Default port of the front framework (Vite 5173, Astro 4321...), unless -AppPort is given
if (-not $AppPort) { $AppPort = if ($FrontStack.port) { [int]$FrontStack.port } else { 3000 } }

# Database: always MySQL for PHP back ends ("database": true); the JavaScript ones ("optional") can use SQLite instead
if ($Database -eq 'sqlite') { $Database = 'none' }
if ($BackStack.database -eq $true) { $Database = 'mysql' }
if ($HasBack -and $BackStack.database -eq 'optional' -and -not $Database) {
    if ($Interactive) {
        Write-Host ''
        Write-Info (T 'database_title')
        Write-MenuItem '1' 'MySQL' (T 'db_mysql')
        Write-MenuItem '2' $(if ($BackStack.fallbackDatabase) { $BackStack.fallbackDatabase } else { T 'db_none_label' }) $(if ($BackStack.noDatabase) { Get-Localized $BackStack.noDatabase } else { T 'db_none' })
        $Database = if ((Read-Default (T 'ask_choice') '1') -eq '2') { 'none' } else { 'mysql' }
    } else {
        $Database = 'mysql'
    }
}
$HasDatabase = $HasBack -and [bool]$BackStack.database -and $Database -ne 'none'

# PHP access to MySQL: mysqli or PDO (stacks that declare "drivers")
$drivers = @($BackStack.drivers | Where-Object { $_ })
if (-not $Driver) { $Driver = if ($drivers.Count) { $drivers[0] } else { 'mysqli' } }
if ($HasDatabase -and $drivers.Count -gt 1 -and $Interactive -and -not $PSBoundParameters.ContainsKey('Driver')) {
    Write-Host ''
    Write-Info (T 'driver_title')
    for ($i = 0; $i -lt $drivers.Count; $i++) { Write-MenuItem ($i + 1) $drivers[$i] (T "driver_$($drivers[$i])") }
    $answer = Read-Default (T 'ask_choice') '1'
    if ($answer -match '^\d+$' -and [int]$answer -ge 1 -and [int]$answer -le $drivers.Count) { $Driver = $drivers[[int]$answer - 1] }
    Write-Host ''
}

if (-not $HasFront -and -not $HasBack) { Write-Fail (T 'need_one_side'); exit 1 }

# Languages of the site: one, or two with the language buttons
if ($HasFront -and -not $Languages) {
    $Languages = $Lang
    if ($Interactive) {
        Write-Info (T 'lang_title')
        Write-MenuItem '1' (T 'lang_fr') (T 'lang_fr_hint')
        Write-MenuItem '2' (T 'lang_en') (T 'lang_en_hint')
        Write-MenuItem '3' (T 'lang_both') (T 'lang_both_hint')
        $answer = Read-Default (T 'ask_choice') $(if ($Lang -eq 'en') { '2' } else { '1' })
        $Languages = switch ($answer) { '2' { 'en' } '3' { if ($Lang -eq 'en') { 'en,fr' } else { 'fr,en' } } default { 'fr' } }
        Write-Host ''
    }
}
$SiteLanguages = @("$Languages" -split ',' | Where-Object { $_ })
if (-not $SiteLanguages) { $SiteLanguages = @('fr') }

if ($Interactive) {
    if ($HasFront) { $AppPort = [int](Read-Default (T 'ask_app_port') $AppPort) }
    if ($HasBack) { $ApiPort = [int](Read-Default (T 'ask_api_port') $ApiPort) }
    if ($HasDatabase) {
        $PmaPort = [int](Read-Default (T 'ask_pma_port') $PmaPort)
        if ($NodeBack) { $DbPort = [int](Read-Default (T 'ask_db_port') $DbPort) }
    }
    $NoGit = -not (Read-YesNo (T 'ask_git') $true)
    Write-Host ''
}

$ProjectName = ($Name -replace '["`]', '').Trim()
$Slug = ConvertTo-Slug $ProjectName
$Destination = (Resolve-Path -LiteralPath $Destination -ErrorAction SilentlyContinue).Path
if (-not $Slug) { Write-Fail (T 'invalid_name'); exit 1 }
if (-not $Destination) { Write-Fail (T 'destination_not_found'); exit 1 }
Save-Settings @{ destination = $Destination }

$Root = Join-Path $Destination $Slug
# Only a folder created by this run is deleted when the creation fails, never existing content
$RemoveOnFailure = -not ((Test-Path $Root) -and (Get-ChildItem -LiteralPath $Root -Force))
# The window deletes this folder itself when the creation is cancelled
Send-UiEvent @{ type = 'root'; root = $Root; removable = $RemoveOnFailure }
if ((Test-Path $Root) -and (Get-ChildItem -LiteralPath $Root -Force) -and -not $Force) {
    Write-Fail (T 'folder_exists' $Root)
    exit 1
}

# Versions of the Docker images (stacks/infra/versions.json, kept up to date by the compatibility robot):
# the latest MySQL LTS (long-term support) and a PHP version out for at least 6 months
$InfraVersions = Get-Content (Join-Path $StacksDir 'infra\versions.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$MySqlVersion = [string]$InfraVersions.mysql
# PHP of the API Docker image: Composer resolves the packages for this version, not the machine's.
# The image always runs the latest patch of that minor version, hence "8.4.99" for config.platform.php
$PhpVersion = [string]$InfraVersions.php
$DbName = ($Slug -replace '-', '_') + '_db'
$DbPass = New-Secret

$labels = @()
if ($HasFront) { $labels += $FrontStack.label }
if ($HasBack) { $labels += $BackStack.label }
if ($HasDatabase) { $labels += "MySQL $MySqlVersion" + $(if ($drivers.Count -gt 1) { " ($(if ($Driver -eq 'pdo') { 'PDO' } else { $Driver }))" } else { '' }) }
if ($HasBack -and -not $HasDatabase) { $labels += $(if ($BackStack.fallbackDatabase) { $BackStack.fallbackDatabase } else { T 'no_database' }) }
if (-not $HasBack) { $labels += (T 'static_site') }
if (-not $HasFront) { $labels += (T 'api_only') }
$StackLabel = $labels -join '  ·  '

Write-Ok "$((T 'project').PadRight(9)) $ProjectName"
Write-Ok "$((T 'folder').PadRight(9)) $Root"
Write-Ok "$((T 'stack').PadRight(9)) $StackLabel"

$ports = @()
if ($HasFront) { $ports += $AppPort }
if ($HasBack) { $ports += $ApiPort }
if ($HasDatabase) { $ports += $PmaPort }
if ($HasDatabase -and $NodeBack) { $ports += $DbPort }
foreach ($port in $ports) { if (Test-PortInUse $port) { Write-Warn (T 'port_used' $port) } }

# ===========================================================================
# 2. Tools
# ===========================================================================

Write-Title "[2/8] $(T 'step_tools')"
Send-UiEvent @{ type = 'step'; step = 2; total = 8; title = "$(T 'step_tools')" }

$versionEntries = @($FrontStack.versions) + @($BackStack.versions) | Where-Object { $_ }
# Docker is needed for PHP back ends, MySQL and the static front server; a Node.js API alone runs without it
$backNeeds = @($BackStack.requires | Where-Object { $_ -and ($_ -ne 'docker' -or $BackStack.runtime -eq 'php' -or $HasDatabase) })
$needs = @($FrontStack.requires) + $backNeeds + @(if ($BackStack.runtime -eq 'php') { 'php' }) | Where-Object { $_ } | Select-Object -Unique
if ($SkipToolCheck) { Write-Info (T 'skipped') }
else {
    # A stack can ask for a minimum Node.js itself ("nodeEngine"), e.g. the built-in SQLite driver
    $nodeRanges = @($FrontStack, $BackStack | Where-Object { $_.nodeEngine } | ForEach-Object { [pscustomobject]@{ Package = $_.label; Range = $_.nodeEngine } })
    Test-Tools $needs @($versionEntries | Where-Object { $_.registry -eq 'npm' } | ForEach-Object { $_.package }) $nodeRanges @($BackStack.phpExtensions | Where-Object { $_ })
}

# ===========================================================================
# 3. Versions
# ===========================================================================

Write-Title "[3/8] $(T 'step_versions')"
Send-UiEvent @{ type = 'step'; step = 3; total = 8; title = "$(T 'step_versions')" }

$Resolved = @{}
foreach ($entry in $versionEntries) { $Resolved[$entry.token] = Resolve-Version $entry }
if (-not $versionEntries) { Write-Info (T 'no_dependency') }

# ===========================================================================
# Tokens available in every template file
# ===========================================================================

$api = $FrontStack.api
$urlRows = @()
if ($HasFront) { $urlRows += , @('Front', "http://localhost:$AppPort") }
if ($HasBack) { $urlRows += , @('API', "http://localhost:$ApiPort") }
if ($HasDatabase) { $urlRows += , @('phpMyAdmin', "http://localhost:$PmaPort") }


$Tokens = [ordered]@{
    PROJECT_NAME        = $ProjectName
    PROJECT_NAME_PS     = $ProjectName.Replace("'", "''")
    STACK_LABEL         = $StackLabel
    SLUG                = $Slug
    DB_NAME             = $DbName
    DB_PASS             = $DbPass
    APP_PORT            = $AppPort
    API_PORT            = $ApiPort
    PMA_PORT            = $PmaPort
    DB_HOST_PORT        = $DbPort
    DB_PORTS            = $(if ($NodeBack) { "    ports:`n      - '${DbPort}:3306'`n" } else { '' })
    DB_DRIVER           = $Driver
    API_DEPENDS_ON      = $(if ($HasDatabase) { "    depends_on:`n      db:`n        condition: service_healthy`n" } else { '' })
    DB_SERVER_VERSION   = "$MySqlVersion.0"
    MYSQL_VERSION       = $MySqlVersion
    PHP_VERSION         = $PhpVersion
    PHP_PLATFORM        = "$PhpVersion.99"
    # Languages of the site, written into plugins/translations/translations.js
    LANGUAGES_JS        = '[' + (($SiteLanguages | ForEach-Object { "'$_'" }) -join ', ') + ']'
    DEFAULT_LANG        = $SiteLanguages[0]
    # Project name inside a JavaScript string between single quotes: 'L\'abeille'
    PROJECT_NAME_JS     = $ProjectName.Replace('\', '\\').Replace("'", "\'")
    API_IMPORTS         = $api.imports
    API_BASE            = $api.base
    API_BASE_SOURCE     = $api.source
    API_IS_DEV          = $api.isDev
    API_USAGE           = $api.usage
    URL_LINES           = ($urlRows | ForEach-Object { "        '{0,-11} {1}'" -f $_[0], $_[1] }) -join "`n"
    URL_TABLE           = (@('| Service | URL |', '| ------- | --- |') + ($urlRows | ForEach-Object { "| $($_[0]) | $($_[1]) |" })) -join "`n"
}
foreach ($token in $Resolved.Keys) { $Tokens[$token] = $Resolved[$token].Version }

$Tokens['HTACCESS_ROUTING'] = (Read-StackFile (Join-Path $FrontStack.path 'routing.htaccess')).TrimEnd()

# Keeps the lines of a doc that apply: "[tag] text" stays (without its tag) when the tag is in $Tags
function Select-GuideLines([string]$Text, [string[]]$Tags) {
    $lines = foreach ($line in $Text -split "`n") {
        if ($line -match '^\s*<!--.*-->\s*$') { continue }    # note for stack authors, not for the project
        if ($line -match '^\[([\w|-]+)\] ?(.*)$') {
            if (@($Matches[1] -split '\|' | Where-Object { $_ -in $Tags }).Count) { $Matches[2] }
        } else {
            $line
        }
    }
    return $lines -join "`n"
}

# Paths of the front, from the "layout" of its stack.json
function Get-FrontPath([string]$Path) {
    $parts = New-Object System.Collections.Generic.List[string]
    foreach ($part in "frontend/$($FrontStack.layout.src)$Path" -split '/') {
        if ($part -eq '..') { $parts.RemoveAt($parts.Count - 1) } elseif ($part) { $parts.Add($part) }
    }
    return $parts -join '/'
}

# README.md of the project: one file, in the language chosen at the start of DC Scaffold.
# Built from stacks/shared/docs: readme/<lang>.md around the front guide, the back end guide and the doc.md of each stack.
$guideParts = @()
$Tokens['DESIGN_GITIGNORE'] = ''
if ($HasFront -and $FrontStack.layout) {
    $layout = $FrontStack.layout
    $Tokens['FRONT_LABEL'] = $FrontStack.label
    $Tokens['FRONT_CSS'] = "frontend/$($layout.css)"
    $Tokens['FRONT_PUBLIC'] = $layout.public
    $Tokens['FRONT_TRANSLATIONS'] = Get-FrontPath 'plugins/translations'
    $Tokens['FRONT_STORE'] = Get-FrontPath $layout.storeFile
    $Tokens['FRONT_STORE_LIB'] = $layout.storeLib
    # How to read a choice of the visitor in the code of this front (Angular: a signal)
    $Tokens['FRONT_PREFS_USAGE'] = $(if ($layout.prefsUsage) { $layout.prefsUsage } else { 'userPreferences.preferences.maps' })
    $Tokens['FRONT_ACTIONS'] = Get-FrontPath 'stores/actions/userPreferencesActions.js'
    $Tokens['FRONT_PAGE'] = Get-FrontPath $layout.page
    $Tokens['FRONT_PAGE_COPY'] = Get-FrontPath $layout.pageCopy
    $Tokens['FRONT_VIEWS'] = Get-FrontPath 'components/views'
    $Tokens['FRONT_COMPONENTS'] = Get-FrontPath 'components'
    # Folder of the pages: pages, src/app/pages, src/routes...
    $Tokens['FRONT_PAGES'] = Get-FrontPath (Split-Path $layout.pageCopy -Parent).Replace('\', '/')
    # Design of DC Scaffold (frontend/dc-scaffold.config.js): its folder, and the two files scripts/design.mjs writes
    $srcDir = "$($layout.src)".TrimEnd('/')
    $Tokens['DESIGN_FOLDER'] = (@($srcDir, 'dc-scaffold') | Where-Object { $_ }) -join '/'
    $Tokens['DESIGN_JS'] = (@($srcDir, 'design.js') | Where-Object { $_ }) -join '/'
    $Tokens['DESIGN_CSS'] = "$($layout.css)/design.css"
    $Tokens['DESIGN_CSS_DIR'] = $layout.css
    $Tokens['FRONT_DESIGN_CONFIG'] = 'frontend/dc-scaffold.config.js'
    # Where the sections of the home page are (HTML / CSS / JS: in the page itself)
    $Tokens['FRONT_HOME_SECTIONS'] = $(if ($layout.homeSections) { Get-FrontPath $layout.homeSections } else { "$($Tokens['FRONT_VIEWS'])/Index/" })
    $Tokens['FRONT_DESIGN_FOLDER'] = "frontend/$($Tokens['DESIGN_FOLDER'])"
    $Tokens['FRONT_DESIGN_RESTART'] = $(if ($layout.designRuntime) { $Strings.guide_design_reload } else { $Strings.guide_design_restart })
    $Tokens['DESIGN_INDEX_EXT'] = $(if ($null -ne $layout.designIndexExt) { $layout.designIndexExt } else { '.js' })
    # Astro in two languages: the texts of the design for the script of the browser
    $Tokens['DESIGN_TEXTS_JS'] = $(if ($layout.designClientTexts -and $SiteLanguages.Count -gt 1) { (@($srcDir, 'design-texts.js') | Where-Object { $_ }) -join '/' } else { '' })
    $Tokens['DESIGN_NOTE'] = $Strings.design_generated
    $Tokens['DESIGN_LOG_ON'] = $Strings.design_log_on
    $Tokens['DESIGN_LOG_OFF'] = $Strings.design_log_off
    $Tokens['DESIGN_TEXTS_CODE'] = ''
    if ($Tokens['DESIGN_TEXTS_JS']) {
        $Tokens['DESIGN_TEXTS_CODE'] = "// $($Strings.design_texts_comment)`nfiles['$($Tokens['DESIGN_TEXTS_JS'])'] = design ? ``import '`${path('$($Tokens['DESIGN_TEXTS_JS'])', '$($Tokens['DESIGN_FOLDER'])/texts/index.js')}'\n`` : ''`n"
    }
    # Generated files: not in Git (written again by every "npm run dev" / build). HTML / CSS / JS reads the switch in the browser.
    if (-not $layout.designRuntime) {
        $Tokens['DESIGN_GITIGNORE'] = "`n# Written by frontend/scripts/design.mjs from frontend/dc-scaffold.config.js`nfrontend/$($Tokens['DESIGN_JS'])`nfrontend/$($Tokens['DESIGN_CSS'])"
        if ($Tokens['DESIGN_TEXTS_JS']) { $Tokens['DESIGN_GITIGNORE'] += "`nfrontend/$($Tokens['DESIGN_TEXTS_JS'])" }
    }
    # Reusable top of page (components/ui/PageHero), or the page that shows it when the front has no components
    $Tokens['FRONT_PAGE_HERO'] = Get-FrontPath $(if ($layout.pageHero) { $layout.pageHero } else { 'components/ui/PageHero/' })
    $Tokens['FRONT_SEO'] = Get-FrontPath 'utils/seo.js'
    $Tokens['FRONT_MIDDLEWARE'] = Get-FrontPath 'middleware/'
    $Tokens['FRONT_LAYOUT'] = Get-FrontPath $layout.layoutFile
    $Tokens['FRONT_HEADER'] = Get-FrontPath $layout.header
    $Tokens['FRONT_FOOTER'] = Get-FrontPath $layout.footer
    $Tokens['FRONT_TEXT_USAGE'] = $layout.textUsage
    $Tokens['FRONT_SITE_CONFIG'] = $(if ($layout.siteFile) { $Strings.guide_site_file -f (Get-FrontPath $layout.siteFile) } else { $Strings.guide_env -f $layout.env })
    # doc.md of the front: [fr] / [en] lines, [fr-api] / [en-api] only with a back end
    $docTags = @($Lang) + $(if ($HasBack) { "$Lang-api" } else { @() }) + "$Lang-$(if ($SiteLanguages.Count -gt 1) { 'two-languages' } else { 'one-language' })"
    $Tokens['FRONT_DOC'] = (Select-GuideLines (Read-StackFile (Join-Path $FrontStack.path 'doc.md')) $docTags).Trim()
    $text = [System.IO.File]::ReadAllText((Join-Path $StacksDir "shared\docs\guide\$Lang-front.md"))
    # Lines that do not apply to this front ("omitGuide": text they contain)
    foreach ($omit in @($layout.omitGuide)) { if ($omit) { $text = ($text -split "`n" | Where-Object { -not $_.Contains($omit) }) -join "`n" } }
    # [one-language] / [two-languages] lines: only the ones of this site
    $text = Select-GuideLines $text @($(if ($SiteLanguages.Count -gt 1) { 'two-languages' } else { 'one-language' }))
    $guideParts += Expand-Tokens $text
}
if ($HasBack -and $BackStack.guide) {
    $Tokens['BACK_CONTROLLERS'] = $BackStack.controllers
    $Tokens['BACK_EXT'] = $BackStack.controllerExt
    # Example controller file of the README (AdonisJS names its files products_controller.ts)
    $Tokens['BACK_CONTROLLER_FILE'] = $(if ($BackStack.controllerFile) { $BackStack.controllerFile } else { "ProductsController.$($BackStack.controllerExt)" })
    foreach ($field in 'helpers', 'middleware', 'entry', 'envDev', 'envProd', 'custom', 'success', 'body', 'missing', 'db') {
        $Tokens["BACK_$(($field -creplace '([A-Z])', '_$1').ToUpper())"] = $BackStack.guide.$field
    }
    $Tokens['BACK_CUSTOM_ROUTE'] = $BackStack.guide.custom
    # doc.md of the back end: folder tree and full controller example
    $Tokens['BACK_DOC'] = (Select-GuideLines (Read-StackFile (Join-Path $BackStack.path 'doc.md')) @($Lang)).Trim()
    # Lines starting with [tag] are kept only for this project: back end id, docker / node, mysql / sqlite, mysqli / pdo, front
    $tags = @($Back, $(if ($BackStack.runtime -eq 'php') { 'docker' } else { 'node' }), $(if ($HasDatabase) { 'mysql' } else { 'sqlite' }))
    if ($HasDatabase -and $drivers.Count -gt 1) { $tags += $Driver }
    if ($HasFront) { $tags += 'front' }
    $guideParts += Expand-Tokens (Select-GuideLines ([System.IO.File]::ReadAllText((Join-Path $StacksDir "shared\docs\guide\$Lang-back.md"))) $tags)
}
$Tokens['GUIDE'] = ($guideParts | ForEach-Object { $_.Trim() }) -join "`n`n"
$readmeTags = @($(if (-not $HasFront) { 'nofront' }), $(if (-not $HasBack) { 'noback' })) | Where-Object { $_ }
$readme = Select-GuideLines ([System.IO.File]::ReadAllText((Join-Path $StacksDir "shared\docs\readme\$Lang.md"))) $readmeTags
# One empty line at most between blocks (lines removed by tags)
$Readme = ((Expand-Tokens $readme) -replace "`r`n", "`n" -replace "\n{3,}", "`n`n").Trim() + "`n"

# ===========================================================================
# 4. Shared files
# ===========================================================================

# One language: the texts of that language, written into the components (Convert-InlineTexts)
$InlineTexts = if ($HasFront -and $SiteLanguages.Count -eq 1) { Get-InlineTexts } else { $null }

Write-Title "[4/8] $(T 'step_shared')"
Send-UiEvent @{ type = 'step'; step = 4; total = 8; title = "$(T 'step_shared')" }
New-Item -ItemType Directory -Path $Root -Force | Out-Null
Copy-Template (Join-Path $StacksDir 'common')
Write-ProjectFile 'README.md' $Readme
# VS Code suggests these extensions when the project is opened
Write-ProjectFile '.vscode\extensions.json' (@{ recommendations = @(Get-EditorExtensions) } | ConvertTo-Json)

$services = @()
if ($BackStack.runtime -eq 'php') { $services += Read-StackFile (Join-Path $StacksDir 'infra\docker\api-php.yml') }
if ($HasDatabase) { $services += Read-StackFile (Join-Path $StacksDir 'infra\docker\db.yml') }
if ($FrontStack.docker) { $services += Read-StackFile (Join-Path $StacksDir 'infra\docker\app-static.yml') }
if ($services) {
    Write-ProjectFile 'docker-compose.yml' ("name: {{SLUG}}`n`nservices:`n" + ($services -join "`n") + "`nnetworks:`n  {{SLUG}}-network:`n    driver: bridge`n")
}
if ($HasDatabase) { Copy-Template (Join-Path $StacksDir 'infra\mysql') 'mysql' }
if ($FrontStack.docker) { Copy-Template (Join-Path $StacksDir 'infra\nginx') 'nginx' }

# ===========================================================================
# 5. API
# ===========================================================================

$env:npm_config_yes = 'true'

# Stops after a failed step and deletes the half-created project, so the next run starts clean
function Stop-Creation([string]$Message) {
    Write-Fail $Message
    if ($RemoveOnFailure -and (Test-Path $Root)) {
        Set-Location -LiteralPath $Destination
        Remove-Item -LiteralPath $Root -Recurse -Force -ErrorAction SilentlyContinue
        # node_modules can exceed the Windows path limit of Remove-Item in PowerShell 5.1
        if ((Test-Path $Root) -and $env:OS -eq 'Windows_NT') { cmd /c rd /s /q "`"$Root`"" 2>$null }
        if (Test-Path $Root) { Write-Warn (T 'cleanup_failed' $Root) } else { Write-Info (T 'cleanup_done' $Root) }
    }
    exit 1
}

Write-Title "[5/8] API ($($BackStack.label))"
Send-UiEvent @{ type = 'step'; step = 5; total = 8; title = "API ($($BackStack.label))" }
if ($HasBack) {
    if (-not (Invoke-StackSteps $BackStack 'backend')) { Stop-Creation (T 'api_failed') }
    Set-PinnedVersions $BackStack 'backend'
    # One README for the whole project, at the root: the one of the framework goes away
    Remove-Item -LiteralPath (Join-Path $Root 'backend\README.md') -Force -ErrorAction SilentlyContinue
} else {
    Write-Info (T 'nothing_to_create')
}

# ===========================================================================
# 6. Front
# ===========================================================================

Write-Title "[6/8] Front ($($FrontStack.label))"
Send-UiEvent @{ type = 'step'; step = 6; total = 8; title = "Front ($($FrontStack.label))" }
if ($HasFront) {
    if (-not (Invoke-StackSteps $FrontStack 'frontend')) { Stop-Creation (T 'front_failed') }
    else {
        Set-PinnedVersions $FrontStack 'frontend'
        Remove-Item -LiteralPath (Join-Path $Root 'frontend\README.md') -Force -ErrorAction SilentlyContinue
        # One language: no language buttons and no translation system (the texts are in the components)
        if ($SiteLanguages.Count -eq 1) {
            Get-ChildItem -LiteralPath (Join-Path $Root 'frontend') -Recurse -File -Include 'ChangeLanguageButton.*', 'changeLanguageButton.js', 'useLang.*' -ErrorAction SilentlyContinue |
                Where-Object { $_.FullName -notmatch 'node_modules' } | Remove-Item -Force
            Get-ChildItem -LiteralPath (Join-Path $Root 'frontend') -Recurse -Directory -Filter 'plugins' -ErrorAction SilentlyContinue |
                Where-Object { $_.FullName -notmatch 'node_modules' } | ForEach-Object {
                    Remove-Item -LiteralPath (Join-Path $_.FullName 'translations') -Recurse -Force -ErrorAction SilentlyContinue
                    Get-ChildItem -LiteralPath $_.FullName -File -Filter 'lang.*' | Remove-Item -Force
                    if (-not (Get-ChildItem -LiteralPath $_.FullName -Force)) { Remove-Item -LiteralPath $_.FullName -Force }
                }
            Remove-Item -LiteralPath (Join-Path $Root "frontend/$($Tokens['DESIGN_FOLDER'])/texts") -Recurse -Force -ErrorAction SilentlyContinue
        }
        if ($FrontStack.layout -and -not $FrontStack.layout.designRuntime) { Write-DesignFiles }
        if ($HasBack -and $api.file) { Write-ProjectFile "frontend/$($api.file)" (Read-StackFile (Join-Path $StacksDir 'shared\client\api.js')) }
        if ($null -ne $FrontStack.publicDir) {
            $publicDir = (@('frontend', $FrontStack.publicDir) | Where-Object { $_ }) -join '/'
            Write-ProjectFile "$publicDir/.htaccess" (Read-StackFile (Join-Path $StacksDir 'shared\client\.htaccess'))
            # DC Scaffold logo of the welcome page (public/dc-scaffold/, delete it with the welcome sections)
            if ($FrontStack.layout) { Copy-Binary (Join-Path $StacksDir 'shared\front-public') $publicDir }
        }
    }
} else {
    Write-Info (T 'nothing_to_create')
}

Remove-Item Env:\npm_config_yes -ErrorAction SilentlyContinue

# ===========================================================================
# 7. Dependencies (same code as "start.bat > I")
# ===========================================================================

Write-Title "[7/8] $(T 'step_dependencies')"
Send-UiEvent @{ type = 'step'; step = 7; total = 8; title = "$(T 'step_dependencies')" }
if ($SkipInstall) { Write-Info (T 'install_later') }
else {
    & (Join-Path $Root 'start.ps1') -Action I
    if ($LASTEXITCODE -ne 0) { Stop-Creation (T 'install_failed_project') }
}

# ===========================================================================
# 8. Git
# ===========================================================================

Write-Title "[8/8] Git"
Send-UiEvent @{ type = 'step'; step = 8; total = 8; title = "Git" }
if ($NoGit) {
    Write-Info (T 'skipped')
} elseif (-not (Test-Command 'git')) {
    Write-Warn (T 'git_missing')
} else {
    Push-Location $Root
    git init -q
    git add -A
    # Message written to a file so the emoji survives Windows PowerShell 5.1
    $messageFile = [System.IO.Path]::GetTempFileName()
    [System.IO.File]::WriteAllText($messageFile, "🎉 init: scaffold $StackLabel project`n", $Utf8NoBom)
    git commit -q -F $messageFile
    $committed = $LASTEXITCODE -eq 0
    Remove-Item $messageFile
    Pop-Location
    if ($committed) { Write-Ok (T 'git_done') } else { Write-Warn (T 'git_no_commit') }
}

# ===========================================================================
# Summary
# ===========================================================================

Send-UiEvent @{
    type = 'done'; root = $Root; name = $ProjectName; stack = $StackLabel
    urls = @($urlRows | ForEach-Object { @{ label = $_[0]; url = $_[1] } })
    database = $(if ($HasDatabase) { @{ name = $DbName; user = 'root'; password = $DbPass } } else { $null })
    code = "$(Find-VSCode)"
}

$summary = @("$(T 'ready')  ·  $ProjectName", $StackLabel, '') + ($urlRows | ForEach-Object { '{0,-12} {1}' -f $_[0], $_[1] })
if ($HasDatabase) { $summary += '{0,-12} root / {1}' -f '', $DbPass }
$summary += @('', (T 'next_step'), "$AppName · $AppAuthor")

if (-not $Ui) {
    Write-Host ''
    Write-Box -Color Green $summary
    Write-Host ''
}
