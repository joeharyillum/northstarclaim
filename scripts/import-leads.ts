/**
 * Bulk Lead Import Script
 * 
 * Reads CSV files and inserts leads into the database.
 * Handles quoted fields, deduplicates by email, and reports stats.
 * 
 * Usage: npx tsx scripts/import-leads.ts [csv-file-path] [source-tag]
 * Example: npx tsx scripts/import-leads.ts medical_whales_5000.csv apollo-whales
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

async function importCsv(filePath: string, source: string) {
  const absolutePath = path.resolve(filePath);
  
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  console.log(`\n📂 Reading: ${absolutePath}`);
  const content = fs.readFileSync(absolutePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  
  if (lines.length < 2) {
    console.error('CSV file is empty or has no data rows.');
    process.exit(1);
  }

  const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase());
  console.log(`📋 Headers: ${headers.join(', ')}`);
  console.log(`📊 Data rows: ${lines.length - 1}`);

  // Map common header variations
  const findCol = (names: string[]) => {
    for (const n of names) {
      const idx = headers.indexOf(n.toLowerCase());
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const emailIdx = findCol(['email', 'e-mail', 'emailaddress']);
  const firstNameIdx = findCol(['firstname', 'first_name', 'first name', 'first']);
  const lastNameIdx = findCol(['lastname', 'last_name', 'last name', 'last']);
  const companyIdx = findCol(['company', 'companyname', 'company_name', 'company name', 'organization']);
  const titleIdx = findCol(['title', 'jobtitle', 'job_title', 'job title', 'position']);
  const cityIdx = findCol(['city']);
  const stateIdx = findCol(['state', 'st', 'region']);
  const phoneIdx = findCol(['phone', 'phonenumber', 'phone_number']);
  const industryIdx = findCol(['industry']);

  if (emailIdx === -1) {
    console.error('❌ No email column found in CSV.');
    process.exit(1);
  }

  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  const BATCH_SIZE = 500;
  const startTime = Date.now();

  // Process in batches using createMany for speed
  const allRows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const email = (values[emailIdx] || '').trim().toLowerCase();
    
    if (!email || !email.includes('@')) {
      skipped++;
      continue;
    }

    allRows.push({
      email,
      firstName: firstNameIdx !== -1 ? values[firstNameIdx] || '' : '',
      lastName: lastNameIdx !== -1 ? values[lastNameIdx] || '' : '',
      company: companyIdx !== -1 ? values[companyIdx] || '' : '',
      title: titleIdx !== -1 ? values[titleIdx] || '' : '',
      city: cityIdx !== -1 ? values[cityIdx] || '' : '',
      state: stateIdx !== -1 ? values[stateIdx] || '' : '',
      phone: phoneIdx !== -1 ? values[phoneIdx] || '' : '',
      industry: industryIdx !== -1 ? values[industryIdx] || 'Healthcare' : 'Healthcare',
      source,
      status: 'new',
    });
  }

  // Batch insert
  for (let b = 0; b < allRows.length; b += BATCH_SIZE) {
    const batch = allRows.slice(b, b + BATCH_SIZE);
    try {
      const result = await prisma.lead.createMany({
        data: batch,
        skipDuplicates: true,
      });
      inserted += result.count;
      skipped += batch.length - result.count;
    } catch (e: any) {
      console.error(`  Batch error at ${b}: ${e.message}`);
      errors += batch.length;
    }
    const pct = (((b + batch.length) / allRows.length) * 100).toFixed(0);
    console.log(`  ⏳ ${pct}% — ${inserted} inserted, ${skipped} skipped`);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n✅ Import complete in ${duration}s`);
  console.log(`   📥 Inserted: ${inserted}`);
  console.log(`   ⏭️  Skipped:  ${skipped}`);
  console.log(`   ❌ Errors:   ${errors}`);

  // Show totals
  const totalLeads = await prisma.lead.count();
  const bySource = await prisma.lead.groupBy({ by: ['source'], _count: true });

  console.log(`\n📊 Database totals: ${totalLeads} leads`);
  bySource.forEach(s => {
    console.log(`   ${s.source}: ${s._count}`);
  });
}

// CLI entry
const csvFile = process.argv[2] || 'medical_whales_5000.csv';
const sourceTag = process.argv[3] || 'csv-import';

importCsv(csvFile, sourceTag)
  .catch(e => { console.error('Import failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
