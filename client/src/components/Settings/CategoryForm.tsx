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
    useToast,
    VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ICategory } from '../../@types/ICategory';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { Card } from '../Card';
import { errorToast } from './categoryErrors';

const EMPTY_CATEGORY = { name: '', color: '#ffffff' };

export const CategoryForm = () => {
    const categories = useStoreState((state) => state.categories);
    const fetchCategories = useStoreActions((actions) => actions.fetchCategories);
    const createCategory = useStoreActions((actions) => actions.createCategory);
    const updateCategory = useStoreActions((actions) => actions.updateCategory);
    const deleteCategory = useStoreActions((actions) => actions.deleteCategory);
    const toast = useToast();

    const [newCategory, setNewCategory] = useState(EMPTY_CATEGORY);
    const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const showError = (title: string, error: unknown) => toast(errorToast(title, error));

    useEffect(() => {
        fetchCategories().catch((error) => toast(errorToast('Could not load categories', error)));
    }, [fetchCategories, toast]);

    const handleCreate = async () => {
        const name = newCategory.name.trim();
        if (!name) {
            return;
        }
        setIsCreating(true);
        try {
            await createCategory({ name, color: newCategory.color });
            setNewCategory(EMPTY_CATEGORY);
        } catch (error) {
            showError('Could not add category', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingCategory) {
            return;
        }
        try {
            await updateCategory({
                id: editingCategory.id,
                category: { name: editingCategory.name.trim(), color: editingCategory.color },
            });
            setEditingCategory(null);
        } catch (error) {
            showError('Could not save category', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteCategory(id);
        } catch (error) {
            showError('Could not delete category', error);
        }
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
                    alignItems="flex-end"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleCreate();
                    }}
                >
                    <FormControl>
                        <FormLabel>New Category Name</FormLabel>
                        <Input
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            placeholder="Category name"
                        />
                    </FormControl>
                    <FormControl width="auto">
                        <FormLabel>Color</FormLabel>
                        <Input
                            type="color"
                            width="64px"
                            p={1}
                            value={newCategory.color}
                            onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                        />
                    </FormControl>
                    <Button type="submit" flexShrink={0} isLoading={isCreating}>
                        Add Category
                    </Button>
                </HStack>
            </VStack>
        </Card>
    );
};
