const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const CAMPAIGN_ID = "56a58f66-55f1-484d-b359-37c5552001d1";
const API_KEY = "ZjEwNThkNjQtOWU4OS00MzFlLWJlMjEtZDM2ZTVhYjRlZDZlOnNVSFdyU0FKU2xBeQ==";

async function main() {
  // Get top 100 whales
  const leads = await p.lead.findMany({
    take: 100,
    select: {
      email: true,
      firstName: true,
      lastName: true,
      company: true,
      title: true,
      phone: true,
      city: true,
      state: true,
    },
  });

  console.log(`Got ${leads.length} whale leads`);
  console.log(`Biggest: ${leads[0].company} - ${leads[0].email}`);

  // Format for Instantly
  const formatted = leads.map((l) => ({
    email: l.email,
    first_name: l.firstName || "",
    last_name: l.lastName || "",
    company_name: l.company || "",
    personalization: `I noticed ${l.company} handles a high volume of insurance claims`,
    title: l.title || "",
    phone: l.phone || "",
    website: "",
    city: l.city || "",
    state: l.state || "",
  }));

  // Send to Instantly one at a time (v2 API)
  let sent = 0;
  let failed = 0;
  for (const lead of formatted) {
    if (!lead.email) { failed++; continue; }
    try {
      const resp = await fetch("https://api.instantly.ai/api/v2/leads", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaign: CAMPAIGN_ID,
          email: lead.email,
          first_name: lead.first_name,
          last_name: lead.last_name,
          company_name: lead.company_name,
          personalization: lead.personalization,
          custom_variables: {
            title: lead.title,
            phone: lead.phone,
            city: lead.city,
            state: lead.state,
          },
          skip_if_in_campaign: true,
        }),
      });
      const data = await resp.json();
      if (resp.ok) {
        sent++;
      } else {
        console.log(`Failed ${lead.email}: ${JSON.stringify(data)}`);
        failed++;
      }
    } catch (e) {
      console.log(`Error ${lead.email}: ${e.message}`);
      failed++;
    }
    if (sent % 10 === 0 && sent > 0) console.log(`Sent: ${sent}/${formatted.length}`);
  }
  console.log(`\nDone! Sent: ${sent}, Failed: ${failed}`);
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
