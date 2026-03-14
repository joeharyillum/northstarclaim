// Native lightweight CSV parser - Zero Dependency Grid Optimization
export interface RawLead {
    [key: string]: string;
}

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

export function parseLeads(csvContent: string): RawLead[] {
    try {
        const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) return [];

        const headers = parseCsvLine(lines[0]);
        const results: RawLead[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCsvLine(lines[i]);
            if (values.length === headers.length) {
                const row: RawLead = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                results.push(row);
            }
        }
        return results;
    } catch (error) {
        console.error('Error parsing CSV:', error);
        return [];
    }
}

export function generateLeadId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
