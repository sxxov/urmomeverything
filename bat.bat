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
if "%1" equ "-nolog" (
	set e=^>nul 2^>^&1
	set e1=^>nul
	set e2=2^>nul
) else if "%2" equ "-nolog" (
	set e=^>nul 2^>^&1
	set e1=^>nul
	set e2=2^>nul
) else (
	set e=^>^>.log 2^>^&1
	set e1=^>^>.log
	set e2=2^>^>.log
)
echo. %e1% || (
	echo timer: another instance of %n% is open, please close that or disable logging with -nolog
	pause
	exit /b
)
echo -------------------- %date% %time% -------------------- %e1%
setlocal EnableDelayedExpansion
set /a rnd="(!random! * 600 / 32767)" %e% || %:%__xfdi%!%
for /f "tokens=1-3 delims=/:" %%a in ('echo %time%') do (set hr=%%a &&set min=%%b &&set sec=%%c) %e% || %:%__ulnu%!%
call :timeerrorparse %hr% %min% %sec%
if "%1" equ "-f" (
	goto run 
) else if "%2" equ "-f" (
	goto run
) %e% || %:%__enht%!%
call :parselastrun
if %min% lss 10 if not "!lastrun!" equ "!hr!" (goto run) %e% || %:%__hpsr%!%
:loop
title %n%: loop
for /f "tokens=1-3 delims=/:" %%a in ('echo %time%') do (set hr=%%a &&set min=%%b &&set sec=%%c) %e% || %:%__rydm%!%
call :timer !hr! !min! !sec!
echo timeout: zzz !tHr!:!tMin:~-2!:!tSec:~-2! !tAmpm!
echo timeout: zzz !tHr!:!tMin:~-2!:!tSec:~-2! !tAmpm! %e%
title %n%: zzz
timeout /t !rSec! /nobreak %e2% >nul || %:%__sdbl%!%
if "!lastrun!" equ "!hr!" (echo timer: already run this hour... && echo. && goto loop) %e% || %:%__uxvc%!%
:run
title %n%: ding, time to run
echo %n%: ding, time to run %e1%
node js.js
for /f "tokens=1-3 delims=/:" %%a in ('echo %time%') do (set hr=%%a &&set min=%%b &&set sec=%%c) %e% || %:%__vxcv%!%
set hr=%hr: =%
title %n%: write .lastrun
echo !hr!>.lastrun %e% || %:%__zxet%!%
echo.
goto loop
%:%__rgbf%!%

:error
title (!) %n%: oof (line: !line!, anchor: !anchor!)
echo timer: batch error detected (line: !line!, anchor: !anchor!)
echo timer: %date% %time%: batch error detected (line: !line!, anchor: !anchor!) %e1%
echo timer: restarting in 10 seconds with new instance...
timeout /t 10 /nobreak >nul
start %~nx0
exit 1

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
set /a rSec="((60 - %~2) * 60 ) - !%~3:~0,2!" %e% || %:%__erhn%!%
set /a rSec+=rnd
set /a tMin="rSec / 60"
set /a tSec="rSec - tMin * 60"
set /a tMin+=%~2 %e% || %:%__vxcb%!%
set /a tSec+=!%~3:~0,2! %e% || %:%__xcub%!%
if !tSec! geq 60 (
set /a tSec-=60
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
set tSec=0!tSec!
(
	endlocal
	set rSec=%rSec%
	set tHr=%tHr%
	set tMin=%tMin%
	set tSec=%tSec%
	set tAmpm=%ampm%
)
endlocal
exit /b

:parselastrun
title %n%: parse .lastrun
if exist .lastrun (
	set /p lastrun=<.lastrun %e% || %:%__wegb%!%
	exit /b
) else exit /b 1

:timeerrorparse <hr> <min> <sec>
setlocal EnableDelayedExpansion
set eHr=%~1
set eMin=%~2
set eSec=%~3
set eSec=!eSec:~0,2!
set /a eHr=10000%eHr% %% 10000
set /a eMin=10000%eMin% %% 10000
set /a eSec=10000%eSec% %% 10000
if not %eHr% gtr -1 %:%__zxbr%!%
if not %eMin% gtr -1 %:%__xcbr%!%
if not %eSec% gtr -1 %:%__bnio%!%
if %eHr% gtr 24 %:%__ijhp%!%
if %eMin% gtr 60 %:%__ovbi%!%
if %eSec% gtr 60 %:%__bvjp%!%
if not %eHr% equ 0 (set /a rVal=eHr+1)
if %rVal% equ 1 %:%__xcnr%!%
if not %eMin% equ 0 (set /a rVal=eMin+1)
if %rVal% equ 1 %:%__zsbo%!%
if not %eSec% equ 0 (set /a rVal=eSec+1)
if %rVal% equ 1 %:%__xohc%!%
endlocal
exit /b