// Add www.northstarmedic.com to northstar-app service on Railway
const RAILWAY_TOKEN = process.argv[2];

async function gql(query) {
  const resp = await fetch('https://backboard.railway.com/graphql/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RAILWAY_TOKEN}`,
    },
    body: JSON.stringify({ query }),
  });
  return resp.json();
}

async function main() {
  // Add www to northstar-app (has 0 custom domains now)
  console.log('Adding www.northstarmedic.com to northstar-app service...');
  const result = await gql(`
    mutation {
      customDomainCreate(input: {
        domain: "www.northstarmedic.com"
        projectId: "0a1d83d6-dd26-4305-9163-b06da174c4fb"
        environmentId: "7eeb15ef-533b-414d-90b2-05c7b3f30961"
        serviceId: "1f04bbfc-d8f8-4ec6-bda0-8c543697674a"
      }) {
        id
        domain
        status {
          certificateStatus
          dnsRecords {
            requiredValue
            currentValue
            status
            hostlabel
            zone
          }
        }
      }
    }
  `);
  console.log(JSON.stringify(result, null, 2));

  if (result.data?.customDomainCreate) {
    const d = result.data.customDomainCreate;
    console.log(`\n✓ www.northstarmedic.com added (ID: ${d.id})`);
    console.log(`  SSL: ${d.status?.certificateStatus}`);
    if (d.status?.dnsRecords) {
      for (const dns of d.status.dnsRecords) {
        console.log(`  DNS Required: ${dns.hostlabel}.${dns.zone} → ${dns.requiredValue}`);
        console.log(`  DNS Current:  ${dns.currentValue || 'not set'} (${dns.status})`);
      }
    }
    
    // Check if www needs a DIFFERENT CNAME than what we set
    const required = d.status?.dnsRecords?.[0]?.requiredValue;
    if (required && required !== 't80gj0av.up.railway.app') {
      console.log(`\n⚠ Railway wants www to point to: ${required}`);
      console.log(`  But we set it to: t80gj0av.up.railway.app`);
      console.log(`  Updating Porkbun www CNAME...`);
      
      // Update Porkbun
      const PB_API = 'pk1_d0df44c612a6dd7e898dc653306cf583d04d5846473770484d88c0532fd43758';
      const PB_SEC = 'sk1_c6938ca34a2926fe0df6c671d3ab4c0e741454b5f0229b9cc6d4dbc9f487e637';
      
      // Get current records to find www CNAME ID
      const records = await fetch('https://api.porkbun.com/api/json/v3/dns/retrieve/northstarmedic.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apikey: PB_API, secretapikey: PB_SEC })
      }).then(r => r.json());
      
      const wwwRec = records.records?.find(r => r.type === 'CNAME' && r.name === 'www.northstarmedic.com');
      if (wwwRec) {
        // Delete and recreate
        await fetch(`https://api.porkbun.com/api/json/v3/dns/delete/northstarmedic.com/${wwwRec.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apikey: PB_API, secretapikey: PB_SEC })
        });
        const create = await fetch('https://api.porkbun.com/api/json/v3/dns/create/northstarmedic.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apikey: PB_API, secretapikey: PB_SEC, type: 'CNAME', name: 'www', content: required, ttl: '300' })
        }).then(r => r.json());
        console.log(`  Updated www CNAME to: ${required} (${create.status})`);
      }
    }
  }

  // Final check: list all domains on both services
  console.log('\n━━━ Final Domain State ━━━');
  
  const services = [
    { name: 'northstar-app', id: '1f04bbfc-d8f8-4ec6-bda0-8c543697674a' },
    { name: 'northstar-website', id: '5436d4eb-9ab5-4f25-b42d-5e6783f103d9' },
  ];
  
  for (const svc of services) {
    const res = await gql(`
      query {
        domains(
          projectId: "0a1d83d6-dd26-4305-9163-b06da174c4fb"
          environmentId: "7eeb15ef-533b-414d-90b2-05c7b3f30961"
          serviceId: "${svc.id}"
        ) {
          customDomains {
            domain
            status { certificateStatus }
          }
          serviceDomains { domain }
        }
      }
    `);
    console.log(`\n  ${svc.name}:`);
    for (const d of res.data?.domains?.customDomains || []) {
      console.log(`    Custom: ${d.domain} (SSL: ${d.status?.certificateStatus})`);
    }
    for (const d of res.data?.domains?.serviceDomains || []) {
      console.log(`    Railway: ${d.domain}`);
    }
  }
}

main().catch(console.error);
