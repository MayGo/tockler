import { Box, Button, List, ListItem, Text } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { AiOutlineUpload } from 'react-icons/ai';
import { createMatter } from '../../services/matter.api';
import { parseMattersCsv } from './mattersImport.util';

interface ImportSummary {
    imported: number;
    skipped: string[];
    errors: string[];
}

interface MattersImportProps {
    existingCaseReferences: string[];
    onImported: () => void;
}

export const MattersImport = ({ existingCaseReferences, onImported }: MattersImportProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [summary, setSummary] = useState<ImportSummary | null>(null);

    const importFile = async (file: File) => {
        setIsImporting(true);
        setSummary(null);

        try {
            const text = await file.text();
            const { matters: parsedMatters, errors } = parseMattersCsv(text);

            const existingRefs = new Set(existingCaseReferences.map((ref) => ref.toLowerCase()));
            const seenInFile = new Set<string>();
            const skipped: string[] = [];
            let imported = 0;

            for (const matter of parsedMatters) {
                const key = matter.caseReference.toLowerCase();
                if (existingRefs.has(key) || seenInFile.has(key)) {
                    skipped.push(matter.caseReference);
                    continue;
                }
                seenInFile.add(key);
                await createMatter(matter);
                imported += 1;
            }

            setSummary({ imported, skipped, errors });
            if (imported > 0) {
                onImported();
            }
        } catch (e) {
            setSummary({
                imported: 0,
                skipped: [],
                errors: [`Could not read file: ${e instanceof Error ? e.message : String(e)}`],
            });
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <Box
            borderWidth="1px"
            borderStyle="dashed"
            borderRadius="md"
            borderColor={isDragging ? 'blue.400' : 'gray.300'}
            bg={isDragging ? 'blue.50' : undefined}
            p={4}
            mb={4}
            textAlign="center"
            onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                const file = event.dataTransfer.files?.[0];
                if (file) {
                    importFile(file);
                }
            }}
        >
            <Text fontSize="sm" color="gray.500" mb={2}>
                Drag and drop a CSV file of matters here, or
            </Text>
            <Button
                size="sm"
                leftIcon={<AiOutlineUpload />}
                onClick={() => fileInputRef.current?.click()}
                isLoading={isImporting}
            >
                Choose CSV file
            </Button>
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                        importFile(file);
                    }
                    event.target.value = '';
                }}
            />
            <Text fontSize="xs" color="gray.500" mt={2}>
                Expected columns: caseReference, clientName, keywords (comma-separated within the cell)
            </Text>

            {summary && (
                <Box mt={3} textAlign="left" fontSize="sm">
                    {summary.imported > 0 && <Text color="green.600">{summary.imported} matter(s) imported.</Text>}
                    {summary.skipped.length > 0 && (
                        <Text color="orange.600">Already exist, skipped: {summary.skipped.join(', ')}</Text>
                    )}
                    {summary.errors.length > 0 && (
                        <List color="red.600">
                            {summary.errors.map((err) => (
                                <ListItem key={err}>{err}</ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            )}
        </Box>
    );
};
