import {
    Box,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    HStack,
    IconButton,
    Input,
    Switch,
} from '@chakra-ui/react';
import { useEffect, useId } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AiOutlineDelete } from 'react-icons/ai';
import { MatterDraft } from './MattersForm';

type Inputs = {
    caseReference: string;
    clientName: string;
    keywords: string;
    archived: boolean;
};

interface MattersFormItemProps {
    matterDraft: MatterDraft;
    removeItem: () => void;
    saveItem: (data: Inputs) => void;
}

export const MattersFormItem = ({ matterDraft, removeItem, saveItem }: MattersFormItemProps) => {
    const id = useId();
    const archivedSwitchId = `archived-switch-${id}`;

    const {
        watch,
        getValues,
        reset,
        register,
        control,
        formState: { isDirty, isValid, errors },
    } = useForm<Inputs>({
        mode: 'onChange',
        defaultValues: matterDraft,
        reValidateMode: 'onChange',
    });

    const watchAllFields = watch();

    useEffect(() => {
        if (isDirty && isValid) {
            saveItem(getValues());
            reset(getValues());
        }
    }, [getValues, saveItem, watchAllFields, isDirty, isValid, reset]);

    return (
        <Flex justifyContent="space-between" py={2}>
            <HStack w="100%" spacing={3} alignItems="flex-start">
                <FormControl isInvalid={!!errors.caseReference}>
                    <Input
                        placeholder="Case reference (e.g. PA-63550-2025)"
                        {...register('caseReference', { required: 'Case reference is required' })}
                        minWidth={220}
                    />
                    <FormErrorMessage>{errors.caseReference && errors.caseReference.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.clientName}>
                    <Input
                        placeholder="Client name"
                        {...register('clientName', { required: 'Client name is required' })}
                        minWidth={200}
                    />
                    <FormErrorMessage>{errors.clientName && errors.clientName.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.keywords}>
                    <Input placeholder="Keywords (comma-separated)" {...register('keywords')} minWidth={260} />
                    <FormErrorMessage>{errors.keywords && errors.keywords.message}</FormErrorMessage>
                </FormControl>

                <Box px={3}>
                    <FormControl display="flex" alignItems="center" minWidth={120} maxWidth={120}>
                        <FormLabel htmlFor={archivedSwitchId} mb="0">
                            Archived
                        </FormLabel>
                        <Controller
                            name="archived"
                            control={control}
                            render={({ field: { onChange, value, ref } }) => (
                                <Switch
                                    id={archivedSwitchId}
                                    isChecked={value}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onChange(e.target.checked);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    ref={ref}
                                    size="lg"
                                />
                            )}
                        />
                    </FormControl>
                </Box>

                <IconButton
                    icon={<AiOutlineDelete />}
                    variant="ghost"
                    onClick={(e) => {
                        e.preventDefault();
                        removeItem();
                    }}
                    aria-label="Delete matter"
                />
            </HStack>
        </Flex>
    );
};
