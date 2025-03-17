import { describe, expect, it } from 'vitest';
import type { ITrackItem } from '../../@types/ITrackItem';
import type { AnalyserItem, AnalyserTestItemI } from './AnalyserForm.util';
import { findFirst, testAnalyserItem } from './AnalyserForm.util';

describe('findFirst', () => {
    it('should return undefined when findRe is empty', () => {
        expect(findFirst('test string', '')).toBeUndefined();
    });

    it('should return the first match when pattern is found', () => {
        expect(findFirst('JIRA-123 Some task', '\\w+-\\d+')).toBe('JIRA-123');
    });

    it('should return undefined when pattern is not found', () => {
        expect(findFirst('No match here', '\\d{3}')).toBeUndefined();
    });

    it('should handle special characters in regex', () => {
        expect(findFirst('(test) [group]', '\\(.*?\\)')).toBe('(test)');
    });

    it('should handle invalid regex patterns gracefully', () => {
        // Unterminated group
        expect(findFirst('test string', '(abc')).toBeUndefined();
        // Unmatched closing parenthesis
        expect(findFirst('test string', 'abc)')).toBeUndefined();
        // Invalid character class
        expect(findFirst('test string', '[abc')).toBeUndefined();
        // Invalid quantifier
        expect(findFirst('test string', 'abc{2,1}')).toBeUndefined();
    });
});

describe('testAnalyserItem', () => {
    const mockAnalyserSetting: AnalyserItem = {
        findRe: '\\w+-\\d+',
        takeTitle: 'Task:\\s*(.*)',
        takeGroup: '\\w+-\\d+',
        enabled: true,
    };

    it('should return empty array when appItems is null or undefined', () => {
        expect(testAnalyserItem(undefined!, mockAnalyserSetting)).toEqual([]);
    });

    it('should handle invalid regex patterns in analyser settings', () => {
        const invalidPatterns: AnalyserItem[] = [
            {
                // Unterminated group
                findRe: '(abc',
                takeTitle: 'Task:\\s*(.*)',
                takeGroup: '\\w+-\\d+',
                enabled: true,
            },
            {
                // Valid findRe but invalid takeTitle
                findRe: '\\w+-\\d+',
                takeTitle: '(Task:.*',
                takeGroup: '\\w+-\\d+',
                enabled: true,
            },
            {
                // Valid findRe but invalid takeGroup
                findRe: '\\w+-\\d+',
                takeTitle: 'Task:\\s*(.*)',
                takeGroup: '[group',
                enabled: true,
            },
        ];

        const mockAppItems: ITrackItem[] = [
            {
                id: 1,
                title: 'JIRA-123 Task: Fix bug',
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
        ];
        const firstPattern = invalidPatterns[0];
        const result = testAnalyserItem(mockAppItems, firstPattern);
        expect(result).toEqual([]);

        const secondPattern = invalidPatterns[1];
        const result2 = testAnalyserItem(mockAppItems, secondPattern);
        expect(result2).toEqual([
            {
                findRe: 'JIRA-123',
                takeGroup: 'JIRA-123',
                takeTitle: 'JIRA-123 Task: Fix bug',
                title: 'JIRA-123 Task: Fix bug',
            },
        ]);

        const thirdPattern = invalidPatterns[2];
        const result3 = testAnalyserItem(mockAppItems, thirdPattern);
        expect(result3).toEqual([
            {
                findRe: 'JIRA-123',
                takeGroup: 'JIRA-123',
                takeTitle: 'Task: Fix bug',
                title: 'JIRA-123 Task: Fix bug',
            },
        ]);
    });

    it('should process app items and return matching test items', () => {
        const mockAppItems: ITrackItem[] = [
            {
                id: 1,
                title: 'JIRA-123 Task: Fix bug',
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
            {
                id: 2,
                title: 'JIRA-456 Task: Add feature',
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
            {
                id: 3,
                title: 'No match here',
                app: 'Other',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
        ];

        const expected: AnalyserTestItemI[] = [
            {
                title: 'JIRA-123 Task: Fix bug',
                findRe: 'JIRA-123',
                takeGroup: 'JIRA-123',
                takeTitle: 'Task: Fix bug',
            },
            {
                title: 'JIRA-456 Task: Add feature',
                findRe: 'JIRA-456',
                takeGroup: 'JIRA-456',
                takeTitle: 'Task: Add feature',
            },
        ];

        const result = testAnalyserItem(mockAppItems, mockAnalyserSetting);
        expect(result).toEqual(expected);
    });

    it('should remove duplicate items based on title', () => {
        const mockAppItems: ITrackItem[] = [
            {
                id: 1,
                title: 'JIRA-123 Task: Fix bug',
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
            {
                id: 2,
                title: 'JIRA-123 Task: Fix bug',
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
            {
                id: 3,
                title: 'JIRA-456 Task: Add feature',
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
        ];

        const result = testAnalyserItem(mockAppItems, mockAnalyserSetting);
        expect(result.length).toBe(2); // Should only have 2 unique items
        expect(result.filter((item) => item.findRe === 'JIRA-123')).toHaveLength(1);
    });

    it('should handle empty or invalid regex patterns', () => {
        const invalidAnalyserSetting: AnalyserItem = {
            findRe: '',
            takeTitle: '',
            takeGroup: '',
            enabled: true,
        };

        const mockAppItems: ITrackItem[] = [
            {
                id: 1,
                title: 'JIRA-123 Task: Fix bug',
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
        ];

        const result = testAnalyserItem(mockAppItems, invalidAnalyserSetting);
        expect(result).toEqual([]);
    });

    it('should handle missing title in app items', () => {
        const mockAppItems: ITrackItem[] = [
            {
                id: 1,
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
            {
                id: 2,
                title: '',
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
            {
                id: 3,
                title: 'JIRA-123 Task: Fix bug',
                app: 'JIRA',
                beginDate: Date.now(),
                endDate: Date.now(),
            },
        ];

        const result = testAnalyserItem(mockAppItems, mockAnalyserSetting);
        expect(result.length).toBe(1);
        expect(result[0].title).toBe('JIRA-123 Task: Fix bug');
    });
});
