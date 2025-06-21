#!/usr/bin/env node

/**
 * Скрипт для отладки работы сессий сообщений
 */

const { setLastMessageId, getLastMessageId, clearLastMessage } = require('./dist/bot/sessions/message.session');

console.log('🔍 Тестирование сессий сообщений...\n');

// Тестируем работу с сессиями
const testUserId = 12345;

console.log('1. Проверяем начальное состояние:');
console.log(`getLastMessageId(${testUserId}) =`, getLastMessageId(testUserId));

console.log('\n2. Устанавливаем ID сообщения:');
setLastMessageId(testUserId, 100);
console.log(`setLastMessageId(${testUserId}, 100)`);

console.log('\n3. Проверяем сохранение:');
console.log(`getLastMessageId(${testUserId}) =`, getLastMessageId(testUserId));

console.log('\n4. Обновляем ID сообщения:');
setLastMessageId(testUserId, 200);
console.log(`setLastMessageId(${testUserId}, 200)`);

console.log('\n5. Проверяем обновление:');
console.log(`getLastMessageId(${testUserId}) =`, getLastMessageId(testUserId));

console.log('\n6. Очищаем сообщение:');
clearLastMessage(testUserId);
console.log(`clearLastMessage(${testUserId})`);

console.log('\n7. Проверяем очистку:');
console.log(`getLastMessageId(${testUserId}) =`, getLastMessageId(testUserId));

console.log('\n✅ Тест завершен'); 