const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
    const config = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.railway', 'config.json'), 'utf8'));
    const token = config.user ? config.user.token : config.token;
    const projectId = '0a1d83d6-dd26-4305-9163-b06da174c4fb';
    const envId = '7eeb15ef-533b-414d-90b2-05c7b3f30961';
    const appSvc = '1f04bbfc-d8f8-4ec6-bda0-8c543697674a';
    const webSvc = '5436d4eb-9ab5-4f25-b42d-5e6783f103d9';

    async function gql(query) {
        const r = await fetch('https://backboard.railway.com/graphql/v2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ query })
        });
        return (await r.json());
    }

    // First: Introspect the customDomainDelete mutation to get correct args
    console.log('=== Checking API schema for delete mutation ===');
    const schema = await gql(`{ __type(name: "Mutation") { fields { name args { name type { name kind ofType { name } } } } } }`);
    const mutations = schema.data?.__type?.fields || [];
    const deleteMut = mutations.find(m => m.name === 'customDomainDelete');
    if (deleteMut) {
        console.log('customDomainDelete args:');
        for (const a of deleteMut.args) {
            console.log('  ', a.name, ':', a.type.name || a.type.kind + '(' + a.type.ofType?.name + ')');
        }
    }

    const createMut = mutations.find(m => m.name === 'customDomainCreate');
    if (createMut) {
        console.log('\ncustomDomainCreate args:');
        for (const a of createMut.args) {
            console.log('  ', a.name, ':', a.type.name || a.type.kind + '(' + a.type.ofType?.name + ')');
        }
    }

    // Check serviceDomainDelete too
    const sdDel = mutations.find(m => m.name === 'serviceDomainDelete');
    if (sdDel) {
        console.log('\nserviceDomainDelete args:');
        for (const a of sdDel.args) {
            console.log('  ', a.name, ':', a.type.name || a.type.kind + '(' + a.type.ofType?.name + ')');
        }
    }

    // Get ALL resources with domains across the entire project
    console.log('\n=== Searching for ALL domains across project ===');
    
    // Try getting deployments to find what's actually running
    const deploys = await gql(`{ project(id: "${projectId}") { services { edges { node { id name deployments(first: 1) { edges { node { id status } } } } } } } }`);
    const svcs = deploys.data?.project?.services?.edges || [];
    for (const e of svcs) {
        const n = e.node;
        const lastDeploy = n.deployments?.edges?.[0]?.node;
        console.log(`  ${n.name}: last deploy ${lastDeploy?.status || 'NONE'}`);
    }

    // Now try to delete the orphaned domain with correct syntax
    console.log('\n=== Attempting to delete orphaned domain ===');
    const del = await gql(`mutation { customDomainDelete(id: "5496bf9e-a0b5-402a-96ac-ede89a34d5eb") }`);
    console.log('Delete result:', JSON.stringify(del.data || del.errors?.[0]?.message));

    // Check if there are service domains using quota
    console.log('\n=== Checking ALL service domains ===');
    for (const e of svcs) {
        const svcId = e.node.id;
        const name = e.node.name;
        const sdList = await gql(`{ serviceDomains(projectId: "${projectId}", serviceId: "${svcId}", environmentId: "${envId}") { id domain } }`);
        const sds = sdList.data?.serviceDomains || [];
        for (const sd of sds) {
            console.log(`  ${name}: ${sd.domain} (id: ${sd.id})`);
        }
        
        // Check custom domains too  
        const cdList = await gql(`{ customDomains(projectId: "${projectId}", serviceId: "${svcId}", environmentId: "${envId}") { id domain } }`);
        const cds = cdList.data?.customDomains || [];
        for (const cd of cds) {
            console.log(`  ${name} CUSTOM: ${cd.domain} (id: ${cd.id})`);
        }
    }
}

run().catch(e => console.error(e));
