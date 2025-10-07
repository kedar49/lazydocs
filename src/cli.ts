#!/usr/bin/env node
import * as commander from 'commander';
import * as inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import { generateReadme } from './o/r';
import { generatePrDesc } from './o/p';
import { generateChangelog } from './o/c';
import { getAvailableModels, getFallbackModels, getDefaultModel } from './ai';
import { getConfig, setConfig, getConfigValue, listConfig, deleteConfig } from './utils/config-manager';

const logError = (message: string) => {
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  const logFile = path.join(logDir, 'error.log');
  fs.appendFileSync(logFile, `${new Date().toISOString()} - ${message}\n`);
};

const program = new commander.Command();
program
  .name('lazydocs')
  .description('AI-powered documentation generator using Groq')
  .version('1.1.0');

// Config commands
const configCmd = program.command('config');

configCmd
  .command('set')
  .argument('<key=value>', 'Set config (e.g., GROQ_API_KEY=gsk_...)')
  .action((kv) => {
    try {
      const [key, value] = kv.split('=');
      if (!key || !value) {
        throw new Error('Invalid format. Use: key=value');
      }
      setConfig(key, value);
      console.log(`Set ${key} in ~/.lazydocs`);
    } catch (error: any) {
      logError(`Config set error: ${error.message}`);
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

configCmd
  .command('get')
  .argument('<key>', 'Get config value')
  .action((key) => {
    try {
      const value = getConfigValue(key);
      if (value) {
        const displayValue = key.includes('KEY') ? value.substring(0, 10) + '***' : value;
        console.log(displayValue);
      } else {
        console.log('Not set');
      }
    } catch (error: any) {
      logError(`Config get error: ${error.message}`);
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

configCmd
  .command('list')
  .description('List all configuration')
  .action(() => {
    try {
      const config = listConfig();
      if (Object.keys(config).length === 0) {
        console.log('Current Configuration: (empty - using defaults)');
      } else {
        console.log('Current Configuration:\n');
        Object.entries(config).forEach(([key, value]) => {
          const displayValue = key.includes('KEY') ? String(value).substring(0, 10) + '***' : value;
          console.log(`  ${key}: ${displayValue}`);
        });
      }
    } catch (error: any) {
      logError(`Config list error: ${error.message}`);
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

configCmd
  .command('delete')
  .argument('<key>', 'Delete config value')
  .action((key) => {
    try {
      const value = getConfigValue(key);
      if (value) {
        deleteConfig(key);
        console.log(`Deleted ${key} from ~/.lazydocs`);
      } else {
        console.log('Not set');
      }
    } catch (error: any) {
      logError(`Config delete error: ${error.message}`);
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// Generate command
program
  .command('generate')
  .description('Generate documentation')
  .option('-i, --input <dir>', 'Input code directory', './src')
  .option('-o, --output <file>', 'Output file')
  .option('-t, --type <type>', 'Doc type: readme, pr, changelog', 'readme')
  .option('-m, --model <model>', 'AI model to use', getDefaultModel())
  .option('--temperature <temp>', 'AI temperature (0-1)', parseFloat, 0.7)
  .option('--max-tokens <tokens>', 'Maximum tokens', parseInt, 2048)
  .option('--interactive', 'Interactive mode')
  .option('--verbose', 'Verbose output')
  .action(async (options) => {
    try {
      const startTime = Date.now();

      // Interactive mode
      if (options.interactive) {
        let apiKey: string;
        try {
          const config = getConfig({}, true);
          apiKey = config.GROQ_API_KEY;
        } catch {
          const keyAnswer = await inquirer.default.prompt([
            {
              type: 'password',
              name: 'apiKey',
              message: 'Enter your Groq API key (from console.groq.com):',
              validate: (input: string) => (input ? true : 'API key is required!'),
            },
          ]);
          apiKey = keyAnswer.apiKey;
        }

        console.log('Fetching available models...');
        const availableModels = await getAvailableModels(apiKey);

        const answers = await inquirer.default.prompt([
          {
            type: 'list',
            name: 'type',
            message: 'What would you like to generate?',
            choices: [
              { name: 'README.md', value: 'readme' },
              { name: 'PR Description', value: 'pr' },
              { name: 'Changelog', value: 'changelog' },
            ],
          },
          {
            type: 'input',
            name: 'input',
            message: 'Input directory:',
            default: './src',
          },
          {
            type: 'list',
            name: 'model',
            message: 'Select AI model:',
            choices: availableModels.map((m: string) => ({
              name: m,
              value: m,
            })),
            default: getDefaultModel(),
          },
        ]);
        Object.assign(options, answers);
      }

      // Set default output
      if (!options.output) {
        const defaults: { [key: string]: string } = {
          readme: './README.md',
          pr: './PR_DESCRIPTION.md',
          changelog: './CHANGELOG.md',
        };
        options.output = defaults[options.type];
      }

      // Get API key
      let apiKey: string;
      try {
        const config = getConfig({}, true);
        apiKey = config.GROQ_API_KEY;
      } catch {
        const answers = await inquirer.default.prompt([
          {
            type: 'password',
            name: 'apiKey',
            message: 'Enter your Groq API key (from console.groq.com):',
            validate: (input: string) => (input ? true : 'API key is required!'),
          },
          {
            type: 'confirm',
            name: 'save',
            message: 'Save API key to ~/.lazydocs?',
            default: true,
          },
        ]);
        apiKey = answers.apiKey;
        if (answers.save) {
          setConfig('GROQ_API_KEY', apiKey);
        }
      }

      if (options.verbose) {
        console.log('Configuration:');
        console.log(`  Type: ${options.type}`);
        console.log(`  Input: ${options.input}`);
        console.log(`  Output: ${options.output}`);
        console.log(`  Model: ${options.model}`);
        console.log(`  Temperature: ${options.temperature}`);
        console.log(`  Max Tokens: ${options.maxTokens}`);
      }

      console.log(`Generating ${options.type} from ${options.input}...`);

      const aiOptions = {
        model: options.model,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      };

      // Generate
      if (options.type === 'readme') {
        await generateReadme(options.input, options.output, apiKey, aiOptions);
      } else if (options.type === 'pr') {
        await generatePrDesc(options.input, options.output, apiKey, aiOptions);
      } else if (options.type === 'changelog') {
        await generateChangelog(options.input, options.output, apiKey, aiOptions);
      } else {
        throw new Error(`Invalid type: ${options.type}`);
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Generated ${options.type} at ${options.output} (${duration}s)`);

      if (fs.existsSync(options.output)) {
        const stats = fs.statSync(options.output);
        console.log(`File size: ${(stats.size / 1024).toFixed(1)} KB`);
      }
    } catch (error: any) {
      logError(`Generate error: ${error.message}`);
      console.error(`Error: ${error.message}`);
      if (options.verbose && error.stack) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Init command
program
  .command('init')
  .description('Initialize lazydocs in current project')
  .action(async () => {
    try {
      const answers = await inquirer.default.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'Project name:',
          default: path.basename(process.cwd()),
        },
        {
          type: 'input',
          name: 'description',
          message: 'Project description:',
        },
        {
          type: 'checkbox',
          name: 'features',
          message: 'Select features to document:',
          choices: [
            'Installation guide',
            'Usage examples',
            'API documentation',
            'Contributing guidelines',
            'License information',
          ],
        },
      ]);

      const projectConfig = {
        projectName: answers.projectName,
        description: answers.description,
        features: answers.features,
        createdAt: new Date().toISOString(),
      };

      fs.writeFileSync('.lazydocs.json', JSON.stringify(projectConfig, null, 2));
      console.log('Initialized lazydocs configuration at .lazydocs.json');
    } catch (error: any) {
      logError(`Init error: ${error.message}`);
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// Models command
program
  .command('models')
  .description('List available AI models')
  .option('--refresh', 'Fetch latest models from API')
  .action(async (options) => {
    try {
      if (options.refresh) {
        let apiKey: string;
        try {
          const config = getConfig({}, true);
          apiKey = config.GROQ_API_KEY;
        } catch {
          console.error('API key required. Set with: lazydocs config set GROQ_API_KEY=your_key');
          process.exit(1);
        }

        console.log('Fetching latest models from Groq API...\n');
        const models = await getAvailableModels(apiKey);

        console.log('Available AI Models:\n');
        models.forEach((model, index) => {
          const isDefault = model === getDefaultModel();
          const marker = isDefault ? '*' : ' ';
          console.log(`${marker} ${index + 1}. ${model}${isDefault ? ' (default)' : ''}`);
        });
        console.log(`\nFound ${models.length} active models`);
      } else {
        console.log('Available AI Models (fallback list):\n');
        const models = getFallbackModels();
        models.forEach((model, index) => {
          const isDefault = model === getDefaultModel();
          const marker = isDefault ? '*' : ' ';
          console.log(`${marker} ${index + 1}. ${model}${isDefault ? ' (default)' : ''}`);
        });
        console.log('\nUse --refresh to fetch latest models from API');
      }
    } catch (error: any) {
      logError(`Models error: ${error.message}`);
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();
