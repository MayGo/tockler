import firebase from 'firebase';
import 'firebase/auth';
import '@firebase/performance';
import React, { useState } from 'react';
import * as yup from 'yup';
import { Input, Button, Center, Text, Box } from '@chakra-ui/react';
import { FormControl, FormErrorMessage } from '@chakra-ui/form-control';
import ReactGA from 'react-ga';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { setEmailToLocalStorage } from './Paywall/Paywall.utils';

const sendEmail = email => {
    const actionCodeSettings = {
        url: `https://tockler.io/logintoapp`,
        handleCodeInApp: true,
    };
    return firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings);
};

export const loginSchema = yup.object().shape({
    email: yup
        .string()
        .email()
        .label('Email')
        .required(),
});

type LoginFormInputs = {
    email: string;
};

const EmailForm = () => {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    return (
        <FormControl isInvalid={!!errors?.email} errortext={errors?.email?.message} isRequired w="100%">
            <Box pt={4} w="100%">
                <Input placeholder="Email" {...register('email')} />
                <FormErrorMessage>{errors?.email?.message}</FormErrorMessage>
            </Box>
            <Center p={4}>
                <Button type="submit" bg="brand.mainColor" disabled={!!errors.email}>
                    Send sign-in email
                </Button>
            </Center>
        </FormControl>
    );
};

const EmailSentForm = ({ onBackClick, onNextClick }) => {
    const { watch } = useFormContext();

    const email = watch('email');

    return (
        <>
            <Center pb={4}>
                <Text fontSize="x-large">Sign-in email sent</Text>
            </Center>
            <Text pb={4}>
                A sign-in email with additional instructions was sent to <b>{email}</b>. <br />
                Check your email to complete sign-in.
            </Text>
            <Box pb={4}>
                <Button color="brand.mainColor" variant="link" onClick={onNextClick}>
                    Trouble getting email?
                </Button>
            </Box>
            <Center>
                <Button bg="brand.mainColor" onClick={onBackClick}>
                    Back
                </Button>
            </Center>
        </>
    );
};

const LoginInfo: React.FC<any> = () => (
    <>
        <Box>Before we can redirect you to payment window, we need to get you signed in.</Box>
        <Box pt={3}>It is needed, so you can easily unsubscribe later and to check subscription status.</Box>
    </>
);

const RestoreInfo: React.FC<any> = () => (
    <>
        <Box>You need to login to restore subscription</Box>
    </>
);

const ReSendForm = ({ onBackClick }) => {
    return (
        <>
            <Text pb={3}>
                <b>Try these common fixes:</b>
            </Text>
            <Text pb={3} fontSize="sm">
                <ul>
                    <li>Check if the email was marked as spam or filtered. </li>
                    <li>Check your internet connection.</li>
                    <li>Check that you did not misspell your email. </li>
                    <li>Check that your inbox space is not running out or other inbox settings related issues.</li>
                </ul>
            </Text>
            <Text pb={3}>
                If the steps above didn't work, you can resend the email. Note that this will deactivate the link in the
                older email.
            </Text>

            <Box pb={2}>
                <Button type="submit" color="brand.mainColor" variant="link">
                    Resend email
                </Button>
            </Box>
            <Center>
                <Button bg="brand.mainColor" onClick={onBackClick}>
                    Back
                </Button>
            </Center>
        </>
    );
};

const STEP_SET_EMAIL = 'STEP_SET_EMAIL';
const STEP_EMAIL_SENT = 'STEP_EMAIL_SENT';
const STEP_RESEND_EMAIL = 'STEP_RESEND_EMAIL';

export const AuthButton = ({ isRestore }) => {
    const [step, setStep] = useState(STEP_SET_EMAIL);
    const methods = useForm<LoginFormInputs>({
        defaultValues: { email: '' },
        mode: 'onBlur',
        resolver: yupResolver(loginSchema),
    });
    const { handleSubmit } = methods;

    const onSubmitFn = async (values: LoginFormInputs) => {
        ReactGA.event({
            category: 'Paywall',
            action: `User pressed Login`,
        });

        try {
            await sendEmail(values.email);
            setEmailToLocalStorage(values.email);
            setStep(STEP_EMAIL_SENT);
        } catch (e) {
            console.error('Error sending email', e);
            alert(e?.message);
        }
    };

    return (
        <FormProvider {...methods}>
            <form id={'login-form'} onSubmit={handleSubmit(onSubmitFn)} style={{ width: '100%' }}>
                {step === STEP_SET_EMAIL && !isRestore && <LoginInfo />}
                {step === STEP_SET_EMAIL && isRestore && <RestoreInfo />}
                {step === STEP_SET_EMAIL && <EmailForm />}
                {step === STEP_EMAIL_SENT && (
                    <EmailSentForm
                        onBackClick={() => setStep(STEP_SET_EMAIL)}
                        onNextClick={() => setStep(STEP_RESEND_EMAIL)}
                    />
                )}
                {step === STEP_RESEND_EMAIL && <ReSendForm onBackClick={() => setStep(STEP_EMAIL_SENT)} />}
            </form>
        </FormProvider>
    );
};
