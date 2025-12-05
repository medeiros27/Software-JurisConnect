; -------------------------------------------------
; JurisConnect – NSIS Installer
; -------------------------------------------------
!include "MUI2.nsh"

Name "JurisConnect"
OutFile "JurisConnect-Setup.exe"
InstallDir "$PROGRAMFILES\JurisConnect"
RequestExecutionLevel user   ; permite instalação sem admin (instala em %LOCALAPPDATA%)
SetCompress auto

!define MUI_ICON "assets\\icon.ico"
!define MUI_UNICON "assets\\icon.ico"

; ---------- Pages ----------
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "PortugueseBR"

; ---------- Sections ----------
Section "Core Files"
  SetOutPath "$INSTDIR"
  ; copiar tudo que o electron‑builder gerou (dist\*.*)
  File /r "dist\\*.*"
  ; copiar PostgreSQL portable
  File /r "postgres\\*.*"
SectionEnd

Section "Start Menu Shortcut"
  CreateDirectory "$SMPROGRAMS\JurisConnect"
  CreateShortCut "$SMPROGRAMS\JurisConnect\JurisConnect.lnk" "$INSTDIR\JurisConnect.exe"
SectionEnd

Section "Desktop Shortcut"
  CreateShortCut "$DESKTOP\JurisConnect.lnk" "$INSTDIR\JurisConnect.exe"
SectionEnd

; ---------- Uninstall ----------
Section "Uninstall"
  Delete "$INSTDIR\*.*"
  RMDir /r "$INSTDIR"
  Delete "$SMPROGRAMS\JurisConnect\JurisConnect.lnk"
  RMDir "$SMPROGRAMS\JurisConnect"
  Delete "$DESKTOP\JurisConnect.lnk"
SectionEnd
