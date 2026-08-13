import { describe, expect, it } from 'vitest';
import { parseMattersCsv } from './mattersImport.util';

describe('parseMattersCsv', () => {
    it('parses a well-formed CSV with a standard header', () => {
        const csv = [
            'caseReference,clientName,keywords',
            'PA-63550-2025,Smith,"Smith v Jones, housing disrepair"',
            'PA-11111-2024,Jones,legal aid app',
        ].join('\n');

        const result = parseMattersCsv(csv);

        expect(result.errors).toEqual([]);
        expect(result.matters).toEqual([
            { caseReference: 'PA-63550-2025', clientName: 'Smith', keywords: ['Smith v Jones', 'housing disrepair'] },
            { caseReference: 'PA-11111-2024', clientName: 'Jones', keywords: ['legal aid app'] },
        ]);
    });

    it('recognizes common header aliases in any column order', () => {
        const csv = ['Client, Case Number, Keywords', 'Smith, PA-63550-2025, foo;bar'].join('\n');

        const result = parseMattersCsv(csv);

        expect(result.errors).toEqual([]);
        expect(result.matters).toEqual([{ caseReference: 'PA-63550-2025', clientName: 'Smith', keywords: ['foo;bar'] }]);
    });

    it('works without a keywords column', () => {
        const csv = ['caseReference,clientName', 'PA-63550-2025,Smith'].join('\n');

        const result = parseMattersCsv(csv);

        expect(result.errors).toEqual([]);
        expect(result.matters).toEqual([{ caseReference: 'PA-63550-2025', clientName: 'Smith', keywords: [] }]);
    });

    it('reports an error when required headers are missing', () => {
        const csv = ['foo,bar', '1,2'].join('\n');

        const result = parseMattersCsv(csv);

        expect(result.matters).toEqual([]);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toMatch(/caseReference.*clientName/);
    });

    it('reports an error for the empty file', () => {
        expect(parseMattersCsv('')).toEqual({ matters: [], errors: ['The file is empty.'] });
    });

    it('flags rows missing required fields but keeps processing the rest', () => {
        const csv = [
            'caseReference,clientName,keywords',
            ',Smith,foo',
            'PA-63550-2025,,foo',
            'PA-11111-2024,Jones,bar',
        ].join('\n');

        const result = parseMattersCsv(csv);

        expect(result.matters).toEqual([{ caseReference: 'PA-11111-2024', clientName: 'Jones', keywords: ['bar'] }]);
        expect(result.errors).toEqual(['Row 2: missing case reference or client name.', 'Row 3: missing case reference or client name.']);
    });

    it('skips fully blank lines', () => {
        const csv = ['caseReference,clientName,keywords', '', 'PA-63550-2025,Smith,foo', ''].join('\n');

        const result = parseMattersCsv(csv);

        expect(result.matters).toEqual([{ caseReference: 'PA-63550-2025', clientName: 'Smith', keywords: ['foo'] }]);
    });
});
