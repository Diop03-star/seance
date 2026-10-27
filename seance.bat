@echo off
cd /d "%~dp0"
start "" http://localhost:3666
node server.js
