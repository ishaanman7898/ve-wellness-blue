/**
 * Start both Vite dev server and Python chatbot backend
 */
import { spawn } from 'child_process';
import { platform } from 'os';

const isWindows = platform() === 'win32';

console.log('🚀 Starting Thrive Wellness Development Environment...\n');

// Start Vite dev server
console.log('📦 Starting Vite dev server...');
const viteProcess = spawn('npm', ['run', 'start'], {
  shell: true,
  stdio: 'inherit'
});

// Wait a bit for Vite to start, then start Python backend
setTimeout(() => {
  console.log('\n🤖 Starting Python chatbot backend...');
  
  const pythonCmd = isWindows ? 'python' : 'python3';
  const chatbotProcess = spawn(pythonCmd, ['chatbot-backend/app.py'], {
    shell: true,
    stdio: 'inherit',
    cwd: process.cwd()
  });

  chatbotProcess.on('error', (err) => {
    console.error('❌ Failed to start chatbot backend:', err.message);
    console.log('\n💡 Make sure Python is installed and dependencies are installed:');
    console.log('   cd chatbot-backend');
    console.log('   pip install -r requirements.txt');
  });
}, 2000);

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down development servers...');
  viteProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  viteProcess.kill();
  process.exit(0);
});
