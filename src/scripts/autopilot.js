/**
 * Northstar Claim — MAXIMUM ARMY MODE
 * 
 * Aggressive autopilot for total market saturation.
 * Frequency: Every 30 minutes
 * Batch Size: 20 pages (approx. 500-1000 leads)
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '../../autopilot_state.json');
const INTERVAL_MS = 30 * 60 * 1000; // 30 MINUTES (WAR SPEED)

// Initialize state
let state = { lastPage: 25 };
if (fs.existsSync(STATE_FILE)) {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

async function runBatch() {
    const startPage = state.lastPage + 1;
    const pagesToProcess = 20;
    const endPage = startPage + pagesToProcess - 1;

    console.log(`\n🔥 [MAX ARMY MODE] Deploying Grid: Pages ${startPage} to ${endPage}...`);

    const cmd = `node src/scripts/run-pipeline.js --live --start-page ${startPage} --pages ${pagesToProcess} --count 50`;

    return new Promise((resolve) => {
        const child = exec(cmd);

        child.stdout.on('data', (data) => process.stdout.write(data));
        child.stderr.on('data', (data) => process.stderr.write(data));

        child.on('close', (code) => {
            if (code === 0) {
                console.log(`\n✅ [BATCH COMPLETE] Neural cluster ${startPage}-${endPage} synchronized.`);
                state.lastPage = endPage;
                fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
            } else {
                console.error(`\n❌ [FAILURE] Batch exited with code ${code}`);
            }
            resolve();
        });
    });
}

async function start() {
    console.log('🦾 [NEURAL GRID] Maximum Outreach Intensity Activated.');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Targeting: Florida & Texas Healthcare Execs`);
    console.log(`  Frequency: Every 30 Minutes`);
    console.log(`  Scaling: 20 Pages per Batch`);
    console.log('═══════════════════════════════════════════════════\n');

    while (true) {
        await runBatch();
        console.log(`\n⏳ [STANDBY] Recharging for 30 minutes before next wave...`);
        await new Promise(r => setTimeout(r, INTERVAL_MS));
    }
}

start();
