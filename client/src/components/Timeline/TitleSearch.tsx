import { IconButton, Input, InputGroup, InputLeftElement, InputRightElement } from '@chakra-ui/react';
import { ChangeEvent, memo, useState } from 'react';
import { AiOutlineClose, AiOutlineSearch } from 'react-icons/ai';
import { useDebouncedCallback } from 'use-debounce';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { normalizeKeyword } from './titleSearch.utils';

export const TitleSearch = memo(() => {
    const titleSearch = useStoreState((state) => state.titleSearch);
    const setTitleSearch = useStoreActions((actions) => actions.setTitleSearch);
    const [value, setValue] = useState(titleSearch);
    const [syncedTitleSearch, setSyncedTitleSearch] = useState(titleSearch);

    // Follow changes made elsewhere (e.g. "Show all" under the table). Our own debounced updates already match.
    if (titleSearch !== syncedTitleSearch) {
        setSyncedTitleSearch(titleSearch);
        if (normalizeKeyword(titleSearch) !== normalizeKeyword(value)) {
            setValue(titleSearch);
        }
    }

    const setTitleSearchDebounced = useDebouncedCallback(setTitleSearch, 250);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
        setTitleSearchDebounced(event.target.value);
    };

    const clear = () => {
        setValue('');
        setTitleSearchDebounced.cancel();
        setTitleSearch('');
    };

    return (
        <InputGroup maxWidth="280px">
            <InputLeftElement pointerEvents="none">
                <AiOutlineSearch />
            </InputLeftElement>
            <Input
                placeholder="Highlight by title"
                value={value}
                onChange={handleChange}
                onKeyDown={(event) => event.key === 'Escape' && clear()}
            />
            {value && (
                <InputRightElement>
                    <IconButton
                        aria-label="Clear title search"
                        icon={<AiOutlineClose />}
                        size="xs"
                        variant="ghost"
                        onClick={clear}
                    />
                </InputRightElement>
            )}
        </InputGroup>
    );
});
