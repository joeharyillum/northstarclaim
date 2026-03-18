// Quick script to update Railway env var for INSTANTLY_CAMPAIGN_ID
const fs = require('fs');
const os = require('os');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
const token = config.user ? config.user.token : config.token;
const SVC = '5436d4eb-9ab5-4f25-b42d-5e6783f103d9';
const ENV = '7eeb15ef-533b-414d-90b2-05c7b3f30961';
const PROJ = '0a1d83d6-dd26-4305-9163-b06da174c4fb';
const NEW_CAMP = '93700fc2-53a9-4b1d-8989-cb3d1d1e424b';

const query = `mutation { variableUpsert(input: { serviceId: "${SVC}", environmentId: "${ENV}", projectId: "${PROJ}", name: "INSTANTLY_CAMPAIGN_ID", value: "${NEW_CAMP}" }) }`;

fetch('https://backboard.railway.com/graphql/v2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
  body: JSON.stringify({ query })
}).then(r => r.json()).then(d => {
  console.log('Railway env update result:', JSON.stringify(d, null, 2));
}).catch(e => console.error('Error:', e));
