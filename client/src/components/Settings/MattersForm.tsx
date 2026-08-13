import { Box, Button, Flex, HStack, Text, Tooltip } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { IMatter, MatterInput } from '../../@types/IMatter';
import { createMatter, deleteMatter, findAllMatters, rematchMatters, updateMatter } from '../../services/matter.api';
import { CardBox } from '../CardBox';
import { MattersFormItem } from './MattersFormItem';
import { MattersImport } from './MattersImport';

export interface MatterDraft {
    id?: number;
    caseReference: string;
    clientName: string;
    keywords: string; // comma-separated, for editing
    archived: boolean;
}

const emptyDraft: MatterDraft = { caseReference: '', clientName: '', keywords: '', archived: false };

function toMatterInput(draft: MatterDraft): MatterInput {
    return {
        caseReference: draft.caseReference,
        clientName: draft.clientName,
        keywords: draft.keywords
            .split(',')
            .map((keyword) => keyword.trim())
            .filter(Boolean),
        archived: draft.archived,
    };
}

function toDraft(matter: IMatter): MatterDraft {
    let keywords: string[] = [];
    try {
        keywords = JSON.parse(matter.keywords || '[]');
    } catch {
        keywords = [];
    }

    return {
        id: matter.id,
        caseReference: matter.caseReference,
        clientName: matter.clientName,
        keywords: keywords.join(', '),
        archived: matter.archived,
    };
}

export const MattersForm = () => {
    const [matterDrafts, setMatterDrafts] = useState<MatterDraft[]>([]);
    const [isRematching, setIsRematching] = useState(false);

    const refreshMatters = useCallback(async () => {
        const matters = await findAllMatters();
        setMatterDrafts(matters.map(toDraft));
    }, []);

    useEffect(() => {
        refreshMatters();
    }, [refreshMatters]);

    const addItem = () => {
        setMatterDrafts([...matterDrafts, { ...emptyDraft }]);
    };

    const removeItem = (index: number) => async () => {
        const draft = matterDrafts[index];
        if (draft.id) {
            await deleteMatter(draft.id);
        }
        setMatterDrafts((prev) => prev.filter((_, i) => i !== index));
    };

    const saveItem = (index: number) => async (draft: MatterDraft) => {
        const input = toMatterInput(draft);
        const existing = matterDrafts[index];

        const saved = existing.id ? await updateMatter(existing.id, input) : await createMatter(input);

        setMatterDrafts((prev) => prev.map((item, i) => (i === index ? toDraft(saved) : item)));
    };

    const runRematch = async () => {
        setIsRematching(true);
        try {
            await rematchMatters();
        } finally {
            setIsRematching(false);
        }
    };

    return (
        <CardBox
            title="Matters"
            divider
            extra={
                <HStack>
                    <Button onClick={runRematch} variant="ghost" isLoading={isRematching}>
                        Re-run matching
                    </Button>
                    <Tooltip
                        placement="left"
                        label="Case reference and keyword matches are used to tag captured activity with a matter. Case reference matches always win over keyword matches."
                    >
                        <span>
                            <AiOutlineInfoCircle style={{ fontSize: 20, color: 'primary' }} />
                        </span>
                    </Tooltip>
                </HStack>
            }
        >
            <Box my={2}>
                <Text fontSize="sm" color="gray.500">
                    Add each matter you want to track time against. Keywords are matched case-insensitively against
                    window titles and URLs — comma-separated, e.g. &quot;Smith v Jones, housing disrepair&quot;.
                </Text>
            </Box>

            <MattersImport
                existingCaseReferences={matterDrafts.map((draft) => draft.caseReference)}
                onImported={refreshMatters}
            />

            {matterDrafts.map((draft, index) => (
                <MattersFormItem
                    key={draft.id ?? `new-${index}`}
                    matterDraft={draft}
                    removeItem={removeItem(index)}
                    saveItem={saveItem(index)}
                />
            ))}

            <Flex py={3} justifyContent="flex-end">
                <Button onClick={addItem} aria-label="Add New Matter">
                    Add New Matter
                </Button>
            </Flex>
        </CardBox>
    );
};
