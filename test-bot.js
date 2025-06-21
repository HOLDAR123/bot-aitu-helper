#!/usr/bin/env node

/**
 * Простой скрипт для тестирования конфигурации бота
 * Запуск: node test-bot.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Проверка конфигурации Telegram бота AITU...\n');

// Проверяем наличие .env файла
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
    console.log('❌ Файл .env не найден!');
    console.log('📝 Создайте файл .env на основе env.example');
    console.log('💡 Пример содержимого:');
    console.log('BOT_TOKEN=your_telegram_bot_token_here');
    console.log('OPENAI_API_KEY=your_openai_api_key_here');
    process.exit(1);
}

console.log('✅ Файл .env найден');

// Проверяем package.json
const packagePath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packagePath)) {
    console.log('❌ Файл package.json не найден!');
    process.exit(1);
}

console.log('✅ Файл package.json найден');

// Проверяем наличие dist папки
const distPath = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distPath)) {
    console.log('⚠️  Папка dist не найдена. Выполните: npm run build');
} else {
    console.log('✅ Папка dist найдена');
}

// Проверяем наличие node_modules
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('⚠️  Папка node_modules не найдена. Выполните: npm install');
} else {
    console.log('✅ Папка node_modules найдена');
}

console.log('\n🚀 Для запуска бота выполните:');
console.log('   npm run build');
console.log('   npm start');
console.log('\n📚 Подробная документация в README.md'); 