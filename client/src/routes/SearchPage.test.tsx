import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DateTime, Settings } from 'luxon';
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

const NOW = getTimestamp('2023-01-10T12:00:00');

function getTimestamp(dateString: string) {
    return new Date(dateString).getTime();
}

const renderSearchPage = () => {
    return render(
        <ChakraProvider>
            <MemoryRouter>
                <SearchPage />
            </MemoryRouter>
        </ChakraProvider>,
    );
};

const getLastCall = () => {
    const searchCalls = vi.mocked(trackItemApi.searchFromItems).mock.calls;
    const lastCall = searchCalls[searchCalls.length - 1];
    return lastCall;
};

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

    it('renders the search form correctly', async () => {
        renderSearchPage();

        await waitFor(() => expect(trackItemApi.searchFromItems).toHaveBeenCalledTimes(1));

        expect(screen.getByPlaceholderText('Search from all items')).toBeInTheDocument();
        expect(screen.getByText('Search')).toBeInTheDocument();
        expect(await screen.findByText('Export to CSV')).toBeInTheDocument();
    });

    it('searches items when form is submitted', async () => {
        Settings.now = () => NOW;
        renderSearchPage();
        await waitFor(() => expect(trackItemApi.searchFromItems).toHaveBeenCalledTimes(1));

        const searchInput = screen.getByPlaceholderText('Search from all items');
        fireEvent.change(searchInput, { target: { value: 'test search' } });

        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        await waitFor(() => expect(trackItemApi.searchFromItems).toHaveBeenCalledTimes(2));

        const lastCall = getLastCall();

        expect(lastCall[0]).toStrictEqual({
            from: DateTime.fromISO('2022-12-31T00:00:00.000+02:00'),
            to: DateTime.fromISO('2023-01-10T23:59:59.999+02:00'),
            taskName: 'AppTrackItem',
            searchStr: 'test search',
            sumTotal: true,
            paging: {
                limit: 10,
                offset: 0,
                sortByKey: 'endDate',
                sortByOrder: 'desc',
            },
        });
    });

    it('exports items to CSV when export button is clicked', async () => {
        renderSearchPage();

        // Click the export button
        const exportButton = screen.getByText('Export to CSV');
        fireEvent.click(exportButton);

        // Verify that exportFromItems was called
        await waitFor(() => expect(trackItemApi.exportFromItems).toHaveBeenCalledTimes(1));
    });

    it('updates the task type when type selector changes', async () => {
        Settings.now = () => NOW;
        renderSearchPage();
        await waitFor(() => expect(trackItemApi.searchFromItems).toHaveBeenCalledTimes(1));

        // Find the type select dropdown and change its value
        const typeSelect = await screen.findByRole('combobox', { name: 'Type Select' });
        fireEvent.change(typeSelect, { target: { value: 'LogTrackItem' } });

        // Submit the form to trigger a new search
        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        await waitFor(() => expect(trackItemApi.searchFromItems).toHaveBeenCalledTimes(2));

        const lastCall = getLastCall();

        expect(lastCall[0]).toStrictEqual({
            from: DateTime.fromISO('2022-12-31T00:00:00.000+02:00'),
            to: DateTime.fromISO('2023-01-10T23:59:59.999+02:00'),
            taskName: 'LogTrackItem',
            searchStr: '',
            sumTotal: true,
            paging: { limit: 10, offset: 0, sortByKey: 'endDate', sortByOrder: 'desc' },
        });
    });

    it('updates timerange when date range selection changes', async () => {
        Settings.now = () => NOW;
        renderSearchPage();

        await waitFor(() => expect(trackItemApi.searchFromItems).toHaveBeenCalledTimes(1));

        // Click the Month button to change the timerange
        const monthButton = screen.getByText('Month');
        fireEvent.click(monthButton);

        await waitFor(() => expect(trackItemApi.searchFromItems).toHaveBeenCalledTimes(2));

        const lastCall = getLastCall();

        expect(lastCall[0]).toStrictEqual({
            from: DateTime.fromISO('2022-12-10T00:00:00.000+02:00'),
            to: DateTime.fromISO('2023-01-10T23:59:59.999+02:00'),
            taskName: 'AppTrackItem',
            searchStr: '',
            sumTotal: true,
            paging: { limit: 10, offset: 0, sortByKey: 'endDate', sortByOrder: 'desc' },
        });
    });
    it('sorts items by BeginDate', async () => {
        Settings.now = () => NOW;

        renderSearchPage();
        await waitFor(() => expect(trackItemApi.searchFromItems).toHaveBeenCalledTimes(1));
        // Click the header for the Begin column to sort
        const beginHeader = screen.getByText('Begin');
        fireEvent.click(beginHeader);

        // Submit the form to trigger a new search
        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        await waitFor(() => expect(trackItemApi.searchFromItems).toHaveBeenCalledTimes(2));

        const lastCall = getLastCall();

        expect(lastCall[0]).toStrictEqual({
            from: DateTime.fromISO('2022-12-31T00:00:00.000+02:00'),
            to: DateTime.fromISO('2023-01-10T23:59:59.999+02:00'),
            taskName: 'AppTrackItem',
            searchStr: '',
            sumTotal: true,
            paging: { limit: 10, offset: 0, sortByKey: 'beginDate', sortByOrder: 'desc' },
        });
    });
});
