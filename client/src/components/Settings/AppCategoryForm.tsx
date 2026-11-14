import { Select, Table, Tbody, Td, Th, Thead, Tr, VStack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { Card } from '../Card';

export const AppCategoryForm = () => {
    const { appSettings, categories } = useStoreState((state) => state);
    const { fetchAppSettings, fetchCategories, setCategoryForApp } = useStoreActions((actions) => actions);

    useEffect(() => {
        fetchAppSettings();
        fetchCategories();
    }, [fetchAppSettings, fetchCategories]);

    const handleCategoryChange = (appName: string, categoryId: string) => {
        const catId = categoryId ? parseInt(categoryId, 10) : null;
        setCategoryForApp({ appName, categoryId: catId });
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
