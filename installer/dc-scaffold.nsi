; DC Scaffold installer - by Djason CHERY
; Built by installer/build.sh or installer/build.ps1 (NSIS 3: https://nsis.sourceforge.io)
; Installs for the current user, without administrator rights, in %LOCALAPPDATA%\Programs\DC Scaffold.
; Running a newer DCScaffold-Setup.exe over an installed version updates it.

; 64-bit installer (DC Scaffold needs a 64-bit Windows 10 or 11 anyway)
Target amd64-unicode
!include "MUI2.nsh"
!include "FileFunc.nsh"

!ifndef VERSION
    !define VERSION "0.0.0"
!endif
!define APP "DC Scaffold"
!define PUBLISHER "Djason CHERY"
!define UNINSTALL_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\DCScaffold"

Name "${APP}"
OutFile "..\DCScaffold-Setup.exe"
InstallDir "$LOCALAPPDATA\Programs\${APP}"
InstallDirRegKey HKCU "${UNINSTALL_KEY}" "InstallLocation"
RequestExecutionLevel user
SetCompressor /SOLID lzma
BrandingText "${APP} ${VERSION}  ·  ${PUBLISHER}"

; File properties (right click > Properties > Details)
VIProductVersion "${VERSION}.0"
VIAddVersionKey /LANG=0 "ProductName" "${APP}"
VIAddVersionKey /LANG=0 "CompanyName" "${PUBLISHER}"
VIAddVersionKey /LANG=0 "LegalCopyright" "Copyright (C) 2026 ${PUBLISHER}"
VIAddVersionKey /LANG=0 "FileDescription" "${APP} Setup"
VIAddVersionKey /LANG=0 "FileVersion" "${VERSION}"
VIAddVersionKey /LANG=0 "ProductVersion" "${VERSION}"

; ---------------------------------------------------------------------------
; Look: DC icon, side image on the welcome and finish pages, logo at the top of the others
; ---------------------------------------------------------------------------

!define MUI_ICON "..\assets\icon.ico"
!define MUI_UNICON "..\assets\icon.ico"
!define MUI_WELCOMEFINISHPAGE_BITMAP "welcome.bmp"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP "welcome.bmp"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_RIGHT
!define MUI_HEADERIMAGE_BITMAP "header.bmp"
!define MUI_HEADERIMAGE_UNBITMAP "header.bmp"
!define MUI_ABORTWARNING
!define MUI_UNABORTWARNING
!define MUI_COMPONENTSPAGE_NODESC

; Last page: start DC Scaffold right away
!define MUI_FINISHPAGE_RUN "$INSTDIR\DCScaffold.exe"
!define MUI_FINISHPAGE_RUN_PARAMETERS "--no-update"

!define MUI_WELCOMEPAGE_TITLE "$(WelcomeTitle)"
!define MUI_WELCOMEPAGE_TEXT "$(WelcomeText)"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "build\LICENSE.txt"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_TITLE "$(FinishTitle)"
!define MUI_FINISHPAGE_TEXT "$(FinishText)"
!insertmacro MUI_PAGE_FINISH

!define MUI_WELCOMEPAGE_TITLE "$(UnWelcomeTitle)"
!define MUI_WELCOMEPAGE_TEXT "$(UnWelcomeText)"
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_COMPONENTS
!insertmacro MUI_UNPAGE_INSTFILES
!define MUI_FINISHPAGE_TITLE "$(UnFinishTitle)"
!define MUI_FINISHPAGE_TEXT "$(UnFinishText)"
!insertmacro MUI_UNPAGE_FINISH

; The language of Windows is used when it is one of these
!insertmacro MUI_LANGUAGE "French"
!insertmacro MUI_LANGUAGE "English"

LangString WelcomeTitle ${LANG_FRENCH} "Bienvenue dans DC Scaffold ${VERSION}"
LangString WelcomeTitle ${LANG_ENGLISH} "Welcome to DC Scaffold ${VERSION}"
LangString WelcomeText ${LANG_FRENCH} "DC Scaffold crée un projet web complet en quelques minutes : le site (front), le serveur (back end) et la base de données, prêts à coder. Aucune connaissance technique n'est nécessaire pour démarrer.$\r$\n$\r$\nIl s'installe pour ton compte Windows, sans droits administrateur. Si DC Scaffold est déjà installé, il est mis à jour.$\r$\n$\r$\nClique sur Suivant pour continuer."
LangString WelcomeText ${LANG_ENGLISH} "DC Scaffold creates a complete web project in minutes: the site (front), the server (back end) and the database, ready to code. No technical knowledge is needed to start.$\r$\n$\r$\nIt installs for your Windows account, without administrator rights. If DC Scaffold is already installed, it is updated.$\r$\n$\r$\nClick Next to continue."
LangString FinishTitle ${LANG_FRENCH} "DC Scaffold est prêt"
LangString FinishTitle ${LANG_ENGLISH} "DC Scaffold is ready"
LangString FinishText ${LANG_FRENCH} "DC Scaffold ${VERSION} est installé.$\r$\n$\r$\nTu le retrouves dans le menu Démarrer, sur le bureau, et avec la commande dcscaffold dans un terminal."
LangString FinishText ${LANG_ENGLISH} "DC Scaffold ${VERSION} is installed.$\r$\n$\r$\nYou will find it in the Start menu, on the desktop, and as the dcscaffold command in a terminal."
LangString UnWelcomeTitle ${LANG_FRENCH} "Désinstaller DC Scaffold"
LangString UnWelcomeTitle ${LANG_ENGLISH} "Uninstall DC Scaffold"
LangString UnWelcomeText ${LANG_FRENCH} "Le programme, ses raccourcis et la commande dcscaffold vont être supprimés. Tes projets ne sont pas touchés.$\r$\n$\r$\nÀ l'étape suivante, tu peux aussi supprimer tes réglages (langue, dernier dossier) et tes stacks personnels.$\r$\n$\r$\nClique sur Suivant pour continuer."
LangString UnWelcomeText ${LANG_ENGLISH} "The program, its shortcuts and the dcscaffold command will be removed. Your projects are not touched.$\r$\n$\r$\nIn the next step, you can also delete your settings (language, last folder) and custom stacks.$\r$\n$\r$\nClick Next to continue."
LangString UnFinishTitle ${LANG_FRENCH} "DC Scaffold est désinstallé"
LangString UnFinishTitle ${LANG_ENGLISH} "DC Scaffold is uninstalled"
LangString UnFinishText ${LANG_FRENCH} "Tout ce que DC Scaffold avait ajouté a été supprimé. Merci de l'avoir utilisé !"
LangString UnFinishText ${LANG_ENGLISH} "Everything DC Scaffold had added was removed. Thank you for using it!"
LangString SectionApp ${LANG_FRENCH} "DC Scaffold (obligatoire)"
LangString SectionApp ${LANG_ENGLISH} "DC Scaffold (required)"
LangString SectionDesktop ${LANG_FRENCH} "Raccourci sur le bureau"
LangString SectionDesktop ${LANG_ENGLISH} "Desktop shortcut"
LangString UninstallLink ${LANG_FRENCH} "Désinstaller DC Scaffold"
LangString UninstallLink ${LANG_ENGLISH} "Uninstall DC Scaffold"
LangString SectionUnApp ${LANG_FRENCH} "DC Scaffold et ses raccourcis"
LangString SectionUnApp ${LANG_ENGLISH} "DC Scaffold and its shortcuts"
LangString SectionUnSettings ${LANG_FRENCH} "Mes réglages et mes stacks personnels"
LangString SectionUnSettings ${LANG_ENGLISH} "My settings and custom stacks"

; ---------------------------------------------------------------------------
; Install
; ---------------------------------------------------------------------------

Section "!$(SectionApp)" SectionApp
    SectionIn RO

    ; DC Scaffold still open (update): closed first, so its exe can be replaced
    nsExec::Exec 'taskkill /F /IM DCScaffold.exe'
    ; Update: the old templates are removed first, so deleted files do not stay behind
    RMDir /r "$INSTDIR\engine"
    RMDir /r "$INSTDIR\stacks"
    RMDir /r "$INSTDIR\assets"

    SetOutPath "$INSTDIR"
    File "build\DCScaffold.exe"
    File "..\VERSION"
    File "..\LICENSE"
    File /r "..\engine"
    File /r "..\stacks"
    File /r /x readme "..\assets"

    ; "dcscaffold" in a terminal: the console version of the engine, with its questions
    FileOpen $0 "$INSTDIR\dcscaffold.cmd" w
    FileWrite $0 '@echo off$\r$\n'
    FileWrite $0 'chcp 65001 >nul$\r$\n'
    FileWrite $0 'where pwsh >nul 2>nul$\r$\n'
    FileWrite $0 'if %errorlevel%==0 (pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0engine\dc-scaffold.ps1" %*) else (powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0engine\dc-scaffold.ps1" %*)$\r$\n'
    FileClose $0
    nsExec::Exec `powershell -NoProfile -Command "$$p = [Environment]::GetEnvironmentVariable('Path', 'User'); if (($$p -split ';') -notcontains '$INSTDIR') { [Environment]::SetEnvironmentVariable('Path', (($$p.TrimEnd(';'), '$INSTDIR') -join ';').TrimStart(';'), 'User') }"`

    ; Start menu: DC Scaffold and its uninstaller
    CreateDirectory "$SMPROGRAMS\${APP}"
    CreateShortCut "$SMPROGRAMS\${APP}\${APP}.lnk" "$INSTDIR\DCScaffold.exe" "" "$INSTDIR\assets\icon.ico"
    CreateShortCut "$SMPROGRAMS\${APP}\$(UninstallLink).lnk" "$INSTDIR\Uninstall.exe"

    ; Windows "Apps" list
    WriteUninstaller "$INSTDIR\Uninstall.exe"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayName" "${APP}"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayVersion" "${VERSION}"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "Publisher" "${PUBLISHER}"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayIcon" "$INSTDIR\assets\icon.ico"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "InstallLocation" "$INSTDIR"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "Language" "$LANGUAGE"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "UninstallString" '"$INSTDIR\Uninstall.exe"'
    WriteRegStr HKCU "${UNINSTALL_KEY}" "QuietUninstallString" '"$INSTDIR\Uninstall.exe" /S'
    WriteRegDWORD HKCU "${UNINSTALL_KEY}" "NoModify" 1
    WriteRegDWORD HKCU "${UNINSTALL_KEY}" "NoRepair" 1
    ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
    WriteRegDWORD HKCU "${UNINSTALL_KEY}" "EstimatedSize" $0
SectionEnd

Section "$(SectionDesktop)" SectionDesktop
    CreateShortCut "$DESKTOP\${APP}.lnk" "$INSTDIR\DCScaffold.exe" "" "$INSTDIR\assets\icon.ico"
SectionEnd

; The uninstaller speaks the language chosen during the installation
Function un.onInit
    ReadRegStr $0 HKCU "${UNINSTALL_KEY}" "Language"
    StrCmp $0 "" +2
        StrCpy $LANGUAGE $0
FunctionEnd

; ---------------------------------------------------------------------------
; Uninstall: everything DC Scaffold added; the settings only when ticked
; ---------------------------------------------------------------------------

Section "!un.$(SectionUnApp)" SectionUnApp
    SectionIn RO
    ; A DC Scaffold window still open would keep its exe locked
    nsExec::Exec 'taskkill /F /IM DCScaffold.exe'
    Delete "$DESKTOP\${APP}.lnk"
    RMDir /r "$SMPROGRAMS\${APP}"
    nsExec::Exec `powershell -NoProfile -Command "$$p = ([Environment]::GetEnvironmentVariable('Path', 'User') -split ';' | Where-Object { $$_ -and $$_ -ne '$INSTDIR' }) -join ';'; [Environment]::SetEnvironmentVariable('Path', $$p, 'User')"`
    DeleteRegKey HKCU "${UNINSTALL_KEY}"
    RMDir /r "$INSTDIR"
    ; Profile of the DC Scaffold window (Edge in application mode) and downloaded stacks (catalog)
    RMDir /r "$LOCALAPPDATA\${APP}"
SectionEnd

Section /o "un.$(SectionUnSettings)" SectionUnSettings
    ; %APPDATA%\DC Scaffold: language, last folder, custom stacks
    RMDir /r "$APPDATA\${APP}"
SectionEnd
