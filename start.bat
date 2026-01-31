@echo off
chcp 65001 >nul
cls

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          🦜 ПопугайМаркет - Локальный запуск              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Проверка наличия Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js не установлен!
    echo Пожалуйста, установите Node.js с https://nodejs.org
    pause
    exit /b 1
)

echo ✓ Node.js найден
echo.

REM Проверка наличия node_modules
if not exist "node_modules" (
    echo 📦 Установка зависимостей...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Ошибка при установке зависимостей
        pause
        exit /b 1
    )
    echo ✓ Зависимости установлены
    echo.
)

echo 🚀 Запуск приложения...
echo.
echo ┌────────────────────────────────────────────────────────────┐
echo │ Фронтенд:  http://localhost:5173                           │
echo │ Админка:   http://localhost:5173/admin                     │
echo │ API:       http://localhost:3001                           │
echo └────────────────────────────────────────────────────────────┘
echo.
echo Нажмите Ctrl+C для остановки приложения
echo.

REM Запуск фронтенда и бэкенда одновременно
start "ПопугайМаркет - Фронтенд" cmd /k npm run dev
start "ПопугайМаркет - Бэкенд" cmd /k npm run server

echo ✓ Приложение запущено в двух окнах
echo.
pause
