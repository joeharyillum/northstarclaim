const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
    const token = config.user ? config.user.token : config.token;
    const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
    const gql = (query) => fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST', headers,
        body: JSON.stringify({ query })
    }).then(r => r.json());

    const r = await gql(`mutation {
        customDomainCreate(input: {
            domain: "www.northstarmedic.com",
            projectId: "0a1d83d6-dd26-4305-9163-b06da174c4fb",
            serviceId: "5436d4eb-9ab5-4f25-b42d-5e6783f103d9",
            environmentId: "7eeb15ef-533b-414d-90b2-05c7b3f30961"
        }) {
            id
            domain
            status {
                certificateStatus
                dnsRecords {
                    requiredValue
                    hostlabel
                    recordType
                }
            }
        }
    }`);
    console.log(JSON.stringify(r, null, 2));

    // If successful, update Porkbun CNAME to match new requiredValue
    if (r.data?.customDomainCreate?.status?.dnsRecords) {
        const rec = r.data.customDomainCreate.status.dnsRecords[0];
        console.log('\nNew CNAME target:', rec.requiredValue);
        
        // Update Porkbun CNAME
        const body = {
            apikey: 'pk1_fbfb0990fc4bf146ec38c3842231136c17cfee8b299aef48c9f3f6ec2034a70a',
            secretapikey: 'sk1_9fe5d3f1c12a02802ed18897e9a4f365400c8552ebe2cb3d5211c4852b8a7959',
            type: 'CNAME',
            content: rec.requiredValue,
            ttl: '300'
        };
        
        // Delete existing www CNAME first
        const dnsRes = await fetch('https://api.porkbun.com/api/json/v3/dns/retrieve/northstarmedic.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apikey: body.apikey, secretapikey: body.secretapikey })
        });
        const dnsData = await dnsRes.json();
        const wwwCname = dnsData.records?.find(r => r.name === 'www.northstarmedic.com' && r.type === 'CNAME');
        
        if (wwwCname) {
            console.log('Current www CNAME:', wwwCname.content);
            if (wwwCname.content !== rec.requiredValue) {
                // Update it
                const editRes = await fetch(`https://api.porkbun.com/api/json/v3/dns/edit/northstarmedic.com/${wwwCname.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...body, name: 'www' })
                });
                console.log('Updated CNAME:', JSON.stringify(await editRes.json()));
            } else {
                console.log('CNAME already correct');
            }
        }

        // Also update ALIAS for root domain
        const rootAlias = dnsData.records?.find(r => r.name === 'northstarmedic.com' && r.type === 'ALIAS');
        if (rootAlias && rootAlias.content !== rec.requiredValue) {
            const editRes = await fetch(`https://api.porkbun.com/api/json/v3/dns/edit/northstarmedic.com/${rootAlias.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...body, type: 'ALIAS', name: '' })
            });
            console.log('Updated root ALIAS:', JSON.stringify(await editRes.json()));
        }
    }
}

run().catch(console.error);
