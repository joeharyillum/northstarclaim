const fs = require('fs'), path = require('path'), os = require('os');
const token = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8')).user.token;

const vars = {
  projectId: '0a1d83d6-dd26-4305-9163-b06da174c4fb',
  serviceId: '5436d4eb-9ab5-4f25-b42d-5e6783f103d9',
  environmentId: '7eeb15ef-533b-414d-90b2-05c7b3f30961'
};

async function main() {
  const res = await fetch('https://backboard.railway.app/graphql/v2', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query($projectId: String!, $serviceId: String!, $environmentId: String!) {
        domains(projectId: $projectId, serviceId: $serviceId, environmentId: $environmentId) {
          customDomains {
            id
            domain
            status {
              dnsRecords { currentValue requiredValue hostlabel zone }
            }
          }
        }
      }`,
      variables: vars
    })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));

  // Also test HTTP
  try {
    const httpRes = await fetch('https://northstarmedic.com', { redirect: 'manual' });
    console.log('\nHTTP Status:', httpRes.status, httpRes.statusText);
  } catch (e) {
    console.log('\nHTTP Error:', e.cause?.code || e.message);
  }
}

main();
