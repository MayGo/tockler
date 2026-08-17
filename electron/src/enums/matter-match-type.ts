export enum MatterMatchType {
    CaseReference = 'caseRef',
    Keyword = 'keyword',
    // Lower-confidence signal: a partial/fuzzy keyword or client-name overlap, or a
    // reference-shaped string was spotted but didn't match any known matter.
    Hint = 'hint',
    Manual = 'manual',
    None = 'none',
}
