import {
    Button,
    FormControl,
    FormLabel,
    HStack,
    Input,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ICategory, NewCategory } from '../../@types/ICategory';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { Card } from '../Card';

export const CategoryForm = () => {
    const { categories, isSettingsLoading } = useStoreState((state) => state);
    const { fetchCategories, createCategory, updateCategory, deleteCategory } = useStoreActions((actions) => actions);

    const [newCategory, setNewCategory] = useState<Partial<NewCategory>>({ name: '', color: '#ffffff' });
    const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleCreate = () => {
        if (newCategory.name) {
            createCategory(newCategory as NewCategory);
            setNewCategory({ name: '', color: '#ffffff' });
        }
    };

    const handleUpdate = () => {
        if (editingCategory) {
            updateCategory({
                id: editingCategory.id,
                category: { name: editingCategory.name, color: editingCategory.color },
            });
            setEditingCategory(null);
        }
    };

    const handleDelete = (id: number) => {
        deleteCategory(id);
    };

    return (
        <Card title="Categories" extra={null}>
            <VStack spacing={4} align="stretch">
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Name</Th>
                            <Th>Color</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {categories.map((cat) => (
                            <Tr key={cat.id}>
                                <Td>
                                    {editingCategory?.id === cat.id ? (
                                        <Input
                                            value={editingCategory.name}
                                            onChange={(e) =>
                                                setEditingCategory({ ...editingCategory, name: e.target.value })
                                            }
                                        />
                                    ) : (
                                        cat.name
                                    )}
                                </Td>
                                <Td>
                                    {editingCategory?.id === cat.id ? (
                                        <Input
                                            type="color"
                                            value={editingCategory.color || ''}
                                            onChange={(e) =>
                                                setEditingCategory({ ...editingCategory, color: e.target.value })
                                            }
                                        />
                                    ) : (
                                        <div
                                            style={{ width: '20px', height: '20px', backgroundColor: cat.color || '' }}
                                        />
                                    )}
                                </Td>
                                <Td>
                                    {editingCategory?.id === cat.id ? (
                                        <HStack>
                                            <Button size="sm" onClick={handleUpdate}>
                                                Save
                                            </Button>
                                            <Button size="sm" onClick={() => setEditingCategory(null)}>
                                                Cancel
                                            </Button>
                                        </HStack>
                                    ) : (
                                        <HStack>
                                            <Button size="sm" onClick={() => setEditingCategory(cat)}>
                                                Edit
                                            </Button>
                                            <Button size="sm" colorScheme="red" onClick={() => handleDelete(cat.id)}>
                                                Delete
                                            </Button>
                                        </HStack>
                                    )}
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>

                <HStack
                    as="form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleCreate();
                    }}
                >
                    <FormControl>
                        <FormLabel>New Category Name</FormLabel>
                        <Input
                            value={newCategory.name || ''}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            placeholder="Category name"
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Color</FormLabel>
                        <Input
                            type="color"
                            value={newCategory.color || ''}
                            onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                        />
                    </FormControl>
                    <Button type="submit" mt={8} isLoading={isSettingsLoading}>
                        Add Category
                    </Button>
                </HStack>
            </VStack>
        </Card>
    );
};
