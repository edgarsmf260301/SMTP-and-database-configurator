@echo off
echo Configurando Git para Restaurant Viticos System...
echo.

REM Verificar si Git está instalado
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git no está instalado.
    echo Por favor instala Git desde: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo Git encontrado. Inicializando repositorio...
echo.

REM Inicializar repositorio Git
git init
if %errorlevel% neq 0 (
    echo ERROR: No se pudo inicializar Git
    pause
    exit /b 1
)

REM Agregar todos los archivos
echo Agregando archivos al repositorio...
git add .
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron agregar los archivos
    pause
    exit /b 1
)

REM Hacer el primer commit
echo Creando commit inicial...
git commit -m "Origen"
if %errorlevel% neq 0 (
    echo ERROR: No se pudo crear el commit
    pause
    exit /b 1
)

REM Agregar repositorio remoto
echo Configurando repositorio remoto...
git remote add origin https://github.com/edgarsmf260301/restaurant-system.git
if %errorlevel% neq 0 (
    echo ERROR: No se pudo agregar el repositorio remoto
    pause
    exit /b 1
)

REM Cambiar a rama principal
echo Configurando rama principal...
git branch -M main
if %errorlevel% neq 0 (
    echo ERROR: No se pudo cambiar la rama
    pause
    exit /b 1
)

REM Subir al repositorio
echo Subiendo al repositorio de GitHub...
git push -u origin main
if %errorlevel% neq 0 (
    echo ERROR: No se pudo subir al repositorio
    echo Verifica que el repositorio existe en GitHub
    pause
    exit /b 1
)

echo.
echo ✅ ¡Repositorio configurado exitosamente!
echo.
echo El proyecto está ahora en: https://github.com/edgarsmf260301/restaurant-system.git
echo.
pause 