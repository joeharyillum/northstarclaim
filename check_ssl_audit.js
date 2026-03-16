#!/usr/bin/env node

async function checkSSL() {
  console.log('\n🔒 SSL/SECURITY AUDIT — www.northstarmedic.com\n');
  console.log('='.repeat(60));
  
  // 1. Check HTTPS
  console.log('\n1️⃣  HTTPS CHECK:');
  try {
    const res = await fetch('https://www.northstarmedic.com', { redirect: 'manual' });
    console.log('   Status: ' + res.status + ' ' + (res.status === 200 ? '✅ HTTPS working' : '⚠️ Status ' + res.status));
    
    const headers = Object.fromEntries(res.headers.entries());
    
    // Security headers
    console.log('\n2️⃣  SECURITY HEADERS:');
    const secHeaders = {
      'strict-transport-security': 'HSTS',
      'x-frame-options': 'X-Frame-Options',
      'x-content-type-options': 'X-Content-Type-Options',
      'x-xss-protection': 'XSS Protection',
      'content-security-policy': 'CSP',
      'referrer-policy': 'Referrer Policy',
      'permissions-policy': 'Permissions Policy'
    };
    
    for (const [header, label] of Object.entries(secHeaders)) {
      const val = headers[header];
      if (val) {
        console.log('   ✅ ' + label + ': ' + val.substring(0, 80));
      } else {
        console.log('   ❌ ' + label + ': MISSING');
      }
    }
    
    // Server info
    console.log('\n3️⃣  SERVER INFO:');
    console.log('   Server: ' + (headers['server'] || 'Not disclosed ✅'));
    console.log('   X-Powered-By: ' + (headers['x-powered-by'] || 'Not disclosed ✅'));
    
  } catch(e) {
    console.log('   ❌ HTTPS connection failed: ' + e.message);
  }
  
  // 2. HTTP redirect
  console.log('\n4️⃣  HTTP → HTTPS REDIRECT:');
  try {
    const httpRes = await fetch('http://www.northstarmedic.com', { redirect: 'manual' });
    const location = httpRes.headers.get('location');
    if (httpRes.status === 301 || httpRes.status === 308) {
      console.log('   ✅ Permanent redirect (' + httpRes.status + ') → ' + location);
    } else if (httpRes.status === 302 || httpRes.status === 307) {
      console.log('   ⚠️ Temporary redirect (' + httpRes.status + ') → ' + location);
    } else if (httpRes.status === 200) {
      console.log('   ❌ HTTP serves without redirect — security risk');
    } else {
      console.log('   Status: ' + httpRes.status);
    }
  } catch(e) {
    console.log('   Note: ' + e.message);
  }
  
  // 3. Naked domain
  console.log('\n5️⃣  NAKED DOMAIN (northstarmedic.com):');
  try {
    const nakedRes = await fetch('https://northstarmedic.com', { redirect: 'manual' });
    const loc = nakedRes.headers.get('location');
    if (nakedRes.status === 301 || nakedRes.status === 308) {
      console.log('   ✅ Redirects (' + nakedRes.status + ') → ' + loc);
    } else if (nakedRes.status === 200) {
      console.log('   ✅ Serves content (status 200)');
    } else {
      console.log('   Status: ' + nakedRes.status);
    }
  } catch(e) {
    console.log('   ❌ ' + e.message);
  }
  
  // 4. Page content
  console.log('\n6️⃣  PAGE CONTENT CHECK:');
  try {
    const pageRes = await fetch('https://www.northstarmedic.com');
    const html = await pageRes.text();
    console.log('   Content length: ' + (html.length / 1024).toFixed(1) + ' KB');
    console.log('   Has <title>: ' + (html.includes('<title>') ? '✅' : '❌'));
    console.log('   Has canonical: ' + (html.includes('canonical') ? '✅' : '❌'));
    console.log('   Has viewport: ' + (html.includes('viewport') ? '✅' : '❌'));
    console.log('   Stripe link present: ' + (html.includes('stripe.com') ? '✅' : '❌'));
    console.log('   HIPAA mention: ' + (html.includes('HIPAA') ? '✅' : '❌'));
  } catch(e) {
    console.log('   ❌ Page load failed: ' + e.message);
  }
  
  console.log('\n' + '='.repeat(60));
}

checkSSL().catch(e => console.error(e));
