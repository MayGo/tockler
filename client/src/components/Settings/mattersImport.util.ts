import { MatterInput } from '../../@types/IMatter';

function parseCsvRows(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;

    const pushField = () => {
        row.push(field);
        field = '';
    };
    const pushRow = () => {
        pushField();
        rows.push(row);
        row = [];
    };

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (inQuotes) {
            if (char === '"') {
                if (text[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += char;
            }
            continue;
        }

        if (char === '"') {
            inQuotes = true;
        } else if (char === ',') {
            pushField();
        } else if (char === '\n') {
            pushRow();
        } else if (char === '\r') {
            // ignore; a following \n (if any) terminates the row
        } else {
            field += char;
        }
    }

    if (field.length > 0 || row.length > 0) {
        pushRow();
    }

    return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
}

const HEADER_ALIASES = {
    caseReference: ['casereference', 'casenumber', 'caseref', 'reference', 'ref'],
    clientName: ['clientname', 'client', 'name'],
    keywords: ['keywords', 'keyword', 'aliases', 'alias'],
} as const;

function normalizeHeader(cell: string): string {
    return cell.toLowerCase().replace(/[^a-z]/g, '');
}

function findColumn(headerRow: string[], aliases: readonly string[]): number {
    const normalized = headerRow.map(normalizeHeader);
    for (const alias of aliases) {
        const index = normalized.indexOf(alias);
        if (index !== -1) {
            return index;
        }
    }
    return -1;
}

export interface ParsedMattersResult {
    matters: MatterInput[];
    errors: string[];
}

// Parses a CSV export of matters. Expects a header row so column order doesn't matter;
// recognizes a few common header spellings rather than requiring an exact match.
export function parseMattersCsv(csvText: string): ParsedMattersResult {
    const rows = parseCsvRows(csvText.trim());

    if (rows.length === 0) {
        return { matters: [], errors: ['The file is empty.'] };
    }

    const [headerRow, ...dataRows] = rows;
    const caseRefIndex = findColumn(headerRow, HEADER_ALIASES.caseReference);
    const clientNameIndex = findColumn(headerRow, HEADER_ALIASES.clientName);
    const keywordsIndex = findColumn(headerRow, HEADER_ALIASES.keywords);

    if (caseRefIndex === -1 || clientNameIndex === -1) {
        return {
            matters: [],
            errors: [
                'Could not find "caseReference" and "clientName" columns in the first row. Expected a header row, e.g.: caseReference, clientName, keywords',
            ],
        };
    }

    const matters: MatterInput[] = [];
    const errors: string[] = [];

    dataRows.forEach((row, rowIndex) => {
        if (row.every((cell) => cell.trim() === '')) {
            return;
        }

        const caseReference = (row[caseRefIndex] || '').trim();
        const clientName = (row[clientNameIndex] || '').trim();
        const keywordsCell = keywordsIndex !== -1 ? row[keywordsIndex] || '' : '';
        const keywords = keywordsCell
            .split(',')
            .map((keyword) => keyword.trim())
            .filter(Boolean);

        if (!caseReference || !clientName) {
            errors.push(`Row ${rowIndex + 2}: missing case reference or client name.`);
            return;
        }

        matters.push({ caseReference, clientName, keywords });
    });

    return { matters, errors };
}
