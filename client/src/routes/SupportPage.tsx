import { useState } from 'react';
import { Button } from '@chakra-ui/react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { Textarea } from '@chakra-ui/react';
import { Input } from '@chakra-ui/react';
import { CardBox } from '../components/CardBox';
import { VStack } from '@chakra-ui/react';

const TEMPLATE_ID = import.meta.env.VITE_TEMPLATE_ID || '';
const SERVICE_ID = import.meta.env.VITE_SERVICE_ID || '';
const USER_ID = import.meta.env.VITE_USER_ID || '';

const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send';

const Paragraph = (props) => (
    <Box py={2}>
        <Text fontSize="lg" {...props} />
    </Box>
);

const sendEmail = (templateParams) => {
    var data = {
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: USER_ID,
        template_params: { ...templateParams },
    };

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    };
    return fetch(EMAILJS_API, requestOptions);
};

const errToString = (err) => (err.text ? err.text : err.toString());

export function SupportPage() {
    const [content, setContent] = useState('');
    const [contentError, setContentError] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [email, setEmail] = useState('');

    const changeContent = (e) => {
        const { value } = e.target;
        setContent(value);
    };

    const changeEmail = (e) => {
        const { value } = e.target;
        setEmail(value);
    };

    const sendForm = async () => {
        if (!content) {
            setContentError(true);
            return;
        }

        try {
            setIsSending(true);
            await sendEmail({ reply_to: email, message: content });
            setEmailSent(true);
            setContent('');
            setContentError(false);
        } catch (err) {
            alert('Email send error! ' + errToString(err));
        }
        setIsSending(false);
    };

    return (
        <VStack spacing={3} p={4} alignItems="flex-start">
            <CardBox title="Contact Me" width={['100%', '100%', '100%', '100%', '50%']} divider>
                <VStack spacing={3} alignItems="flex-start">
                    <Paragraph>
                        Feel free to contact if you have any problems or feature requests. Or if you have any feedback
                        to give - good or bad.
                    </Paragraph>

                    <Textarea
                        variant="outline"
                        value={content}
                        placeholder="Content"
                        onChange={changeContent}
                        rows={4}
                    />

                    {contentError && <Text color="red">Content is empty!</Text>}

                    <Input value={email} placeholder="E-mail (If you need feedback)" onChange={changeEmail} />

                    <Button onClick={sendForm} disabled={isSending}>
                        Send
                    </Button>
                </VStack>
                {emailSent && (
                    <Flex pt={5}>
                        <Text color="green">Email is sent!</Text>
                    </Flex>
                )}
            </CardBox>
        </VStack>
    );
}
