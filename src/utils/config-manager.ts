import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CONFIG_FILE = path.join(os.homedir(), '.lazydocs');

export interface RawConfig {
    GROQ_API_KEY?: string;
    DEFAULT_MODEL?: string;
    MAX_TOKENS?: number | string;
    TEMPERATURE?: number | string;
    GENERATE_COUNT?: number | string;
    TIMEOUT?: number | string;
}

export interface ValidConfig {
    GROQ_API_KEY: string;
    DEFAULT_MODEL: string;
    MAX_TOKENS: number;
    TEMPERATURE: number;
    GENERATE_COUNT: number;
    TIMEOUT: number;
}

class ConfigError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ConfigError';
    }
}

const parseAssert = (name: string, condition: boolean, message: string) => {
    if (!condition) {
        throw new ConfigError(`Invalid config property ${name}: ${message}`);
    }
};

const configParsers = {
    GROQ_API_KEY(key?: string): string {
        if (!key) {
            throw new ConfigError(
                'Please set your Groq API key via `lazydocs config set GROQ_API_KEY=<your token>`'
            );
        }
        parseAssert('GROQ_API_KEY', key.startsWith('gsk_'), 'Must start with "gsk_"');
        parseAssert('GROQ_API_KEY', key.length > 20, 'Invalid API key format');
        return key;
    },

    DEFAULT_MODEL(model?: string): string {
        if (!model || model.length === 0) {
            return 'llama-3.3-70b-versatile';
        }
        return model;
    },

    MAX_TOKENS(tokens?: string | number): number {
        if (!tokens) {
            return 2048;
        }
        const value = typeof tokens === 'string' ? tokens : String(tokens);
        parseAssert('MAX_TOKENS', /^\d+$/.test(value), 'Must be an integer');
        const parsed = Number(value);
        parseAssert('MAX_TOKENS', parsed >= 100, 'Must be at least 100');
        parseAssert('MAX_TOKENS', parsed <= 131072, 'Must be at most 131072');
        return parsed;
    },

    TEMPERATURE(temp?: string | number): number {
        if (!temp) {
            return 0.7;
        }
        const value = typeof temp === 'string' ? temp : String(temp);
        parseAssert('TEMPERATURE', /^[0-9.]+$/.test(value), 'Must be a number');
        const parsed = Number(value);
        parseAssert('TEMPERATURE', parsed >= 0, 'Must be at least 0');
        parseAssert('TEMPERATURE', parsed <= 2, 'Must be at most 2');
        return parsed;
    },

    GENERATE_COUNT(count?: string | number): number {
        if (!count) {
            return 1;
        }
        const value = typeof count === 'string' ? count : String(count);
        parseAssert('GENERATE_COUNT', /^\d+$/.test(value), 'Must be an integer');
        const parsed = Number(value);
        parseAssert('GENERATE_COUNT', parsed > 0, 'Must be greater than 0');
        parseAssert('GENERATE_COUNT', parsed <= 5, 'Must be at most 5');
        return parsed;
    },

    TIMEOUT(timeout?: string | number): number {
        if (!timeout) {
            return 30000; // 30 seconds
        }
        const value = typeof timeout === 'string' ? timeout : String(timeout);
        parseAssert('TIMEOUT', /^\d+$/.test(value), 'Must be an integer');
        const parsed = Number(value);
        parseAssert('TIMEOUT', parsed >= 1000, 'Must be at least 1000ms (1 second)');
        parseAssert('TIMEOUT', parsed <= 300000, 'Must be at most 300000ms (5 minutes)');
        return parsed;
    },
};

type ConfigKeys = keyof typeof configParsers;

const readConfigFile = (): RawConfig => {
    try {
        if (!fs.existsSync(CONFIG_FILE)) {
            return {};
        }
        const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.warn('Failed to read config file, using defaults');
        return {};
    }
};

export const getConfig = (cliConfig?: RawConfig, suppressErrors = false): ValidConfig => {
    const fileConfig = readConfigFile();
    const envConfig: RawConfig = {
        GROQ_API_KEY: process.env.GROQ_API_KEY,
    };

    const parsedConfig: any = {};

    for (const key of Object.keys(configParsers) as ConfigKeys[]) {
        const parser = configParsers[key];
        // Priority: CLI > Env > File
        const value = cliConfig?.[key] ?? envConfig[key] ?? fileConfig[key];

        if (suppressErrors) {
            try {
                parsedConfig[key] = parser(value as any);
            } catch (error) {
                // Silently use default
            }
        } else {
            parsedConfig[key] = parser(value as any);
        }
    }

    return parsedConfig as ValidConfig;
};

export const setConfig = (key: string, value: string): void => {
    if (!(key in configParsers)) {
        throw new ConfigError(`Invalid config property: ${key}`);
    }

    // Validate the value
    const parser = configParsers[key as ConfigKeys];
    const parsed = parser(value as any);

    // Read existing config
    const config = readConfigFile();

    // Update config
    config[key as ConfigKeys] = parsed as any;

    // Write back
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
};

export const getConfigValue = (key: string): string | undefined => {
    const config = readConfigFile();
    const value = config[key as ConfigKeys];
    return value !== undefined ? String(value) : undefined;
};

export const listConfig = (): RawConfig => {
    return readConfigFile();
};

export const deleteConfig = (key: string): void => {
    const config = readConfigFile();
    delete config[key as ConfigKeys];
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
};

export const configExists = (): boolean => {
    return fs.existsSync(CONFIG_FILE);
};
