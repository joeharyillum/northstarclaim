const fs = require('fs');
const path = require('path');
const os = require('os');

// Get Railway token from CLI config
const cfgPath = path.join(os.homedir(), '.railway', 'config.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const token = cfg.user.token;

const PROJECT_ID = '0a1d83d6-dd26-4305-9163-b06da174c4fb';
const SERVICE_ID = '5436d4eb-9ab5-4f25-b42d-5e6783f103d9';
const ENV_ID = '7eeb15ef-533b-414d-90b2-05c7b3f30961';

async function gql(query, variables = {}) {
  const res = await fetch('https://backboard.railway.app/graphql/v2', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  return res.json();
}

async function main() {
  // Step 1: List current domains
  console.log('=== Step 1: Listing domains ===');
  const listResult = await gql(`
    query($projectId: String!, $serviceId: String!, $environmentId: String!) {
      domains(projectId: $projectId, serviceId: $serviceId, environmentId: $environmentId) {
        customDomains {
          id
          domain
          status { dnsRecords { currentValue requiredValue hostlabel zone } }
        }
        serviceDomains {
          id
          domain
        }
      }
    }
  `, { projectId: PROJECT_ID, serviceId: SERVICE_ID, environmentId: ENV_ID });
  
  console.log(JSON.stringify(listResult, null, 2));
  
  const customs = listResult?.data?.domains?.customDomains || [];
  const northstarDomain = customs.find(d => d.domain === 'northstarmedic.com');
  
  if (northstarDomain) {
    console.log('\n=== Step 2: Deleting domain:', northstarDomain.id, '===');
    const deleteResult = await gql(`
      mutation($id: String!) {
        customDomainDelete(id: $id)
      }
    `, { id: northstarDomain.id });
    console.log('Delete result:', JSON.stringify(deleteResult, null, 2));
    
    // Wait 3 seconds
    await new Promise(r => setTimeout(r, 3000));
  } else {
    console.log('No northstarmedic.com domain found to delete');
  }
  
  // Step 3: Re-add the domain
  console.log('\n=== Step 3: Adding northstarmedic.com ===');
  const addResult = await gql(`
    mutation($input: CustomDomainCreateInput!) {
      customDomainCreate(input: $input) {
        id
        domain
        status { dnsRecords { currentValue requiredValue hostlabel zone } }
      }
    }
  `, { 
    input: { 
      domain: 'northstarmedic.com', 
      environmentId: ENV_ID, 
      serviceId: SERVICE_ID,
      projectId: PROJECT_ID
    } 
  });
  console.log('Add result:', JSON.stringify(addResult, null, 2));

  // Step 4: Verify with certificate info
  console.log('\n=== Step 4: Verifying domains ===');
  const verifyResult = await gql(`
    query($projectId: String!, $serviceId: String!, $environmentId: String!) {
      domains(projectId: $projectId, serviceId: $serviceId, environmentId: $environmentId) {
        customDomains { 
          id domain 
          status { 
            dnsRecords { currentValue requiredValue hostlabel zone }
            certificates { id domainId expiresAt issuedAt }
          } 
        }
      }
    }
  `, { projectId: PROJECT_ID, serviceId: SERVICE_ID, environmentId: ENV_ID });
  console.log(JSON.stringify(verifyResult, null, 2));
}

main().catch(console.error);
