#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting SolveGuild Platform...\n');

// Check if we're in the right directory
const fs = require('fs');
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Install dependencies if node_modules doesn't exist
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing server dependencies...');
  const npmInstall = spawn('npm', ['install'], { stdio: 'inherit' });
  
  npmInstall.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Server dependencies installed successfully!\n');
      installClientDependencies();
    } else {
      console.error('❌ Failed to install server dependencies');
      process.exit(1);
    }
  });
} else {
  installClientDependencies();
}

function installClientDependencies() {
  if (!fs.existsSync('client/node_modules')) {
    console.log('📦 Installing client dependencies...');
    const clientInstall = spawn('npm', ['run', 'install-client'], { stdio: 'inherit' });
    
    clientInstall.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Client dependencies installed successfully!\n');
        startApplication();
      } else {
        console.error('❌ Failed to install client dependencies');
        process.exit(1);
      }
    });
  } else {
    startApplication();
  }
}

function startApplication() {
  console.log('🎯 Starting the application...\n');
  console.log('📝 Note: Make sure MongoDB is running on your system');
  console.log('📝 Note: Create a .env file with your configuration (see env.example)\n');
  
  // Start the development server
  const devServer = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
  
  devServer.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Application exited with code ${code}`);
    }
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down application...');
    devServer.kill('SIGINT');
    process.exit(0);
  });
}
