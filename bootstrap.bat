@echo off
title ur mom bot
if "%1"=="-f" (
	node "%~dp0main.js" -f
) else (
	node "%~dp0main.js"
)
pause