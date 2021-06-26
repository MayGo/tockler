import { useForm } from 'react-hook-form';
import React, { useContext, useEffect } from 'react';
import { FormErrorMessage, FormLabel, FormControl, Input, FormHelperText } from '@chakra-ui/react';
import { RootContext } from '../../RootContext';
import { CardBox } from '../CardBox';

type Inputs = {
    hoursToWork: string;
};

export const WorkForm = () => {
    const { workSettings, setWorkSettings } = useContext(RootContext);
    const {
        watch,
        getValues,
        reset,
        formState: { errors, isDirty, isValid },
        register,
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

    React.useEffect(() => {
        register('hoursToWork', {
            validate: validateHoursToWork,
        });
    }, [register]);

    return (
        <CardBox title="Work settings" divider w="50%">
            <FormControl isInvalid={!!errors.hoursToWork}>
                <FormLabel htmlFor="hoursToWork">Workday length</FormLabel>
                <Input
                    placeholder="hoursToWork"
                    {...register('hoursToWork', { validate: validateHoursToWork })}
                />
                <FormErrorMessage>
                    {errors.hoursToWork && errors.hoursToWork.message}
                </FormErrorMessage>
                <FormHelperText>
                    Used in Progress pie chart to calculate workday progress
                </FormHelperText>
            </FormControl>
        </CardBox>
    );
};
