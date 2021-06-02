import { useForm } from 'react-hook-form';
import React, { useContext } from 'react';
import {
    Box,
    FormErrorMessage,
    FormLabel,
    FormControl,
    Input,
    Button,
    Text,
} from '@chakra-ui/react';
import { useFormState } from 'react-use-form-state';
import { RootContext } from '../../RootContext';

type Inputs = {
    hoursToWork: string;
};

export const WorkForm = () => {
    const { workSettings, setWorkSettings } = useContext(RootContext);
    const {
        handleSubmit,

        formState: { errors },
        register,
        formState,
    } = useForm<Inputs>({ mode: 'onChange', defaultValues: { hoursToWork: '' } });
    // tslint:disable-next-line: variable-name
    const [, { number }] = useFormState(workSettings, {
        onChange: (__ignore, ___ignore, nextStateValues) => {
            setWorkSettings(nextStateValues);
        },
    });

    function validateHoursToWork(value: string) {
        if (!value) {
            return 'Name is required';
        } else if (value !== 'Naruto') {
            return "Jeez! You're not a fan 😱";
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
        <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Text
                fontWeight="bold"
                textTransform="uppercase"
                fontSize="lg"
                letterSpacing="wide"
                color="teal.600"
            >
                Work settings
            </Text>
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
        </Box>
    );
};
