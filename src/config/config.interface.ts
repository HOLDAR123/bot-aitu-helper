export interface IConfigService {
  get(key: string): string;
  getOptional(key: string): string | undefined;
}