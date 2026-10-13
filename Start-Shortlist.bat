@echo off
title Shortlist Development Server
cd /d "%~dp0"
echo Starting Shortlist...
echo.
start "" http://localhost:3000
call npm.cmd run dev
