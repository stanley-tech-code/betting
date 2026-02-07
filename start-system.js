import dotenv from 'dotenv';
import chalk from 'chalk';
import { startBrain } from './brain/core.js';

dotenv.config();

console.log(chalk.cyan.bold('\n🚀 A.K.Maina Autonomous Ads System Starting...\n'));

// 1. Check Credentials
const checkEnv = () => {
  const required = ['PROPELLER_API_KEY', 'OPENAI_API_KEY'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error(chalk.red(`❌ Missing keys: ${missing.join(', ')}`));
    console.log(chalk.yellow('Please add them to your .env file.'));
    process.exit(1);
  }
  console.log(chalk.green('✅ Credentials found.'));
};

// 2. Start the "Brain"
const init = async () => {
  checkEnv();

  console.log(chalk.blue('🧠 Initializing AI Core...'));
  try {
    await startBrain();
  } catch (error) {
    console.error(chalk.red('💀 System Crash:'), error.message);
  }
};

init();
