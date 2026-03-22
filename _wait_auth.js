require('dotenv').config();

async function checkInstantlyStatus() {
    const apiKey = process.env.INSTANTLY_API_KEY;
    console.log('🔍 Waiting for you to authenticate...');
}

checkInstantlyStatus();
