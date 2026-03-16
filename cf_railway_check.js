require('dotenv').config();

async function main() {
  const token = process.env.RAILWAY_API_TOKEN;

  const query = `{
    project(id: "0a1d83d6-dd26-4305-9163-b06da174c4fb") {
      services {
        edges {
          node {
            id
            name
            serviceInstances(environmentId: "7eeb15ef-533b-414d-90b2-05c7b3f30961") {
              edges {
                node {
                  domains {
                    customDomains {
                      id
                      domain
                    }
                    serviceDomains {
                      domain
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }`;

  const res = await fetch('https://backboard.railway.com/graphql/v2', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  
  const services = data.data?.project?.services?.edges || [];
  for (const s of services) {
    const svc = s.node;
    console.log('Service:', svc.name, '| ID:', svc.id);
    for (const inst of svc.serviceInstances?.edges || []) {
      const domains = inst.node?.domains;
      console.log('  Subdomains:', domains?.serviceDomains?.map(d => d.domain));
      for (const cd of domains?.customDomains || []) {
        console.log('  Custom:', cd.domain, '| ID:', cd.id);
      }
    }
  }
}
main();
