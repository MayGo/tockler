import { useForm } from 'react-hook-form';
import { useContext, useEffect } from 'react';
import {
    FormErrorMessage,
    FormLabel,
    FormControl,
    Input,
    Divider,
    Box,
    Button,
    Text,
    Switch,
    FormHelperText,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CardBox } from '../CardBox';
import { WorkSettingsI } from './WorkForm.util';
import { RootContext } from '../../RootContext';
import { useDebouncedCallback } from 'use-debounce';
import { notifyUser } from '../../services/settings.api';

const schema = yup
    .object({
        hoursToWork: yup.string().required().label('Hours to work'),
        sessionLength: yup.number().required().positive().integer().label('Session Length'),
        notificationDuration: yup.number().required().positive().integer().label('Notification duration'),
        minBreakTime: yup.number().required().positive().integer().label('Min break time'),
        reNotifyInterval: yup.number().required().integer().label('Re-notify interval'),
        smallNotificationsEnabled: yup.boolean().label('Notifications'),
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

    const smallNotificationsEnabled = watch('smallNotificationsEnabled');
    const minBreakTime = watch('minBreakTime');

    return (
        <CardBox title="Work settings" divider w="50%">
            <FormControl isInvalid={!!errors.hoursToWork} pb={4}>
                <FormLabel htmlFor="hoursToWork">Workday length</FormLabel>
                <Input placeholder="Hour to work" {...register('hoursToWork')} />
                <FormErrorMessage>{errors.hoursToWork && errors.hoursToWork.message}</FormErrorMessage>
            </FormControl>
            <Box>
                <Divider />
            </Box>

            <Box pt={4} pb={2}>
                <Text fontSize="lg" as="b">
                    Break notify settings
                </Text>
            </Box>
            <Box pt={2} pb={4}>
                <Text fontSize="sm" as="i">
                    Used to show one session progress in tray graphic and to notify about a break. The idea of this
                    notification is for you not to lose focus, but to remind you to take a break if you are in between
                    some work.
                </Text>
            </Box>
            <FormControl isInvalid={!!errors.sessionLength} pb={4}>
                <FormLabel htmlFor="sessionLength">Session length in minutes</FormLabel>
                <Input placeholder="Session length" {...register('sessionLength')} />
                <FormErrorMessage>{errors.sessionLength && errors.sessionLength.message}</FormErrorMessage>
                {smallNotificationsEnabled && (
                    <FormHelperText>
                        You are notified if online time exceeds this. Ignoring idle times less than {minBreakTime}{' '}
                        minutes
                    </FormHelperText>
                )}
            </FormControl>
            <Box pb={4}>
                <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="active" mb="0">
                        Reminder notifications enabled
                    </FormLabel>
                    <Switch id="enabled" {...register('smallNotificationsEnabled')} size="lg" />
                </FormControl>
            </Box>
            <FormControl isInvalid={!!errors.reNotifyInterval} pb={4}>
                <FormLabel htmlFor="reNotifyInterval">Re-Notify interval minutes</FormLabel>
                <Input
                    placeholder="Re-Notify interval"
                    {...register('reNotifyInterval')}
                    disabled={!smallNotificationsEnabled}
                />
                <FormErrorMessage>{errors.reNotifyInterval && errors.reNotifyInterval.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.notificationDuration} pb={4}>
                <FormLabel htmlFor="notificationDuration">Notification duration in seconds</FormLabel>
                <Input
                    placeholder="Notification duration"
                    {...register('notificationDuration')}
                    disabled={!smallNotificationsEnabled}
                />
                <FormErrorMessage>
                    {errors.notificationDuration && errors.notificationDuration.message}
                </FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.minBreakTime}>
                <FormLabel htmlFor="minBreakTime">Min break time in minutes</FormLabel>
                <Input
                    placeholder="Min break time"
                    {...register('minBreakTime')}
                    disabled={!smallNotificationsEnabled}
                />
                <FormErrorMessage>{errors.minBreakTime && errors.minBreakTime.message}</FormErrorMessage>
            </FormControl>
            <Box pt={5}>
                <Button variant="outline" onClick={() => notifyUser(1999999)}>
                    Show me the minimal notification
                </Button>
            </Box>
        </CardBox>
    );
};
