#!/usr/bin/env node
import * as commander from 'commander';
import * as inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { generateReadme } from './o/r';
import { generatePrDesc } from './o/p';
import { generateChangelog } from './o/c';
import { getAvailableModels, getFallbackModels, getDefaultModel } from './ai';
import { getConfig, setConfig, getConfigValue, listConfig, deleteConfig } from './utils/config-manager';

// Helper to log errors locally
const logError = (message: string) => {
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  const logFile = path.join(logDir, 'error.log');
  fs.appendFileSync(logFile, `${new Date().toISOString()} - ${message}\n`);
};

const program = new commander.Command();

// Dynamically resolve version from package.json
let version = '2.0.1';
try {
  const pkgPath = path.join(__dirname, '../package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    version = pkg.version || version;
  } else {
    const devPkgPath = path.join(__dirname, 'package.json');
    if (fs.existsSync(devPkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(devPkgPath, 'utf-8'));
      version = pkg.version || version;
    }
  }
} catch {}

program
  .name('lazydocs')
  .description('AI-powered documentation generator using Groq')
  .version(version);

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

configCmd
  .command('setup')
  .description('Interactively setup configuration parameters')
  .action(async () => {
    try {
      console.log('--- LazyDocs Configuration Setup ---\n');
      const answers = await inquirer.default.prompt([
        {
          type: 'password',
          name: 'GROQ_API_KEY',
          message: 'Enter your Groq API key (starts with gsk_):',
          validate: (input: string) => {
            if (!input) return 'API key is required!';
            if (!input.startsWith('gsk_')) return 'API key must start with "gsk_"';
            if (input.length <= 20) return 'API key format is invalid';
            return true;
          },
        },
        {
          type: 'list',
          name: 'DEFAULT_MODEL',
          message: 'Select default AI model:',
          choices: getFallbackModels(),
          default: 'llama-3.3-70b-versatile',
        },
        {
          type: 'input',
          name: 'TEMPERATURE',
          message: 'Default temperature (0.0 to 2.0):',
          default: '0.7',
          validate: (input: string) => {
            const val = parseFloat(input);
            return (!isNaN(val) && val >= 0 && val <= 2) ? true : 'Must be a number between 0 and 2';
          }
        },
        {
          type: 'input',
          name: 'MAX_TOKENS',
          message: 'Default maximum tokens (100 to 131072):',
          default: '2048',
          validate: (input: string) => {
            const val = parseInt(input, 10);
            return (!isNaN(val) && val >= 100 && val <= 131072) ? true : 'Must be an integer between 100 and 131072';
          }
        }
      ]);

      setConfig('GROQ_API_KEY', answers.GROQ_API_KEY);
      setConfig('DEFAULT_MODEL', answers.DEFAULT_MODEL);
      setConfig('TEMPERATURE', answers.TEMPERATURE);
      setConfig('MAX_TOKENS', answers.MAX_TOKENS);

      console.log('\n✔ LazyDocs configuration successfully updated and saved in ~/.lazydocs!');
    } catch (error: any) {
      logError(`Config setup error: ${error.message}`);
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
  .option('--template <path>', 'Custom Handlebars template file path')
  .option('--base <branch>', 'Base branch for PR diff comparison')
  .option('--head <branch>', 'Head branch for PR diff comparison')
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
            default: fs.existsSync('./src') ? './src' : '.',
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

      // Fallback to current directory if default input directory does not exist
      if (options.input === './src' && !fs.existsSync('./src')) {
        options.input = '.';
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
        await generateReadme(options.input, options.output, apiKey, aiOptions, options.template);
      } else if (options.type === 'pr') {
        const gitOptions = { base: options.base, head: options.head };
        await generatePrDesc(options.input, options.output, apiKey, aiOptions, gitOptions);
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
        let apiKey = '';
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

// Upgrade command
program
  .command('upgrade')
  .description('Upgrade lazydocs CLI to the latest version')
  .action(() => {
    try {
      console.log('Checking for updates...');
      const latestVersion = execSync('npm show @lazykedar/lazydocs version', { encoding: 'utf-8' }).trim();
      console.log(`Current version: ${version}`);
      console.log(`Latest version: ${latestVersion}`);

      if (version === latestVersion) {
        console.log('You are already on the latest version!');
        return;
      }

      console.log(`Upgrading @lazykedar/lazydocs from ${version} to ${latestVersion}...`);
      execSync('npm install -g @lazykedar/lazydocs@latest', { stdio: 'inherit' });
      console.log('\n✔ Successfully upgraded to the latest version!');
    } catch (error: any) {
      logError(`Upgrade error: ${error.message}`);
      console.error(`Error: Upgrade failed: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();
