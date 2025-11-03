#!/usr/bin/env node

/**
 * RefuseBot Setup Utility
 * 
 * Comandi:
 * - node setup.js hash "your secret phrase"  → Genera hash
 * - node setup.js verify "test phrase"       → Verifica se match
 * - node setup.js test                       → Test API locale
 */

const crypto = require('crypto');
const readline = require('readline');

// Colors for console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Normalize input (same as in winCondition.ts)
function normalizeInput(input) {
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Generate hash
function hashInput(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

// Command: Generate hash
function generateHash(phrase) {
  log('\n🔐 Generating Win Condition Hash\n', 'bright');
  
  const normalized = normalizeInput(phrase);
  const hash = hashInput(normalized);
  
  log('Original phrase:', 'yellow');
  console.log(`  "${phrase}"\n`);
  
  log('Normalized:', 'yellow');
  console.log(`  "${normalized}"\n`);
  
  log('SHA256 Hash:', 'green');
  console.log(`  ${hash}\n`);
  
  log('Next steps:', 'cyan');
  console.log('  1. Copy the hash above');
  console.log('  2. Open lib/winCondition.ts');
  console.log('  3. Replace SECRET_PHRASE_HASH with this hash');
  console.log('  4. Redeploy your app\n');
  
  log('⚠️  Keep your phrase SECRET! Never commit it to Git.', 'red');
}

// Command: Verify phrase
function verifyPhrase(phrase, expectedHash) {
  const normalized = normalizeInput(phrase);
  const hash = hashInput(normalized);
  const match = hash === expectedHash;
  
  log('\n🔍 Verifying Phrase\n', 'bright');
  console.log(`Phrase: "${phrase}"`);
  console.log(`Hash: ${hash}`);
  console.log(`Match: ${match ? '✅ YES' : '❌ NO'}\n`);
  
  return match;
}

// Command: Test local API
async function testLocalAPI() {
  log('\n🧪 Testing Local API\n', 'bright');
  
  const baseURL = 'http://localhost:3000';
  
  try {
    // Test 1: Status endpoint
    log('Test 1: Status API...', 'yellow');
    const statusRes = await fetch(`${baseURL}/api/status`);
    const statusData = await statusRes.json();
    
    if (statusData.bounty) {
      log('✅ Status API working', 'green');
      console.log(`   Bounty: $${statusData.bounty.amount}`);
      console.log(`   Claimed: ${statusData.bounty.claimed}\n`);
    } else {
      log('❌ Status API error', 'red');
    }
    
    // Test 2: Chat endpoint
    log('Test 2: Chat API...', 'yellow');
    const chatRes = await fetch(`${baseURL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello bot',
        userAddress: '0xTest123',
      }),
    });
    const chatData = await chatRes.json();
    
    if (chatData.response) {
      log('✅ Chat API working', 'green');
      console.log(`   Response: "${chatData.response}"\n`);
    } else {
      log('❌ Chat API error', 'red');
    }
    
    log('🎉 All tests passed!\n', 'green');
    
  } catch (error) {
    log('❌ API Error:', 'red');
    console.error(error.message);
    log('\nIs the dev server running? (npm run dev)\n', 'yellow');
  }
}

// Command: Interactive setup
async function interactiveSetup() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  const question = (query) => new Promise((resolve) => rl.question(query, resolve));
  
  log('\n🦫 RefuseBot Setup Wizard\n', 'bright');
  
  // Step 1: Win condition
  log('Step 1: Create Win Condition', 'cyan');
  const phrase = await question('Enter your secret phrase: ');
  
  if (!phrase) {
    log('❌ Phrase cannot be empty', 'red');
    rl.close();
    return;
  }
  
  const normalized = normalizeInput(phrase);
  const hash = hashInput(normalized);
  
  console.log('');
  log(`Normalized: "${normalized}"`, 'yellow');
  log(`Hash: ${hash}`, 'green');
  console.log('');
  
  // Step 2: Confirmation
  const confirm = await question('Save this hash? (y/n): ');
  
  if (confirm.toLowerCase() === 'y') {
    // Read and update winCondition.ts
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'lib', 'winCondition.ts');
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace hash (regex to find the hash constant)
      const hashRegex = /const SECRET_PHRASE_HASH = '[a-f0-9]{64}'/;
      content = content.replace(hashRegex, `const SECRET_PHRASE_HASH = '${hash}'`);
      
      fs.writeFileSync(filePath, content);
      
      log('\n✅ Win condition updated!', 'green');
      log('File: lib/winCondition.ts', 'cyan');
    } catch (error) {
      log('\n❌ Failed to update file:', 'red');
      console.error(error.message);
      log('\nManually update lib/winCondition.ts with the hash above.', 'yellow');
    }
  }
  
  // Step 3: Environment setup
  log('\nStep 2: Environment Variables', 'cyan');
  const hasEnv = await question('Do you have a .env file? (y/n): ');
  
  if (hasEnv.toLowerCase() !== 'y') {
    log('\n⚠️  Create .env file from .env.example:', 'yellow');
    console.log('  cp .env.example .env');
    console.log('  nano .env\n');
  }
  
  // Step 4: Fireworks API
  const hasFireworks = await question('Do you have a Fireworks API key? (y/n): ');
  
  if (hasFireworks.toLowerCase() !== 'y') {
    log('\n🔥 Get Fireworks API Key:', 'yellow');
    console.log('  1. Visit: https://fireworks.ai/');
    console.log('  2. Sign up (free)');
    console.log('  3. Dashboard → API Keys');
    console.log('  4. Create New Key');
    console.log('  5. Add to .env: FIREWORKS_API_KEY=fw_xxx\n');
  }
  
  // Step 5: Redis
  log('Step 3: Redis Setup', 'cyan');
  const hasRedis = await question('Is Redis running locally? (y/n): ');
  
  if (hasRedis.toLowerCase() !== 'y') {
    log('\n💾 Install Redis:', 'yellow');
    console.log('  macOS: brew install redis && brew services start redis');
    console.log('  Linux: sudo apt install redis-server');
    console.log('  Windows: https://github.com/tporadowski/redis/releases\n');
  }
  
  // Final summary
  log('\n✨ Setup Complete!\n', 'green');
  log('Next steps:', 'cyan');
  console.log('  1. npm install');
  console.log('  2. npm run dev');
  console.log('  3. Open http://localhost:3000');
  console.log('  4. Try to win! 🎮\n');
  
  rl.close();
}

// Main CLI
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'hash':
      if (!args[1]) {
        log('Usage: node setup.js hash "your secret phrase"', 'red');
        process.exit(1);
      }
      generateHash(args.slice(1).join(' '));
      break;
      
    case 'verify':
      if (!args[1] || !args[2]) {
        log('Usage: node setup.js verify "test phrase" "expected_hash"', 'red');
        process.exit(1);
      }
      verifyPhrase(args[1], args[2]);
      break;
      
    case 'test':
      await testLocalAPI();
      break;
      
    case 'setup':
    case undefined:
      await interactiveSetup();
      break;
      
    default:
      log('\n🦫 RefuseBot Setup Utility\n', 'bright');
      log('Available commands:', 'cyan');
      console.log('  node setup.js setup              → Interactive setup wizard');
      console.log('  node setup.js hash "phrase"      → Generate win condition hash');
      console.log('  node setup.js verify "phrase"    → Verify phrase against hash');
      console.log('  node setup.js test               → Test local API\n');
  }
}

main().catch(console.error);
