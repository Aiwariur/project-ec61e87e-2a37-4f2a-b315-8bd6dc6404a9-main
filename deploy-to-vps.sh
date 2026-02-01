#!/bin/bash

# ПопугайМаркет - Скрипт деплоя на VPS
# Автоматическая установка и настройка на чистой Ubuntu 24.04

set -e

echo "🦜 ПопугайМаркет - Деплой на VPS"
echo "================================"
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Проверка root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}❌ Запусти скрипт от root: sudo bash deploy-to-vps.sh${NC}"
  exit 1
fi

echo -e "${YELLOW}📦 Шаг 1: Обновление системы${NC}"
apt update && apt upgrade -y

echo -e "${YELLOW}📦 Шаг 2: Установка Node.js 20.x${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo -e "${YELLOW}📦 Шаг 3: Установка PM2${NC}"
npm install -g pm2

echo -e "${YELLOW}📦 Шаг 4: Установка Nginx${NC}"
apt install -y nginx

echo -e "${YELLOW}📦 Шаг 5: Установка Git${NC}"
apt install -y git

echo -e "${GREEN}✅ Все зависимости установлены${NC}"
echo ""
node --version
npm --version
pm2 --version
nginx -v
echo ""

# Создание директории для проекта
PROJECT_DIR="/var/www/popugai-market"
echo -e "${YELLOW}📁 Шаг 6: Создание директории проекта${NC}"
mkdir -p $PROJECT_DIR

echo ""
echo -e "${GREEN}✅ Сервер готов к деплою!${NC}"
echo ""
echo -e "${YELLOW}Следующие шаги:${NC}"
echo "1. Загрузи проект на сервер в $PROJECT_DIR"
echo "2. Запусти: bash $PROJECT_DIR/setup-project.sh"
echo ""
