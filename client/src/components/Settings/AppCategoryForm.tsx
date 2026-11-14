import { Select, Table, Tbody, Td, Th, Thead, Tr, useToast, VStack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { Card } from '../Card';
import { errorToast } from './categoryErrors';

export const AppCategoryForm = () => {
    const appSettings = useStoreState((state) => state.appSettings);
    const categories = useStoreState((state) => state.categories);
    const fetchAppSettings = useStoreActions((actions) => actions.fetchAppSettings);
    const setCategoryForApp = useStoreActions((actions) => actions.setCategoryForApp);
    const toast = useToast();

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
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Application</Th>
                            <Th>Category</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {appSettings.map((app) => (
                            <Tr key={app.id}>
                                <Td>{app.name}</Td>
                                <Td>
                                    <Select
                                        value={app.categoryId || ''}
                                        onChange={(e) => handleCategoryChange(app.name, e.target.value)}
                                        placeholder="Select category"
                                    >
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
            </VStack>
        </Card>
    );
};
