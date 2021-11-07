import { useForm } from 'react-hook-form';
import React, { useContext, useEffect } from 'react';
import { FormErrorMessage, FormLabel, FormControl, Input, FormHelperText } from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CardBox } from '../CardBox';

import { WorkSettingsI } from './WorkForm.util';
import { RootContext } from '../../RootContext';
import { useDebouncedCallback } from 'use-debounce/lib';

const schema = yup
    .object({
        hoursToWork: yup.string().required().label('Hours to work'),
        sessionLength: yup.number().required().positive().integer().label('Session Length'),
    })
    .required();

export const WorkForm = () => {
    const { workSettings, updateWorkSettings } = useContext(RootContext);

    const {
        watch,

        reset,
        formState: { errors, isDirty, isValid },
        register,
    } = useForm<WorkSettingsI>({ mode: 'onChange', defaultValues: workSettings, resolver: yupResolver(schema) });

    const watchAllFields = watch();

    const debouncedUpdate = useDebouncedCallback(
        (value) => {
            console.info('Save values: ', value);
            updateWorkSettings(value);
        },
        1000,
        { leading: false, trailing: true },
    );

    useEffect(() => {
        if (isDirty && isValid) {
            const formValues = watchAllFields;
            debouncedUpdate(formValues);
            reset(formValues);
        } else if (isDirty) {
            debouncedUpdate.cancel();
        }
    }, [watchAllFields, isDirty, isValid, debouncedUpdate, reset]);

    return (
        <CardBox title="Work settings" divider w="50%">
            <FormControl isInvalid={!!errors.hoursToWork}>
                <FormLabel htmlFor="hoursToWork">Workday length</FormLabel>
                <Input placeholder="Hour to work" {...register('hoursToWork')} />
                <FormErrorMessage>{errors.hoursToWork && errors.hoursToWork.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.sessionLength}>
                <FormLabel htmlFor="sessionLength">Session length in minutes</FormLabel>
                <Input placeholder="Session length in minutes" {...register('sessionLength')} />
                <FormErrorMessage>{errors.sessionLength && errors.sessionLength.message}</FormErrorMessage>
                <FormHelperText>
                    Used to show one session progress in tray graphic and to notify about break
                </FormHelperText>
            </FormControl>
        </CardBox>
    );
};
