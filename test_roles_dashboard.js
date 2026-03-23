const puppeteer = require('puppeteer');

async function testRole(role, email) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const baseUrl = 'http://localhost:3001';

  try {
    console.log(`\n--- Testing Role: ${role} (${email}) ---`);
    
    // 1. Go to Login
    await page.goto(`${baseUrl}/login`);
    await page.type('input[type="email"]', email);
    await page.type('input[type="password"]', 'Testpassword123!');
    
    // 2. Click Sign In and wait for navigation
    await Promise.all([
      page.waitForNavigation(),
      page.click('button[type="submit"]') // Wait, the button just says 'Sign In' but might not have type submit. It's inside a form.
    ]).catch(() => page.click('button').then(() => page.waitForNavigation()));

    const dashboardUrl = await page.url();
    if (!dashboardUrl.includes('/dashboard')) {
        console.log(`❌ Login failed for ${role}, URL is ${dashboardUrl}`);
        const html = await page.content();
        if (html.includes('Invalid')) console.log('Invalid credentials message seen!');
        return;
    }
    console.log(`✅ Login successful! Redirected to ${dashboardUrl}`);

    // Wait for Next.js to fully render dashboard page text to confirm no 500 error
    const pageText = await page.evaluate(() => document.body.innerText);
    if (pageText.includes('Application error') || pageText.includes('500 Internal')) {
      console.log(`❌ Dashboard overview crashed for ${role}.`);
    } else {
      console.log(`✅ Dashboard overview loaded for ${role}.`);
    }

    // 3. Check Wallet
    await page.goto(`${baseUrl}/dashboard/wallet`);
    await page.waitForSelector('body');
    const walletText = await page.evaluate(() => document.body.innerText);
    if (walletText.includes('Application error') || walletText.includes('500 Internal')) {
      console.log(`❌ Dashboard Wallet crashed for ${role}.`);
    } else {
      console.log(`✅ Dashboard Wallet loaded for ${role}.`);
    }

    // 4. Check War Room (Should it fail for non-admins? Currently maybe not, evaluating...)
    await page.goto(`${baseUrl}/dashboard/war-room`);
    await page.waitForSelector('body');
    const warRoomText = await page.evaluate(() => document.body.innerText);
    if (warRoomText.includes('Application error') || warRoomText.includes('500 Internal') || warRoomText.includes('Forbidden')) {
      console.log(`❌ Dashboard War Room crashed or forbidden for ${role}.`);
    } else {
      console.log(`✅ Dashboard War Room loaded for ${role}.`);
    }

    // 5. Check Settings (2FA)
    await page.goto(`${baseUrl}/dashboard/settings`);
    await page.waitForSelector('body');
    const settingsText = await page.evaluate(() => document.body.innerText);
    if (settingsText.includes('Application error') || settingsText.includes('500 Internal')) {
      console.log(`❌ Dashboard Settings crashed for ${role}.`);
    } else {
      console.log(`✅ Dashboard Settings loaded for ${role}.`);
    }

  } catch (error) {
    console.error(`❌ Test encountered an error for ${role}:`, error.message);
  } finally {
    await browser.close();
  }
}

async function runTests() {
  await testRole('admin', 'admin@mediclaim.ai');
  await testRole('biller', 'biller@mediclaim.ai');
  await testRole('client', 'client@mediclaim.ai');
}

runTests();
