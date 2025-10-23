#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting SolveGuild Development Environment...\n');

// Check if we're in the right directory
const fs = require('fs');
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check if dependencies are installed
if (!fs.existsSync('node_modules')) {
  console.log('📦 Dependencies not found. Running setup...');
  const setup = spawn('node', ['scripts/setup.js'], { stdio: 'inherit' });
  
  setup.on('close', (code) => {
    if (code === 0) {
      startDevelopment();
    } else {
      console.error('❌ Setup failed');
      process.exit(1);
    }
  });
} else {
  startDevelopment();
}

function startDevelopment() {
  console.log('\n🎯 Starting development servers...\n');
  console.log('📝 Note: Make sure MongoDB is running on your system');
  console.log('📝 Note: Update backend/.env with your configuration\n');
  
  // Start the development server
  const devServer = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit',
    shell: true
  });
  
  devServer.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Development server exited with code ${code}`);
    }
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development servers...');
    devServer.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down development servers...');
    devServer.kill('SIGTERM');
    process.exit(0);
  });
}
