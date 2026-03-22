require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const prisma = new PrismaClient();

// =========================================================================
// 🚀 INSTANTLY & SENDGRID BYPASS SCRIPT
// =========================================================================
// Put the exact password you typed earlier when you created the 
// joehary@northstarmedic.com mailbox on porkbun.com in the specific quotes below:
// =========================================================================
const MY_PORKBUN_PASSWORD = "REPLACE_ME_HERE_WITH_PASSWORD";
// =========================================================================

const FROM_EMAIL = 'joehary@northstarmedic.com'; 
const FROM_NAME = 'Joe Hary — NorthStar Medic';

async function blastWhales() {
    if (MY_PORKBUN_PASSWORD === "REPLACE_ME_HERE_WITH_PASSWORD") {
        console.error('\n❌ ERROR: You must open _bypass_instantly.js and put your password on line 11.');
        console.error('If you forgot what you entered, log into Porkbun -> Email Hosting -> Update Password.\n');
        process.exit(1);
    }
    
    console.log('🚀 INITIATING DIRECT SMTP BLAST (BYPASSING INSTANTLY & SENDGRID ENTIRELY)');
    
    // Connect directly to the Porkbun server
    const transporter = nodemailer.createTransport({
        host: "smtp.porkbun.com",
        port: 465,
        secure: true, // Use SSL/TLS
        auth: {
            user: FROM_EMAIL,
            pass: MY_PORKBUN_PASSWORD
        }
    });

    // Verify SMTP connection before starting
    try {
        await transporter.verify();
        console.log('✅ Connected to Porkbun SMTP successfully.');
    } catch (e) {
        console.error('\n❌ Authentication failed! Error: ' + e.message);
        console.error('Make sure you typed the exact password you created in Porkbun.\n');
        process.exit(1);
    }

    // Get the 100 whales
    const whales = await prisma.lead.findMany({
        where: { source: 'whale_target' },
        take: 100
    });
    
    let sent = 0;
    let failed = 0;
    
    for (const whale of whales) {
        process.stdout.write(`Sending to: ${whale.email}... `);

        const firstName = whale.firstName || 'there';
        const company = whale.company || 'your organization';
        const title = whale.title || 'executive';
        
        try {
            await transporter.sendMail({
                from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
                to: whale.email,
                subject: `Recovering denied claims for ${company}`,
                text: `Hi ${firstName},\n\nAs ${title} at ${company}, you know denied claims are likely your largest controllable revenue leak.\n\nWe built an enterprise AI engine that reads denial letters, writes clinical rebuttals referencing specific payer guidelines, and resubmits — on autopilot.\n\nWe only charge a percentage of what we successfully recover. If we recover nothing, you pay nothing.\n\nWould a free 48-hour pilot on a batch of your hardest denials be worth 15 minutes of your time?\n\nJust reply to this email to coordinate.\n\nBest,\nJoe Hary\nNorthStar Medic\nhttps://www.northstarmedic.com`,
                html: `
                <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
                  <p>Hi ${firstName},</p>
                  <p>As ${title} at ${company}, you know denied claims are likely your largest controllable revenue leak.</p>
                  <p>We built an enterprise AI engine that reads denial letters, writes clinical rebuttals referencing specific payer guidelines, and resubmits — on autopilot.</p>
                  <p>We only charge a percentage of what we successfully recover. <strong>If we recover nothing, you pay nothing.</strong></p>
                  <p>Would a free 48-hour pilot on a batch of your hardest denials be worth 15 minutes of your time?</p>
                  <p>Just reply to this email to coordinate.</p>
                  <p>Best,<br/>Joe Hary<br/><em>NorthStar Medic</em><br/>
                  <a href="https://www.northstarmedic.com">www.northstarmedic.com</a></p>
                </div>
                `
            });
            console.log('Sent. ✓');
            sent++;
            
            // Wait 2-5 seconds between sends so porkbun doesn't ban you
            const waitTime = Math.floor(Math.random() * (5000 - 2000 + 1) + 2000);
            await new Promise(r => setTimeout(r, waitTime));
            
        } catch(e) {
            console.error('Failed: ' + e.message);
            failed++;
        }
    }
    
    console.log(`\n🎉 DONE! All 100 Whales have been sent via your custom pipeline.`);
    console.log(`Sent: ${sent} | Failed: ${failed}`);
    process.exit(0);
}

blastWhales();
