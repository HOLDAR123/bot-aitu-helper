import { DotenvParseOutput } from 'dotenv';
import * as dotenv from 'dotenv';
import { IConfigService } from './config.interface';

export class ConfigService implements IConfigService {
  private readonly config: DotenvParseOutput;

  constructor() {
    const result = dotenv.config();
    if (result.error) {
      console.error("❌ Ошибка загрузки .env файла:", result.error.message);
      throw new Error("Failed to load .env file");
    }
    if (!result.parsed) {
      console.error("❌ .env файл пуст или не найден");
      throw new Error("Empty .env file or file not found");
    }

    this.config = result.parsed;
    this.validateRequiredKeys();
  }

  get(key: string): string {
    const value = this.config[key];
    if (!value) {
      console.error(`❌ Отсутствует обязательная переменная окружения: ${key}`);
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  getOptional(key: string): string | undefined {
    return this.config[key];
  }

  private validateRequiredKeys(): void {
    const requiredKeys = ['BOT_TOKEN'];
    const missingKeys = requiredKeys.filter(key => !this.config[key]);
    
    if (missingKeys.length > 0) {
      console.error(`❌ Отсутствуют обязательные переменные окружения: ${missingKeys.join(', ')}`);
      throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
    }

    // Проверяем формат токена бота
    const botToken = this.config['BOT_TOKEN'];
    if (botToken && !botToken.match(/^\d+:[A-Za-z0-9_-]{35}$/)) {
      console.warn("⚠️  BOT_TOKEN имеет неверный формат. Ожидается формат: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz");
    }

    console.log("✅ Конфигурация загружена успешно");
  }
}
