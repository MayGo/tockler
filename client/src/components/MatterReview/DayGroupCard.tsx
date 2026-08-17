import { Badge, Box, Flex, HStack, Table, Tbody, Td, Text, Th, Thead, Tr, Tooltip } from '@chakra-ui/react';
import { IMatter } from '../../@types/IMatter';
import { MatterMatchType } from '../../enum/MatterMatchType';
import { formatDurationInternal } from '../../utils';
import { CardBox } from '../CardBox';
import { DayGroup, TitleGroup } from './matterReview.util';
import { MatterAssignSelect } from './MatterAssignSelect';

interface DayGroupCardProps {
    dayGroup: DayGroup;
    matters: IMatter[];
    onReassign: (trackItemIds: number[], matterId: number | null, title: string) => void;
}

const MatchBadge = ({ titleGroup }: { titleGroup: TitleGroup }) => {
    switch (titleGroup.matchType) {
        case MatterMatchType.Manual:
            return <Badge colorScheme="blue">Manually set</Badge>;
        case MatterMatchType.CaseReference:
            return <Badge colorScheme="green">Exact match</Badge>;
        case MatterMatchType.Hint:
            return (
                <Tooltip label={titleGroup.matchedText ? `Signal found: "${titleGroup.matchedText}"` : undefined}>
                    <Badge colorScheme="orange">Possible match — check</Badge>
                </Tooltip>
            );
        default:
            return null;
    }
};

export const DayGroupCard = ({ dayGroup, matters, onReassign }: DayGroupCardProps) => {
    return (
        <CardBox
            title={dayGroup.dayLabel}
            divider
            extra={
                <Text fontWeight="bold" pr={4}>
                    {formatDurationInternal(dayGroup.durationMs)}
                </Text>
            }
        >
            {dayGroup.matterGroups.map((matterGroup) => (
                <Box key={matterGroup.matterId ?? 'unmatched'} pb={4}>
                    <Flex alignItems="center" pb={2}>
                        <HStack>
                            {matterGroup.matterId === null && <Badge colorScheme="orange">Unmatched</Badge>}
                            <Text fontWeight="semibold">{matterGroup.matterLabel}</Text>
                        </HStack>
                        <Box flex={1} />
                        <Text fontWeight="semibold">{formatDurationInternal(matterGroup.durationMs)}</Text>
                    </Flex>

                    <Table size="sm">
                        <Thead>
                            <Tr>
                                <Th>App</Th>
                                <Th>Window title</Th>
                                <Th>Confidence</Th>
                                <Th isNumeric>Duration</Th>
                                <Th>Matter</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {matterGroup.titles.map((titleGroup) => (
                                <Tr key={titleGroup.key}>
                                    <Td>{titleGroup.app}</Td>
                                    <Td whiteSpace="normal" wordBreak="break-word">
                                        {titleGroup.title}
                                    </Td>
                                    <Td>
                                        <MatchBadge titleGroup={titleGroup} />
                                    </Td>
                                    <Td isNumeric whiteSpace="nowrap">
                                        {formatDurationInternal(titleGroup.durationMs)}
                                    </Td>
                                    <Td>
                                        <MatterAssignSelect
                                            matters={matters}
                                            matterId={matterGroup.matterId}
                                            onAssign={(newMatterId) =>
                                                onReassign(titleGroup.trackItemIds, newMatterId, titleGroup.title)
                                            }
                                        />
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            ))}
        </CardBox>
    );
};
