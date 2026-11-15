import {
    Box,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { Card } from '../Card';
import { filterApps } from './AppCategoryForm.utils';
import { errorToast } from './categoryErrors';

export const AppCategoryForm = () => {
    const appSettings = useStoreState((state) => state.appSettings);
    const categories = useStoreState((state) => state.categories);
    const fetchAppSettings = useStoreActions((actions) => actions.fetchAppSettings);
    const setCategoryForApp = useStoreActions((actions) => actions.setCategoryForApp);
    const toast = useToast();
    const [query, setQuery] = useState('');
    const { visible, total } = useMemo(() => filterApps(appSettings, query), [appSettings, query]);

    const showError = (title: string, error: unknown) => toast(errorToast(title, error));

    // CategoryForm, rendered next to this one, loads the categories.
    useEffect(() => {
        fetchAppSettings().catch((error) => toast(errorToast('Could not load apps', error)));
    }, [fetchAppSettings, toast]);

    const handleCategoryChange = async (appName: string, categoryId: string) => {
        try {
            await setCategoryForApp({ appName, categoryId: categoryId ? parseInt(categoryId, 10) : null });
        } catch (error) {
            showError(`Could not set category for ${appName}`, error);
        }
    };

    return (
        <Card title="App Categories" extra={null}>
            <VStack spacing={4} align="stretch">
                <InputGroup size="sm" maxW="320px">
                    <InputLeftElement pointerEvents="none">
                        <AiOutlineSearch />
                    </InputLeftElement>
                    <Input
                        placeholder="Filter apps"
                        aria-label="Filter apps"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </InputGroup>
                <Box maxH="480px" overflowY="auto">
                    <Table variant="simple" size="sm">
                        <Thead position="sticky" top={0} zIndex={1} bg="inherit">
                            <Tr>
                                <Th>Application</Th>
                                <Th>Category</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {visible.map((app) => (
                                <Tr key={app.id}>
                                    <Td>{app.name}</Td>
                                    <Td>
                                        <Select
                                            value={app.categoryId || ''}
                                            onChange={(e) => handleCategoryChange(app.name, e.target.value)}
                                            size="sm"
                                        >
                                            <option value="">No category</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
                <Text fontSize="sm" color="gray.500">
                    {total === 0
                        ? 'No apps match.'
                        : visible.length < total
                          ? `Showing ${visible.length} of ${total} apps. Filter to find others.`
                          : `${total} apps`}
                </Text>
            </VStack>
        </Card>
    );
};
