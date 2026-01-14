#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Get available apps
function getApps() {
  const appsDir = path.join(__dirname, '..', 'apps');
  if (!fs.existsSync(appsDir)) {
    return [];
  }
  
  return fs.readdirSync(appsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => {
      const packageJsonPath = path.join(appsDir, name, 'package.json');
      return fs.existsSync(packageJsonPath);
    });
}

// Display menu
function displayMenu(apps) {
  console.clear();
  console.log(colors.cyan + colors.bright + '╔═══════════════════════════════════════╗' + colors.reset);
  console.log(colors.cyan + colors.bright + '║   Select App to Run in Development   ║' + colors.reset);
  console.log(colors.cyan + colors.bright + '╚═══════════════════════════════════════╝' + colors.reset);
  console.log('');
  
  apps.forEach((app, index) => {
    const packageJsonPath = path.join(__dirname, '..', 'apps', app, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const appName = packageJson.name || app;
    const port = packageJson.scripts?.dev?.match(/--port\s+(\d+)/)?.[1] || 'N/A';
    
    console.log(
      colors.yellow + `  ${index + 1}.` + colors.reset + 
      ` ${colors.green}${app.padEnd(15)}` + colors.reset + 
      ` ${colors.blue}(${appName})` + colors.reset + 
      ` ${colors.magenta}Port: ${port}` + colors.reset
    );
  });
  
  console.log('');
  console.log(colors.yellow + `  ${apps.length + 1}.` + colors.reset + ` ${colors.green}All Apps${colors.reset} ${colors.blue}(run all simultaneously)${colors.reset}`);
  console.log(colors.yellow + `  ${apps.length + 2}.` + colors.reset + ` ${colors.green}Exit${colors.reset}`);
  console.log('');
}

// Run selected app
function runApp(appDir) {
  const packageJsonPath = path.join(__dirname, '..', 'apps', appDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const packageName = packageJson.name || appDir;
  
  console.log(colors.green + `\n🚀 Starting ${appDir} (${packageName})...\n` + colors.reset);
  
  const turbo = spawn('npx', ['turbo', 'dev', '--filter', packageName], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..'),
  });

  turbo.on('close', (code) => {
    if (code !== 0) {
      console.log(colors.yellow + `\n⚠️  Process exited with code ${code}` + colors.reset);
    }
    process.exit(code);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log(colors.yellow + '\n\n🛑 Stopping...' + colors.reset);
    turbo.kill('SIGINT');
    process.exit(0);
  });
}

// Run all apps
function runAllApps() {
  console.log(colors.green + '\n🚀 Starting all apps...\n' + colors.reset);
  
  const turbo = spawn('npx', ['turbo', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..'),
  });

  turbo.on('close', (code) => {
    if (code !== 0) {
      console.log(colors.yellow + `\n⚠️  Process exited with code ${code}` + colors.reset);
    }
    process.exit(code);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log(colors.yellow + '\n\n🛑 Stopping all apps...' + colors.reset);
    turbo.kill('SIGINT');
    process.exit(0);
  });
}

// Main function
function main() {
  const apps = getApps();
  
  if (apps.length === 0) {
    console.error(colors.yellow + '⚠️  No apps found in apps/ directory' + colors.reset);
    process.exit(1);
  }

  displayMenu(apps);

  rl.question(colors.cyan + 'Select an option: ' + colors.reset, (answer) => {
    const choice = parseInt(answer.trim());
    
    if (isNaN(choice)) {
      console.log(colors.yellow + '❌ Invalid option. Please enter a number.' + colors.reset);
      rl.close();
      setTimeout(main, 1000);
      return;
    }

    if (choice === apps.length + 1) {
      // Run all apps
      rl.close();
      runAllApps();
    } else if (choice === apps.length + 2) {
      // Exit
      console.log(colors.green + '👋 Goodbye!' + colors.reset);
      rl.close();
      process.exit(0);
    } else if (choice >= 1 && choice <= apps.length) {
      // Run selected app
      const selectedApp = apps[choice - 1];
      rl.close();
      runApp(selectedApp);
    } else {
      console.log(colors.yellow + '❌ Invalid option. Please select a valid number.' + colors.reset);
      rl.close();
      setTimeout(main, 1000);
    }
  });
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error(colors.yellow + '❌ Error:', error.message + colors.reset);
  rl.close();
  process.exit(1);
});

// Start the app
main();
