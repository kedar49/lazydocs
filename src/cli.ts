#!/usr/bin/env node
import * as commander from 'commander';
import * as inquirer from 'inquirer';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { generateReadme } from './o/r';
import { generatePrDesc } from './o/p';
import { generateChangelog } from './o/c';
import { AVAILABLE_MODELS } from './ai';

// Config loaded from file or environment
const configPath = path.join(os.homedir(), '.lazydocs');
let config: { [key: string]: string } = {};
if (fs.existsSync(configPath)) {
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (error) {
    console.warn('Failed to load config, using defaults');
  }
}

const program = new commander.Command();
program
  .name('lazydocs')
  .description('🚀 AI-powered documentation generator using Groq')
  .version('1.0.0');

// Config commands
const configCmd = program.command('config');

configCmd
  .command('set')
  .argument('<key=value>', 'Set config (e.g., GROQ_API_KEY=sk-...)')
  .action((kv) => {
    const [key, value] = kv.split('=');
    if (!key || !value) {
      console.error('❌ Invalid format. Use: key=value');
      process.exit(1);
    }
    config[key] = value;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Set ${key}`);
  });

configCmd
  .command('get')
  .argument('<key>', 'Get config value')
  .action((key) => {
    const value = config[key];
    if (value) {
      console.log(value);
    } else {
      console.log('❌ Not set');
    }
  });

configCmd
  .command('list')
  .description('List all configuration')
  .action(() => {
    console.log('📋 Current Configuration:');
    if (Object.keys(config).length === 0) {
      console.log('  (empty)');
    } else {
      Object.entries(config).forEach(([key, value]) => {
        const displayValue = key.includes('KEY') ? '***' : value;
        console.log(`  ${key}: ${displayValue}`);
      });
    }
  });

// Generate command
program
  .command('generate')
  .description('Generate documentation')
  .option('-i, --input <dir>', 'Input code directory', './src')
  .option('-o, --output <file>', 'Output file')
  .option('-t, --type <type>', 'Doc type: readme, pr, changelog', 'readme')
  .option('-m, --model <model>', 'AI model to use', 'llama-3.1-70b-versatile')
  .option('--temperature <temp>', 'AI temperature (0-1)', parseFloat, 0.7)
  .option('--max-tokens <tokens>', 'Maximum tokens', parseInt, 2048)
  .option('--interactive', 'Interactive mode')
  .option('--verbose', 'Verbose output')
  .action(async (options) => {
    try {
      const startTime = Date.now();

      // Interactive mode
      if (options.interactive) {
        const answers = await inquirer.default.prompt([
          {
            type: 'list',
            name: 'type',
            message: '📝 What would you like to generate?',
            choices: [
              { name: '📖 README.md', value: 'readme' },
              { name: '🔀 PR Description', value: 'pr' },
              { name: '📋 Changelog', value: 'changelog' },
            ],
          },
          {
            type: 'input',
            name: 'input',
            message: '📁 Input directory:',
            default: './src',
          },
          {
            type: 'list',
            name: 'model',
            message: '🤖 Select AI model:',
            choices: AVAILABLE_MODELS.map(m => ({
              name: m,
              value: m,
            })),
            default: 'llama-3.1-70b-versatile',
          },
        ]);
        Object.assign(options, answers);
      }

      // Set default output if not provided
      if (!options.output) {
        const defaults: { [key: string]: string } = {
          readme: './README.md',
          pr: './PR_DESCRIPTION.md',
          changelog: './CHANGELOG.md',
        };
        options.output = defaults[options.type];
      }

      // Validate model
      if (!AVAILABLE_MODELS.includes(options.model)) {
        console.error(`❌ Invalid model. Available models: ${AVAILABLE_MODELS.join(', ')}`);
        process.exit(1);
      }

      // Get API key
      let apiKey = process.env.GROQ_API_KEY || config.GROQ_API_KEY;
      if (!apiKey) {
        const answers = await inquirer.default.prompt([
          {
            type: 'password',
            name: 'apiKey',
            message: '🔑 Enter your Groq API key (from console.groq.com):',
            validate: (input: string) => (input ? true : 'API key is required!'),
          },
          {
            type: 'confirm',
            name: 'save',
            message: '💾 Save API key to config?',
            default: true,
          },
        ]);
        apiKey = answers.apiKey;
        if (answers.save) {
          config.GROQ_API_KEY = apiKey;
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        }
      }

      if (options.verbose) {
        console.log('🔧 Configuration:');
        console.log(`  Type: ${options.type}`);
        console.log(`  Input: ${options.input}`);
        console.log(`  Output: ${options.output}`);
        console.log(`  Model: ${options.model}`);
        console.log(`  Temperature: ${options.temperature}`);
        console.log(`  Max Tokens: ${options.maxTokens}`);
      }

      console.log(`🚀 Generating ${options.type} from ${options.input}...`);

      const aiOptions = {
        model: options.model,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      };

      // Generate documentation
      if (options.type === 'readme') {
        await generateReadme(options.input, options.output, apiKey, aiOptions);
      } else if (options.type === 'pr') {
        await generatePrDesc(options.input, options.output, apiKey, aiOptions);
      } else if (options.type === 'changelog') {
        await generateChangelog(options.input, options.output, apiKey, aiOptions);
      } else {
        throw new Error(`❌ Invalid type: ${options.type}`);
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Generated ${options.type} at ${options.output} (${duration}s)`);

      // Show file size
      if (fs.existsSync(options.output)) {
        const stats = fs.statSync(options.output);
        console.log(`📊 File size: ${(stats.size / 1024).toFixed(1)} KB`);
      }
    } catch (error: any) {
      console.error(`❌ Error: ${error.message}`);
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
          message: '📦 Project name:',
          default: path.basename(process.cwd()),
        },
        {
          type: 'input',
          name: 'description',
          message: '📝 Project description:',
        },
        {
          type: 'checkbox',
          name: 'features',
          message: '🎯 Select features to document:',
          choices: [
            'Installation guide',
            'Usage examples',
            'API documentation',
            'Contributing guidelines',
            'License information',
          ],
        },
      ]);

      // Create .lazydocs config
      const projectConfig = {
        projectName: answers.projectName,
        description: answers.description,
        features: answers.features,
        createdAt: new Date().toISOString(),
      };

      fs.writeFileSync('.lazydocs.json', JSON.stringify(projectConfig, null, 2));
      console.log('✅ Initialized lazydocs configuration at .lazydocs.json');
    } catch (error: any) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

// Models command
program
  .command('models')
  .description('List available AI models')
  .action(() => {
    console.log('🤖 Available AI Models:');
    AVAILABLE_MODELS.forEach((model, index) => {
      console.log(`  ${index + 1}. ${model}`);
    });
  });

program.parse();
