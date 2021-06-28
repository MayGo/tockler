import React, { useState } from 'react';
import { MainLayout } from '../components/MainLayout/MainLayout';
import emailjs from 'emailjs-com';
import { Button } from '@chakra-ui/button';
import { Box, Flex, Text } from '@chakra-ui/layout';
import { Textarea } from '@chakra-ui/textarea';
import { Input } from '@chakra-ui/input';
import { CardBox } from '../components/CardBox';
import { HStack, VStack } from '@chakra-ui/react';

const TEMPLATE_ID = process.env.REACT_APP_TEMPLATE_ID || '';
const SERVICE_ID = process.env.REACT_APP_SERVICE_ID || '';
const USER_ID = process.env.REACT_APP_USER_ID || '';

const Paragraph = props => (
    <Box py={2}>
        <Text fontSize="lg" {...props} />
    </Box>
);

export function SupportPage() {
    const [content, setContent] = useState('');
    const [contentError, setContentError] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [email, setEmail] = useState('');

    const changeContent = e => {
        const { value } = e.target;
        setContent(value);
    };

    const changeEmail = e => {
        const { value } = e.target;
        setEmail(value);
    };

    const sendForm = async () => {
        if (!content) {
            setContentError(true);
            return;
        }
        const templateParams = { reply_to: email, message: content };
        try {
            setIsSending(true);
            await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID);
            setEmailSent(true);
            setContent('');
            setContentError(false);
        } catch (err) {
            alert('Email send error! ' + (err.text ? err.text : err.toString()));
        }
        setIsSending(false);
    };

    return (
        <MainLayout>
            <VStack spacing={3} p={4} alignItems="flex-start">
                <CardBox title="Contact Me" width="50%" divider>
                    <VStack spacing={3} alignItems="flex-end">
                        <Paragraph>
                            Feel free to contact if you have any problems or feature requests. Or if
                            you have any feedback to give - good or bad.
                        </Paragraph>

                        <Textarea
                            variant="outline"
                            value={content}
                            placeholder="Content"
                            onChange={changeContent}
                            rows={4}
                        />

                        {contentError && <Text>Content is empty!</Text>}

                        <Input
                            value={email}
                            placeholder="E-mail (If you need feedback)"
                            onChange={changeEmail}
                        />

                        <Button onClick={sendForm} disabled={isSending}>
                            Send
                        </Button>
                    </VStack>
                    {emailSent && (
                        <Flex p={1}>
                            <Text>Email is sent!</Text>
                        </Flex>
                    )}
                </CardBox>
                <CardBox title="Support Tockler" divider width="50%">
                    <Paragraph>
                        This app is made in my own free time and often at expense of family,
                        friends, and sleep. I would like to keep this app free, open-source, and
                        improving over time. But for that, your support is needed.
                    </Paragraph>
                    <Paragraph>
                        It is understandable if you can't give anything. You can always give some
                        constructive feedback.
                    </Paragraph>
                    <Paragraph>
                        So if you find this app useful then feel free to donate. Anything helps to
                        keep this app up to date and always improving. I need to cover the costs of
                        developing and to justify working on this.
                    </Paragraph>
                    <HStack spacing={4} pt={4}>
                        <a
                            href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&amp;hosted_button_id=JAHHBZZCZVDMA"
                            rel="noreferrer"
                            target="_blank"
                        >
                            <img
                                src="https://github.com/MayGo/tockler/raw/master/badges/Donate-PayPal-green.svg"
                                alt="Donate using PayPal"
                                style={{ maxWidth: '100%' }}
                            />
                        </a>

                        <a
                            href="https://github.com/sponsors/maygo/"
                            rel="noreferrer"
                            target="_blank"
                        >
                            <img
                                src="https://github.com/MayGo/tockler/raw/master/badges/GitHub-Badge.svg"
                                alt="Sponsor on GitHub"
                                style={{ maxWidth: '100%' }}
                            />
                        </a>

                        <a href="https://www.patreon.com/Tockler" rel="noreferrer" target="_blank">
                            <img
                                src="https://github.com/MayGo/tockler/raw/master/badges/Patreon-Badge.svg"
                                alt="Become a patron"
                                style={{ maxWidth: '100%' }}
                            />
                        </a>
                    </HStack>
                </CardBox>
            </VStack>
        </MainLayout>
    );
}
