import React from 'react';
import { Box, Flex } from 'reflexbox';
import { Button, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useFieldArray, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { ListItem } from '../../services/lists.api';

type FormValues = {
    items: Partial<ListItem>[];
};

type Props = {
    initialList: Partial<ListItem>[];
    onSave?: (itemsToSave: Partial<ListItem>[]) => Promise<Partial<ListItem>[]>;
    onDeleteOne?: (itemId: number) => Promise<void>;
};

const ListFormUI = (props: Props) => {
    const { register, control, handleSubmit, formState, reset } = useForm<FormValues>({
        defaultValues: {
            items: props.initialList.concat([{}]),
        },
    });
    const { fields: items, append, remove } = useFieldArray({
        control,
        name: 'items',
        keyName: 'key',
    });

    const onSubmit = async (values: FormValues) => {
        const itemsToUpsert = values.items.filter(item => {
            let madeChanges = false;
            for (const el of Object.keys(item)) {
                if (item[el]?.toString() !== '') madeChanges = true;
            }
            return madeChanges;
        });

        const updatedItems =
            itemsToUpsert.length > 0 ? (await props.onSave?.(itemsToUpsert)) ?? [] : itemsToUpsert;
        reset({
            items: updatedItems.concat([{}]),
        });
    };

    const handleDelete = async (item: Partial<ListItem>, index: number) => {
        if (item.id) await props.onDeleteOne?.(item.id);
        remove(index);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {items.map((item, index) => (
                <Flex key={index} alignItems="center">
                    <Box p={1} style={{ width: 64, textAlign: 'right' }}>
                        {index === 0 ? <strong>WHERE</strong> : <strong>OR</strong>}
                    </Box>
                    <Box p={1}>
                        <Input
                            {...register(`items.${index}.app`)}
                            defaultValue={item.app ?? ''}
                            placeholder="App name"
                        />
                    </Box>
                    <Box p={1}>
                        <strong>AND</strong>
                    </Box>
                    <Box p={1}>
                        <Input
                            {...register(`items.${index}.title`)}
                            defaultValue={item.title ?? ''}
                            placeholder="Window title"
                        />
                    </Box>
                    <Box p={1}>
                        <strong>AND</strong>
                    </Box>
                    <Box p={1}>
                        <Input
                            {...register(`items.${index}.url`)}
                            defaultValue={item.url ?? ''}
                            placeholder="URL"
                        />
                    </Box>
                    <Box p={1}>
                        {item.id ? (
                            <Tooltip title="Remove condition">
                                <Button
                                    type="text"
                                    icon={<CloseOutlined />}
                                    onClick={() => handleDelete(item, index)}
                                />
                            </Tooltip>
                        ) : (
                            <i>Unsaved</i>
                        )}
                    </Box>
                </Flex>
            ))}
            <Flex style={{ marginLeft: 64 }}>
                <Box p={1}>
                    <Button type="dashed" onClick={() => append({})}>
                        Add condition
                    </Button>
                </Box>
            </Flex>
            <Flex alignItems="center" style={{ marginTop: 8 }}>
                <Box p={1}>
                    <Button type="primary" htmlType="submit" disabled={!formState.isDirty}>
                        Save
                    </Button>
                </Box>
                <Box p={1}>
                    <i>
                        {formState.isSubmitting ? 'Saving...' : null}
                        {!formState.isDirty && formState.isSubmitSuccessful ? 'Saved' : null}
                    </i>
                </Box>
            </Flex>
        </form>
    );
};

const Input = styled.input`
    padding: 4px 11px;
    border: 1px solid #d9d9d9;
    border-radius: 2px;

    ::placeholder {
        color: lightgrey;
        opacity: 1;
    }

    &:focus {
        outline: none;
        border-color: #46a8f2;
        border-right-width: 1px !important;
        box-shadow: 0 0 0 2px rgb(30 136 229 / 20%);
    }
`;

export default ListFormUI;
