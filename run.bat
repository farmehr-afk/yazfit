@echo off
cd /d "%~dp0"
echo Starting FitPulse on http://localhost:8123 ...
start "" http://localhost:8123
python -m http.server 8123 2>nul || py -m http.server 8123 2>nul || npx --yes http-server -p 8123 -c-1
