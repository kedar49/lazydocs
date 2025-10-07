import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface Config {
  GROQ_API_KEY?: string;
  DEFAULT_MODEL?: string;
  MAX_TOKENS?: number;
  TEMPERATURE?: number;
  OUTPUT_FORMAT?: 'markdown' | 'html';
}

const CONFIG_FILE = path.join(os.homedir(), '.lazydocs');

export class ConfigManager {
  private config: Config = {};

  constructor() {
    this.load();
  }

  load(): void {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        this.config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      }
    } catch (error) {
      console.warn('Failed to load config, using defaults');
    }
  }

  save(): void {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2));
  }

  get<K extends keyof Config>(key: K): Config[K] | undefined {
    // Return config value if it exists, otherwise try environment variable
    if (this.config[key] !== undefined) {
      return this.config[key];
    }
    
    // Handle environment variables with proper type conversion
    const envValue = process.env[key];
    if (envValue !== undefined) {
      // Convert string env values to proper types
      if (key === 'MAX_TOKENS') {
        return parseInt(envValue, 10) as Config[K];
      }
      if (key === 'TEMPERATURE') {
        return parseFloat(envValue) as Config[K];
      }
      return envValue as Config[K];
    }
    
    return undefined;
  }

  set<K extends keyof Config>(key: K, value: Config[K]): void {
    this.config[key] = value;
  }

  getDefaults(): Config {
    return {
      DEFAULT_MODEL: 'llama-3.1-70b-versatile',
      MAX_TOKENS: 1024,
      TEMPERATURE: 0.7,
      OUTPUT_FORMAT: 'markdown',
    };
  }
}
