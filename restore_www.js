const fs = require('fs');
const path = require('path');
const os = require('os');

const cfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
const token = cfg.user.token;

async function gql(query) {
  const r = await fetch('https://backboard.railway.com/graphql/v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ query })
  });
  return r.json();
}

async function porkbun(endpoint, body = {}) {
  const r = await fetch('https://api.porkbun.com/api/json/v3' + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apikey: 'pk1_d0df44c612a6dd7e898dc653306cf583d04d5846473770484d88c0532fd43758',
      secretapikey: 'sk1_c6938ca34a2926fe0df6c671d3ab4c0e741454b5f0229b9cc6d4dbc9f487e637',
      ...body
    })
  });
  return r.json();
}

async function main() {
  console.log('Adding www.northstarmedic.com back to northstar-app...');
  
  const result = await gql(`mutation {
    customDomainCreate(input: {
      domain: "www.northstarmedic.com"
      projectId: "0a1d83d6-dd26-4305-9163-b06da174c4fb"
      environmentId: "7eeb15ef-533b-414d-90b2-05c7b3f30961"
      serviceId: "1f04bbfc-d8f8-4ec6-bda0-8c543697674a"
    }) {
      id domain
      status {
        certificateStatus
        dnsRecords { requiredValue currentValue status hostlabel zone }
      }
    }
  }`);

  if (result.errors) {
    console.log('ERROR:', JSON.stringify(result.errors, null, 2));
    return;
  }

  const domain = result.data.customDomainCreate;
  console.log('Added! ID:', domain.id);
  console.log('SSL:', domain.status.certificateStatus);
  
  const dns = domain.status.dnsRecords?.[0];
  if (dns) {
    console.log('DNS Required: www →', dns.requiredValue);
    console.log('DNS Current:', dns.currentValue || '(none)');
    
    // Update Porkbun CNAME if needed
    if (dns.requiredValue && dns.currentValue !== dns.requiredValue) {
      console.log('\nUpdating Porkbun www CNAME to', dns.requiredValue);
      
      // Get current records
      const records = await porkbun('/dns/retrieve/northstarmedic.com');
      const oldWww = (records.records || []).find(r => r.type === 'CNAME' && r.name === 'www.northstarmedic.com');
      if (oldWww) {
        await porkbun('/dns/delete/northstarmedic.com/' + oldWww.id);
        console.log('Deleted old CNAME:', oldWww.content);
      }
      
      const create = await porkbun('/dns/create/northstarmedic.com', {
        type: 'CNAME', name: 'www', content: dns.requiredValue, ttl: '300'
      });
      console.log('Created new CNAME:', dns.requiredValue, '(' + create.status + ')');
    }
  }

  // Show final state
  console.log('\n--- Final domain state ---');
  for (const [name, sid] of [['northstar-website', '5436d4eb-9ab5-4f25-b42d-5e6783f103d9'], ['northstar-app', '1f04bbfc-d8f8-4ec6-bda0-8c543697674a']]) {
    const q = `{domains(projectId:"0a1d83d6-dd26-4305-9163-b06da174c4fb",environmentId:"7eeb15ef-533b-414d-90b2-05c7b3f30961",serviceId:"${sid}"){customDomains{domain status{certificateStatus dnsRecords{requiredValue currentValue status}}}}}`;
    const r = await gql(q);
    const domains = r.data?.domains?.customDomains || [];
    console.log(name + ':', domains.map(d => d.domain + ' (SSL: ' + d.status.certificateStatus + ')').join(', ') || 'none');
  }
}

main().catch(e => console.error('FATAL:', e));
