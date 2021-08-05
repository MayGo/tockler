import { Button } from '@chakra-ui/button';
import { Box, Flex, Text } from '@chakra-ui/layout';
import {
  Center,
  Grid,
  HStack,
  Image,
  Link,
  useColorMode,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';

import { MainLayout } from '../MainLayout/MainLayout';
import { Carousels } from '../components/Carousels';
import { TocklerLogoText } from '../Header/TocklerLogoText';
import {
  FaApple,
  FaChartBar,
  FaDatabase,
  FaHistory,
  FaLinux,
  FaWindows,
} from 'react-icons/fa';
import { CgDarkMode } from 'react-icons/cg';
import { IoMdAnalytics, IoMdNotifications } from 'react-icons/io';
import { FeatureItem } from '../components/FeatureItem';
import { ListItem } from '../components/ListItem';

export function HomePage() {
  const trayImg = useColorModeValue(
    'https://github.com/MayGo/tockler/raw/master/screenshots/light/tockler-tray.png',
    'https://github.com/MayGo/tockler/raw/master/screenshots/dark/tockler-tray.png'
  );

  const { toggleColorMode } = useColorMode();
  const colorModeText = useColorModeValue('dark', 'light');
  const colorProductHunt = useColorModeValue('light', 'dark');
  return (
    <MainLayout>
      <Box px={5} pt="120px">
        <Center>
          <TocklerLogoText height="100px" />
        </Center>
        <Center pt={4}>
          <Text fontSize="md">
            Track your time or look when and what were you doing at some point
            in time.
          </Text>
        </Center>
      </Box>
      <Box py="90px">
        <Center>
          <HStack>
            <Button
              variant="outline"
              leftIcon={<FaApple />}
              as={Link}
              textDecoration="none !important"
              href="https://github.com/MayGo/tockler/releases/download/v3.19.16/Tockler-3.19.16.dmg"
            >
              macOS
            </Button>
            <Button
              variant="outline"
              leftIcon={<FaWindows />}
              as={Link}
              textDecoration="none !important"
              href="https://github.com/MayGo/tockler/releases/download/v3.19.16/tockler-3.19.16-setup-win.exe"
            >
              Windows
            </Button>
            <Button
              variant="outline"
              leftIcon={<FaLinux />}
              as={Link}
              textDecoration="none !important"
              href="https://github.com/MayGo/tockler/releases/download/v3.19.16/Tockler-3.19.16.AppImage"
            >
              Linux
            </Button>
          </HStack>
        </Center>
        <Center pt="4">
          <Text fontSize="md">Tockler is free to download and use.</Text>
        </Center>
        <Center pt="4">
          <Text fontSize="xs">
            Latest: v3.19.16.{' '}
            <Link
              color="blue.500"
              href="https://github.com/MayGo/tockler/releases/latest"
            >
              Releases Page
            </Link>
          </Text>
        </Center>
        <Center pt="8">
          <a
            href="https://www.producthunt.com/posts/tockler?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-tockler"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=304890&theme=${colorProductHunt}`}
              alt="Tockler - Automatically track applications usage and working time. | Product Hunt"
              style={{ width: '250px', height: '54px' }}
              width="250"
              height="54"
            />
          </a>
        </Center>
      </Box>
      <Center pb={12}>
        <Text fontSize="60px">Features</Text>
      </Center>
      <Center>
        <Box width="100%" maxW="1200px" px={5}>
          <Grid templateColumns="repeat(3, 1fr)" gap={12}>
            <FeatureItem title="History" icon={FaHistory}>
              With Tockler you can go back in time and see what you were working
              on. You can get information on what apps were used - exactly at
              what time - and what title the application had at that moment.
              This is enough to determine when and how much you did something.
            </FeatureItem>
            <FeatureItem title="Tracking" icon={FaChartBar}>
              Track how you spent your time on a computer. Tockler tracks active
              applications usage and computer state. It records active
              application titles. It tracks idle, offline and online state. You
              can see this data with nice interactive timeline chart.
            </FeatureItem>
            <FeatureItem title="Analyze" icon={IoMdAnalytics}>
              Analyze your computer usage. See your total online time today,
              yesterday or any other day. In monthly calendar views and with
              charts.
            </FeatureItem>
            <FeatureItem title="Dark mode" icon={CgDarkMode}>
              Dark Mode support. Can automatically change when OS mode changes.
              You can click{' '}
              <Link color="blue.500" onClick={toggleColorMode}>
                here
              </Link>{' '}
              to change screenshots to {colorModeText} ones.
            </FeatureItem>
            <FeatureItem title="Local data" icon={FaDatabase}>
              Works without internet access. All data is stored locally on your
              device. You can search items and all data is exportable to CSV.
            </FeatureItem>
            <FeatureItem title="Reminders" icon={IoMdNotifications}>
              Configure notifications to be fired if application with required
              title is opened.
            </FeatureItem>
          </Grid>
        </Box>
      </Center>
      <Center>
        <Flex width="100%" maxW="1000px" pt="110px" px={5}>
          <Box flex={1}>
            <Text fontSize="60px">Tray window</Text>
            <VStack alignItems="start" pl={7} pt={7} spacing={7}>
              <ListItem>Start tasks manually</ListItem>
              <ListItem>Overview of online time</ListItem>
              <ListItem>Current online time length</ListItem>
              <ListItem>Last online time length</ListItem>
            </VStack>
          </Box>
          <Box flex={1}>
            <Text fontSize="60px">
              <Image src={trayImg} />
            </Text>
          </Box>
        </Flex>
      </Center>
      <Carousels />
    </MainLayout>
  );
}
