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
if "%1" equ "-debug" (
	goto :debug
) else if "%2" equ "-debug" (
	goto :debug
) else if "%3" equ "-debug" (
	goto :debug
)
if "%1" equ "-nolog" (
	set e=^>nul 2^>^&1
	set e1=^>nul
	set e2=2^>nul
) else if "%2" equ "-nolog" (
	set e=^>nul 2^>^&1
	set e1=^>nul
	set e2=2^>nul
) else if "%3" equ "-nolog" (
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
call :settime 
call :timeerrorparse %hr% %min% %sec%
if "%1" equ "-f" (
	goto :run 
) else if "%2" equ "-f" (
	goto :run
)
call :parselastrun
if %min% lss 10 if not "%lastrun%" equ "%hr:~0,2%" (goto run) %e% || %:%__hpsr%!%
:loop
rem , the part that loops the timer and :run
rem , sets: ()
title %n%: loop
call :settime
call :timer !hr! !min! !sec!
echo timeout: zzz !nexthr!:!nextmin!:!nextsec! !ampm!
echo timeout: zzz !nexthr!:!nextmin!:!nextsec! !ampm! %e%
title %n%: zzz
timeout /t !remainingsec! /nobreak %e2% >nul || %:%__sdbl%!%
call :parselastrun
if "!lastrun!" equ "!hr!" (
	echo timer: already run this hour... 
	echo timer: already run this hour... %e1%
	echo. 
	echo. %e1%
	goto loop
) || %:%__uxvc%!%
:run
rem , the part that runs js.js
rem , merges .nodelog into .log when finished running
rem , checks for error code (see more at :nodelog about this)
rem , sets: ()
title %n%: ding, time to run
echo timer: ding, time to run %e1%
del /f /q .nodelog
copy /y nul .nodelog >nul
node js.js 
if not errorlevel 1 (
	if exist .nodelog (
		type .nodelog>>.log
		del /f /q .nodelog
	)
	goto :nodeerror
)
if exist .nodelog (
	type .nodelog>>.log
	del /f /q .nodelog
)
call :settime
set hr=%hr: =%
echo !hr!>.lastrun || %:%__zxet%!%
echo !hr! ^> .lastrun %e1%
echo.
echo. %e1%
goto loop
%:%__rgbf%!%

:error
rem , called when bat.bat encounters a (monitored) error
rem , restarts bat.bat
title ^(^^^!^) %n%: oof (line: !line!, anchor: !anchor!, lineval: !lineval!)
echo timer: batch error detected (line: !line!, anchor: !anchor!, lineval: !lineval!)
echo timer: %date% %time%: batch error detected (line: !line!, anchor: !anchor!, lineval: !lineval!) %e1%
echo timer: restarting in 10 seconds with new instance...
timeout /t 10 /nobreak >nul
start %~nx0
exit 1

:nodeerror
rem , called when js.js encounters an error
rem , reruns :run after a timeout of 10 secs
rem , error codes are inverted (0 means error, 1 means done)
rem , this is as a workaround to unhandled promises returning error 0
rem , (deprecation) the inversion will be deprecated once that changes
rem , sets: (nodeerrorcount)
set /a nodeerrorcount+=1
title ^(^^^!^) %n%: oof (node) (%nodeerrorcount%)
echo timer: node error detected (%nodeerrorcount%)
echo timer: %date% %time%: node error detected (%nodeerrorcount%) %e1%
echo timer: retrying in 10 seconds...
timeout /t 10 /nobreak >nul
goto run

:anchor <ID>
rem , used as an anchor for error checking
rem , finds the unique anchor in this file and returns the line value & number
rem , sets: (line, anchor)
setlocal
for /f " usebackq tokens=1* delims=/:" %%a in (`findstr /N "%~1" "%~f0"`) do (set linen=%%a && set linev=%%b)
( 
	endlocal
	set "line=%linen%"
	set "anchor=%~1"
	set lineval="%linev%"
	exit /b
)

:timer <hr> <min> <sec>
rem , takes current time, +1 hr, +0<rnd<10 mins
rem , implements am/pm transforming as well
rem , sets: (currenthr, currentmin, currentsec, rnd, secremaining, nexthr, nextmin, nextsec, ampm)
title %n%: cranking timer
setlocal EnableDelayedExpansion
set currenthr=%~1
set currentmin=%~2
set currentsec=%~3
set /a rnd=(!random! * 600 / 32767)
set /a remainingsec=3600 - ((currentmin * 60) + currentsec) || %:%__bxtj%!%
set /a remainingsec+=rnd
set /a nexthr=currenthr + 1
set /a nextmin=rnd / 60
set /a nextsec=rnd - (nextmin * 60)
if !nexthr! gtr 12 (
	set nexthr=%nexthr: =%
	set /a nexthr-=12
	set ampm=pm
) else (
	set ampm=am
)
set nexthr=0!nexthr!
set nextmin=0!nextmin!
set nextsec=0!nextsec!
(
	endlocal
	set nexthr=%nexthr:~-2%
	set nextmin=%nextmin:~-2%
	set nextsec=%nextsec:~-2%
	set remainingsec=%remainingsec%
	set ampm=%ampm%
)
exit /b

:parselastrun
rem , parses the value in .lastrun
rem , returns null if incorrect value is detected
rem , sets: (lastrun, lastruncheck)
echo timer: parsing .lastrun %e1%
setlocal EnableDelayedExpansion
if not exist .lastrun (
	set lastrun=
	exit /b
)
set /p lastrun=<.lastrun %e% || %:%__wegb%!%
set /a lastrun=10000%lastrun% %% 10000
if not %lastrun% equ 0 set /a lastruncheck=lastrun + 1
if errorlevel 1 %:%__vdvb%!%
if not %lastrun% equ 0 if "%lastruncheck%" leq "1" set lastrun=
set lastrun=0!lastrun!
if not "%lastrun%" equ "" (
	endlocal
	set lastrun=%lastrun:~-2%
	echo timer: .lastrun: %lastrun% %e%
)
exit /b

:timeerrorparse <hr> <min> <sec>
rem , double checks if the time is set correctly
rem , checks hr <= 24, min <= 60, sec <= 60
rem , sets: (eHr, eMin, eSec, rVal)
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
if "%rVal%" equ "1" %:%__xcnr%!%
if not %eMin% equ 0 (set /a rVal=eMin+1)
if "%rVal%" equ "1" %:%__zsbo%!%
if not %eSec% equ 0 (set /a rVal=eSec+1)
if "%rVal%" equ "1" %:%__xohc%!%
endlocal
exit /b

:settime
rem , sets the time
rem , v1.1: powershell is more reliable but slower
rem , sets: (hr, min, sec)
for /f %%a in ('powershell -command "get-date -format HH"') do set hr=%%a %e% || %:%__ulnu%!%
for /f %%a in ('powershell -command "get-date -format mm"') do set min=%%a %e% || %:%__vxcv%!%
for /f %%a in ('powershell -command "get-date -format ss"') do set sec=%%a %e% || %:%__sbuj%!%
rem (deprecated) for /f "tokens=1-3 delims=/:" %%a in ('echo %time%') do (set hr=%%a &&set min=%%b &&set sec=%%c) %e% || %:%__rydm%!%
exit /b

:debug
rem , debug mode
rem , sets: (cmd, callmode)
title %n%: debug
setlocal EnableDelayedExpansion
set /p cmd=^$ 
if "%cmd%" equ "c" (
	set callmode=true
	echo call mode enabled
	echo.
	:callmode
	set /p cmd=^$ call 
)
if "%callmode%" equ "true" if "%cmd%" equ "c" (
	set callmode=false
	echo call mode disabled
	echo.
	goto :debug
)
if "%callmode%" equ "true" (
	call %cmd%
	echo.
	title %n%: debug
	goto :callmode
)
%cmd%
echo.
title %n%: debug
goto debug