import { Box, Button, Flex, Input, Text, Textarea, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { CardBox } from '../components/CardBox';
import { sendEmail } from '../services/email.service';

const Paragraph = (props) => (
    <Box py={2}>
        <Text fontSize="lg" {...props} />
    </Box>
);

const errToString = (err) => (err.text ? err.text : err.toString());

export function SupportPage() {
    const [content, setContent] = useState('');
    const [contentError, setContentError] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [email, setEmail] = useState('');
    const [sendError, setSendError] = useState('');

    const changeContent = (e) => {
        const { value } = e.target;
        setContent(value);
        setSendError('');
    };

    const changeEmail = (e) => {
        const { value } = e.target;
        setEmail(value);
        setSendError('');
    };

    const sendForm = async () => {
        if (!content) {
            setContentError(true);
            return;
        }

        try {
            setIsSending(true);
            setSendError('');
            await sendEmail({ reply_to: email, message: content });
            setEmailSent(true);
            setContent('');
            setContentError(false);
        } catch (err) {
            console.error('Email send error!', err);
            setSendError('Email send error! ' + errToString(err));
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
                {sendError && (
                    <Flex pt={5}>
                        <Text color="red">{sendError}</Text>
                    </Flex>
                )}
            </CardBox>
        </VStack>
    );
}
