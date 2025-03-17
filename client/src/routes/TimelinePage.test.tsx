// Set up mocks before any imports
import { vi } from 'vitest';

// Now import the rest of the dependencies
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { Settings } from 'luxon';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { getTimestamp } from '../__tests__/time.testUtils';
import { mainStore } from '../store/mainStore';
import { TimelinePage } from './TimelinePage';

const findAllDayItems = vi.fn();

const mockData = [
    {
        id: 1,
        app: 'Chrome',
        title: 'Test title',
        beginDate: Date.now() - 3600000, // 1 hour ago
        endDate: Date.now(),
        taskName: 'AppTrackItem',
    },
];

// Create a more robust mock function for invokeIpc that logs all arguments
const invokeIpc = vi.fn().mockImplementation((channel, ...args) => {
    console.warn('MOCK invokeIpc called with channel:', channel, 'and args:', JSON.stringify(args));

    if (channel === 'findAllDayItems') {
        return findAllDayItems(...args);
    }

    // Default return for other channels
    return Promise.resolve({});
});

// Create the mock electronBridge global
const mockElectronBridge = {
    configGet: vi.fn(),
    configSet: vi.fn(),
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
    platform: 'darwin',
    isMas: false,
    appVersion: vi.fn(),
    openUrlInExternalWindow: vi.fn(),
    invokeIpc,
    sendIpc: vi.fn(),
    onIpc: vi.fn(),
    removeListenerIpc: vi.fn(),
};

const NOW = getTimestamp('2023-01-10T12:00:00');

const renderTimelinePage = () => {
    return render(
        <ChakraProvider>
            <MemoryRouter>
                <StoreProvider store={mainStore}>
                    <TimelinePage />
                </StoreProvider>
            </MemoryRouter>
        </ChakraProvider>,
    );
};

describe('TimelinePage Component', () => {
    beforeEach(() => {
        // Clear all mocks between tests
        // Clear all mocks between tests
        vi.clearAllMocks();
        Settings.now = () => NOW;
        vi.stubGlobal('electronBridge', mockElectronBridge);

        findAllDayItems.mockResolvedValue(mockData);
    });

    it('renders the timeline components correctly', async () => {
        renderTimelinePage();

        // Check for key components
        expect(screen.getByText('App Usage')).toBeInTheDocument();
    });

    it('calls fetchTimerange on component mount', async () => {
        renderTimelinePage();

        await waitFor(() => expect(findAllDayItems).toHaveBeenCalled());
    });
});
