import { useForm } from 'react-hook-form';
import React, { useContext, useEffect } from 'react';
import { FormErrorMessage, FormLabel, FormControl, Input, Button, Text } from '@chakra-ui/react';
import { RootContext } from '../../RootContext';
import { Card } from '../Card';

type Inputs = {
    hoursToWork: string;
};

export const WorkForm = () => {
    const { workSettings, setWorkSettings } = useContext(RootContext);
    const {
        handleSubmit,
        watch,
        getValues,
        reset,
        formState: { errors, isDirty, isValid },
        register,
        formState,
    } = useForm<Inputs>({ mode: 'onChange', defaultValues: workSettings });

    const watchAllFields = watch();

    useEffect(() => {
        if (isDirty && isValid) {
            console.info('Save values,', getValues(), workSettings);
            setWorkSettings(getValues());
            reset(getValues());
        }
    }, [getValues, setWorkSettings, watchAllFields, isDirty, workSettings, reset, isValid]);

    function validateHoursToWork(value: string) {
        if (!value) {
            return 'Value is required';
        } else return true;
    }

    function onSubmit(values: any[]) {
        return new Promise(resolve => {
            setTimeout(() => {
                alert(JSON.stringify(values, null, 2));
                resolve(true);
            }, 3000);
        });
    }

    React.useEffect(() => {
        register('hoursToWork', {
            validate: validateHoursToWork,
        });
    }, [register]);

    return (
        <Card title="Work settings">
            <form onSubmit={handleSubmit(onSubmit)}>
                <FormControl isInvalid={!!errors.hoursToWork}>
                    <FormLabel htmlFor="hoursToWork">Workday length</FormLabel>
                    <Input
                        placeholder="hoursToWork"
                        {...register('hoursToWork', { validate: validateHoursToWork })}
                    />
                    <FormErrorMessage>
                        {errors.hoursToWork && errors.hoursToWork.message}
                    </FormErrorMessage>
                </FormControl>
                <Button mt={4} colorScheme="teal" isLoading={formState.isSubmitting} type="submit">
                    Submit
                </Button>
            </form>

            <Text fontSize="md"> Used in Progress pie chart to calculate workday progress</Text>
        </Card>
    );
};
