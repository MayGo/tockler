import { Box, Button, CloseButton, Flex, Input, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { IMatter } from '../../@types/IMatter';
import { updateMatter } from '../../services/matter.api';

interface AddKeywordToastProps {
    matter: IMatter;
    suggestedKeyword: string;
    onClose: () => void;
}

function parseKeywords(matter: IMatter): string[] {
    try {
        return JSON.parse(matter.keywords || '[]');
    } catch {
        return [];
    }
}

// Shown right after a manual reassignment in the Matters review screen, so corrections
// you're already making feed straight back into future matching accuracy.
export const AddKeywordToast = ({ matter, suggestedKeyword, onClose }: AddKeywordToastProps) => {
    const [keyword, setKeyword] = useState(suggestedKeyword);
    const [isSaving, setIsSaving] = useState(false);

    const addKeyword = async () => {
        const trimmed = keyword.trim();
        if (!trimmed) {
            onClose();
            return;
        }

        setIsSaving(true);
        const existingKeywords = parseKeywords(matter);
        const keywords = existingKeywords.includes(trimmed) ? existingKeywords : [...existingKeywords, trimmed];

        await updateMatter(matter.id, {
            caseReference: matter.caseReference,
            clientName: matter.clientName,
            keywords,
            archived: matter.archived,
        });

        setIsSaving(false);
        onClose();
    };

    return (
        <Box bg="gray.700" color="white" p={3} borderRadius="md" boxShadow="lg" maxW="380px">
            <Flex justifyContent="space-between" alignItems="flex-start">
                <Text fontSize="sm" fontWeight="bold" pb={2}>
                    Add as a keyword for {matter.caseReference} — {matter.clientName}?
                </Text>
                <CloseButton size="sm" onClick={onClose} aria-label="Dismiss" />
            </Flex>
            <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} size="sm" bg="white" color="black" mb={2} />
            <Flex justifyContent="flex-end">
                <Button size="sm" colorScheme="blue" onClick={addKeyword} isLoading={isSaving}>
                    Add keyword
                </Button>
            </Flex>
        </Box>
    );
};
