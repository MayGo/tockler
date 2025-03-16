import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DateTime } from 'luxon';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as trackItemApi from '../services/trackItem.api';
import { SearchPage } from './SearchPage';

// Mock the services that use EventEmitter
vi.mock('../services/trackItem.api', () => ({
    searchFromItems: vi.fn(),
    exportFromItems: vi.fn(),
}));

// Mock window.matchMedia - required for Chakra UI components in test environment
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock the window.electronBridge from preloadStuff.ts
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
    invokeIpc: vi.fn(),
    sendIpc: vi.fn(),
    onIpc: vi.fn(),
    removeListenerIpc: vi.fn(),
};

// Mock window object with electronBridge
vi.stubGlobal('electronBridge', mockElectronBridge);

// Mock React Router hooks
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

describe('SearchPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Set up default mock return values
        const mockSearchResult = {
            data: [
                {
                    id: 1,
                    app: 'Chrome',
                    title: 'Test title',
                    beginDate: DateTime.now().minus({ hours: 1 }).valueOf(),
                    endDate: DateTime.now().valueOf(),
                    taskName: 'AppTrackItem',
                },
            ],
            total: 1,
        };

        vi.mocked(trackItemApi.searchFromItems).mockResolvedValue(mockSearchResult);
        vi.mocked(trackItemApi.exportFromItems).mockResolvedValue([]);
    });

    it.only('renders the search form correctly', async () => {
        render(
            <ChakraProvider>
                <MemoryRouter>
                    <SearchPage />
                </MemoryRouter>
            </ChakraProvider>,
        );

        // Check that basic elements are rendered
        expect(screen.getByPlaceholderText('Search from all items')).toBeInTheDocument();
        expect(screen.getByText('Search')).toBeInTheDocument();
        expect(screen.getByText('Export to CSV')).toBeInTheDocument();

        // Wait for initial data loading to complete
        await waitFor(() => {
            expect(trackItemApi.searchFromItems).toHaveBeenCalledTimes(1);
        });
    });

    it('searches items when form is submitted', async () => {
        render(
            <ChakraProvider>
                <MemoryRouter>
                    <SearchPage />
                </MemoryRouter>
            </ChakraProvider>,
        );

        // Enter search text
        const searchInput = screen.getByPlaceholderText('Search from all items');
        fireEvent.change(searchInput, { target: { value: 'test search' } });

        // Submit the form
        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        // Wait for search to be called with the new text
        await waitFor(() => {
            const searchCalls = vi.mocked(trackItemApi.searchFromItems).mock.calls;
            const lastCall = searchCalls[searchCalls.length - 1];
            expect(lastCall[0].searchStr).toBe('test search');
        });
    });

    it('exports items to CSV when export button is clicked', async () => {
        render(
            <ChakraProvider>
                <MemoryRouter>
                    <SearchPage />
                </MemoryRouter>
            </ChakraProvider>,
        );

        // Click the export button
        const exportButton = screen.getByText('Export to CSV');
        fireEvent.click(exportButton);

        // Verify that exportFromItems was called
        await waitFor(() => {
            expect(trackItemApi.exportFromItems).toHaveBeenCalledTimes(1);
        });
    });

    it('updates the task type when type selector changes', async () => {
        render(
            <ChakraProvider>
                <MemoryRouter>
                    <SearchPage />
                </MemoryRouter>
            </ChakraProvider>,
        );

        // Find the type select dropdown and change its value
        const typeSelect = screen.getByRole('combobox');
        fireEvent.change(typeSelect, { target: { value: 'LogTrackItem' } });

        // Submit the form to trigger a new search
        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        // Verify that searchFromItems was called with the new task type
        await waitFor(() => {
            const searchCalls = vi.mocked(trackItemApi.searchFromItems).mock.calls;
            const lastCall = searchCalls[searchCalls.length - 1];
            expect(lastCall[0].taskName).toBe('LogTrackItem');
        });
    });

    it('updates timerange when date range selection changes', async () => {
        render(
            <ChakraProvider>
                <MemoryRouter>
                    <SearchPage />
                </MemoryRouter>
            </ChakraProvider>,
        );

        // Click the Month button to change the timerange
        const monthButton = screen.getByText('Month');
        fireEvent.click(monthButton);

        // Submit the form to trigger a new search
        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        // Verify that searchFromItems was called with the new timerange
        await waitFor(() => {
            const searchCalls = vi.mocked(trackItemApi.searchFromItems).mock.calls;
            const lastCall = searchCalls[searchCalls.length - 1];

            // Check that the "from" date is about a month ago
            const from = lastCall[0].from;
            const to = lastCall[0].to;

            const fromDate = DateTime.fromMillis(from);
            const toDate = DateTime.fromMillis(to);

            // Approximately a month difference (allowing for small test execution time differences)
            const diffDays = toDate.diff(fromDate, 'days').days;
            expect(diffDays).toBeGreaterThanOrEqual(28);
            expect(diffDays).toBeLessThanOrEqual(32);
        });
    });
});
