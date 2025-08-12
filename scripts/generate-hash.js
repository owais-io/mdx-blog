// scripts/generate-hash.js
const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = '986041'; // Change this to your desired password
  const saltRounds = 12;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Password Hash:', hash);
    console.log('\nAdd this to your .env.local file:');
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

generateHash();