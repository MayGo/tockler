import { Select } from '@chakra-ui/react';
import { IMatter } from '../../@types/IMatter';

const UNMATCHED_VALUE = 'unmatched';

interface MatterAssignSelectProps {
    matters: IMatter[];
    matterId: number | null;
    onAssign: (matterId: number | null) => void;
}

export const MatterAssignSelect = ({ matters, matterId, onAssign }: MatterAssignSelectProps) => {
    const value = matterId ? String(matterId) : UNMATCHED_VALUE;

    return (
        <Select
            value={value}
            size="sm"
            w="260px"
            aria-label="Reassign matter"
            onChange={(e) => {
                const newValue = e.target.value;
                onAssign(newValue === UNMATCHED_VALUE ? null : Number(newValue));
            }}
        >
            <option value={UNMATCHED_VALUE}>Unmatched</option>
            {matters.map((matter) => (
                <option key={matter.id} value={matter.id}>
                    {matter.caseReference} — {matter.clientName}
                </option>
            ))}
        </Select>
    );
};
