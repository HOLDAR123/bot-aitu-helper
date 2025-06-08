import { DotenvParseOutput } from 'dotenv';
import * as dotenv from 'dotenv';
import { IConfigService } from './config.interface';

export class ConfigService implements IConfigService {
  private readonly config: DotenvParseOutput;

  constructor() {
    const result = dotenv.config();
    if (result.error) {
      throw new Error("Failed to load .env");
    }
    if (!result.parsed) {
      throw new Error("Empty .env file");
    }

    this.config = result.parsed;
  }

  get(key: string): string {
    const value = this.config[key];
    if (!value) {
      throw new Error(`Missing key in config: ${key}`);
    }
    return value;
  }
}
