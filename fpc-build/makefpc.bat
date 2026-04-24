@echo on
setlocal EnableExtensions
cd /d "%~dp0" || exit /b 1

set "BOOTSTRAP_FPC_DIR=C:\bin\lazarus\4.6\fpc\3.2.4\bin\x86_64-win64"
set "FPC_EXE=%BOOTSTRAP_FPC_DIR%\fpc.exe"
set "NEW_FPC=%~dp0compiler\utils\fpc.exe"

rem https://github.com/mbuilov/gnumake-windows/blob/master/gnumake-4.4.1-x64.exe
set "MAKE_EXE=%~dp0gnumake-4.4.1-x64.exe"

set "PRJDIR=%~dp0"
if "%PRJDIR:~-1%"=="\" set "PRJDIR=%PRJDIR:~0,-1%"
set "PRJDIR_FWD=%PRJDIR:\=/%"

rem mkdir "%PRJDIR%\compiler\x86_64\bin\x86_64-win64" 2>nul
rem mkdir "%PRJDIR%\compiler\x86_64\units\x86_64-win64" 2>nul

rem STEP 1 - fpx.exe
"%MAKE_EXE%" -C compiler cycle PP="%FPC_EXE%" BASEDIR="%PRJDIR_FWD%/compiler"
if errorlevel 1 goto :fail
if not exist "%NEW_FPC%" (
	echo ERROR: Expected compiler wrapper "%NEW_FPC%" was not created.
	exit /b 1
)

set "PATH=%~dp0compiler;%~dp0compiler\utils;%PATH%"
rem STEP 2 - RTL
cd /d "%~dp0rtl"
"%MAKE_EXE%" all PP="%NEW_FPC%" OS_TARGET=win64 CPU_TARGET=x86_64
if errorlevel 1 goto :fail

rem STEP 3 - Packages
cd /d "%~dp0packages"
"%MAKE_EXE%" all FPC="%NEW_FPC%" FPCFPMAKE="%NEW_FPC%" OS_TARGET=win64 CPU_TARGET=x86_64
if errorlevel 1 goto :fail

rem STEP 4 - Utils
cd /d "%~dp0utils"
"%MAKE_EXE%" all PP="%NEW_FPC%" OS_TARGET=win64 CPU_TARGET=x86_64
if errorlevel 1 goto :fail

exit /b 0

:fail
echo ERROR: Build failed at %CD% with exit code %ERRORLEVEL%.
exit /b %ERRORLEVEL%
