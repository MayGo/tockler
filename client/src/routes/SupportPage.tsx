import React from 'react';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { Box, Flex } from 'reflexbox';
import { Typography } from 'antd';
const { Title, Paragraph } = Typography;

export function SupportPage({ location }: any) {
    return (
        <MainLayout location={location}>
            <Box p={4} width={0.5}>
                <Title level={3}>Contact Me</Title>
                <Paragraph>Feel free to report bugs at support.gitstart.com..</Paragraph>
            </Box>
            <Box p={4} width={0.5}>
                <Title level={3}>Support the original project (Tockler)</Title>
                <Paragraph>
                    This app is made based on an open-source project by{' '}
                    <a href="https://github.com/MayGo/tockler">@MayGo</a>. It is done in their own
                    free time and often at expense of family, friends, and sleep. They would like to
                    keep this app free, open-source, and improving over time. But for that, your
                    support is needed.
                </Paragraph>
                <Paragraph>
                    It is understandable if you can't give anything. You can always give some
                    constructive feedback.
                </Paragraph>
                <Paragraph>
                    So if you find this app useful then feel free to donate. Anything helps to keep
                    this app up to date and always improving. They don't plan to get rich with that,
                    need to justify working on this.
                </Paragraph>
                <Flex p={1}>
                    <Box p={2}>
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
                    </Box>
                    <Box p={2}>
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
                    </Box>
                    <Box p={2}>
                        <a href="https://www.patreon.com/Tockler" rel="noreferrer" target="_blank">
                            <img
                                src="https://github.com/MayGo/tockler/raw/master/badges/Patreon-Badge.svg"
                                alt="Become a patron"
                                style={{ maxWidth: '100%' }}
                            />
                        </a>
                    </Box>
                </Flex>
            </Box>
        </MainLayout>
    );
}
