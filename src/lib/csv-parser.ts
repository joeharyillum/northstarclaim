// Native lightweight CSV parser - Zero Dependency Grid Optimization
export interface RawLead {
    [key: string]: string;
}

export function parseLeads(csvContent: string): RawLead[] {
    try {
        const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const results: RawLead[] = [];

        for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            if (currentLine.length === headers.length) {
                const row: RawLead = {};
                headers.forEach((header, index) => {
                    row[header] = currentLine[index];
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
