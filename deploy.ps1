# Delegate to the master hub deployment script
Push-Location "$PSScriptRoot\..\hub"
try {
    powershell.exe -File .\deploy_mermaid.ps1
} finally {
    Pop-Location
}