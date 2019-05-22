@echo off
set n=ur mom bot
title %n%: init
cls
for /f "tokens=1 delims=" %%a in ('tasklist^|find /i /c "cmd.exe"') do (
	set cmdrunning=%%a
)
if %cmdrunning% gtr 20 (
	echo timer: too many cmd processes, stopping as a safety measure for a rogue error loop!
	pause
	exit /b
)
cd %~dp0
if not "%~d0" equ "%CD:~0,2%" (%~d0)
set :=call :anchor 
set !=^&^&goto :error 
setlocal EnableDelayedExpansion
set /a rnd="(!random! * 600 / 32767)" || %:%__xfdi%!%
for /f "tokens=1-3 delims=/:" %%a in ('echo %time%') do (set hr=%%a &&set min=%%b &&set sec=%%c) || %:%__ulnu%!%
if "%1" equ "-f" (goto run ) || %:%__enht%!%
call :parselastrun
if %min% lss 10 if not "!lastrun!" equ "!hr!" (goto run) || %:%__hpsr%!%
:loop
title %n%: loop
for /f "tokens=1-3 delims=/:" %%a in ('echo %time%') do (set hr=%%a &&set min=%%b &&set sec=%%c) || %:%__rydm%!%
call :timer !hr! !min! !sec!
echo timeout: zzz !tHr!:!tMin:~-2!:!tSecs:~-2! !tAmpm!  || %:%__vbln%!%
title %n%: zzz
timeout /t !rSecs! /nobreak >nul || %:%__sdbl%!%
if "!lastrun!" equ "!hr!" (echo timer: already run this hour... && echo. && goto loop) || %:%__uxvc%!%
:run
title %n%: ding, time to run
node js.js
set payloadran=true
for /f "tokens=1-3 delims=/:" %%a in ('echo %time%') do (set hr=%%a &&set min=%%b &&set sec=%%c) || %:%__vxcv%!%
set hr=%hr: =%
title %n%: write .lastrun
echo !hr!>.lastrun || %:%__zxet%!%
echo.
goto loop
%:%__rgbf%!%

:error
title (!) %n%: oof (line: !line!, anchor: !anchor!)
echo timer: batch error detected (line: !line!, anchor: !anchor!)
echo timer: restarting in 10 seconds with new instance...
timeout /t 10 /nobreak >nul
start %~nx0
if "%payloadran%" equ "true" (
	echo timer: debug: pause ^(payloadran equ true^)
	pause >nul
)
exit /b 1

:anchor <ID>
setlocal
for /F " usebackq tokens=1 delims=:" %%L IN (`findstr /N "%~1" "%~f0"`) DO set /a lineNr=%%L
( 
	endlocal
	set "line=%LineNr%"
	set "anchor=%~1"
	exit /b
)

:timer <hr> <min> <sec>
title %n%: cranking timer
setlocal EnableDelayedExpansion
set tHr=%~1
set /a rnd="(!random! * 600 / 32767)"
set /a rSecs="((60 - %~2) * 60 ) - !%~3:~0,2!" || %:%__erhn%!%
set /a rSecs+=rnd
set /a tMin="rSecs / 60"
set /a tSecs="rSecs - tMin * 60"
set /a tMin+=%~2 || %:%__vxcb%!%
set /a tSecs+=!%~3:~0,2! || %:%__xcub%!%
if !tSecs! geq 60 (
set /a tSecs-=60
set /a tMin+=1
)
if !tMin! geq 60 (
	set /a tMin-=60
	set /a tHr+=1
)
if !tHr! gtr 12 (
	set tHr=%tHr: =%
	set /a tHr-=12
	set ampm=pm
) else (
	set ampm=am
)
set tMin=0!tMin!
set tSecs=0!tSecs!
(
	endlocal
	set rSecs=%rSecs%
	set tHr=%tHr%
	set tMin=%tMin%
	set tSecs=%tSecs%
	set tAmpm=%ampm%
)
endlocal
exit /b

:parselastrun
title %n%: parse .lastrun
if exist .lastrun (
	set /p lastrun=<.lastrun || %:%__wegb%!%
	exit /b
) else exit /b 1

