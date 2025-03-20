// Set up mocks before any imports
import { vi } from 'vitest';

// Now import the rest of the dependencies
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { DateTime, Settings } from 'luxon';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { mainStore } from '../store/mainStore';
import { SearchPage } from './SearchPage';

const searchFromItems = vi.fn();
const exportFromItems = vi.fn();

const mockData = {
    data: [
        {
            id: 1,
            app: 'Chrome',
            title: 'Test title',
            beginDate: Date.now() - 3600000, // 1 hour ago
            endDate: Date.now(),
            taskName: 'AppTrackItem',
        },
    ],
    total: 1,
};

// Create a more robust mock function for invokeIpc that logs all arguments
const invokeIpc = vi.fn().mockImplementation((channel, ...args) => {
    console.warn('MOCK invokeIpc called with channel:', channel, 'and args:', JSON.stringify(args));

    if (channel === 'searchFromItems') {
        return searchFromItems(...args);
    }

    if (channel === 'exportFromItems') {
        return exportFromItems(...args);
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

function getTimestamp(dateString: string) {
    return new Date(dateString).getTime();
}

const renderSearchPage = () => {
    return render(
        <ChakraProvider>
            <MemoryRouter>
                <StoreProvider store={mainStore}>
                    <SearchPage />
                </StoreProvider>
            </MemoryRouter>
        </ChakraProvider>,
    );
};

const getLastCall = () => {
    const searchCalls = vi.mocked(searchFromItems).mock.calls;

    const lastCall = searchCalls[searchCalls.length - 1];
    return lastCall ? lastCall[0] : null;
};

describe('SearchPage Component', () => {
    beforeEach(() => {
        // Clear all mocks between tests
        vi.clearAllMocks();
        Settings.now = () => NOW;
        vi.stubGlobal('electronBridge', mockElectronBridge);

        searchFromItems.mockResolvedValue(mockData);
    });

    it('renders the search form correctly', async () => {
        renderSearchPage();

        await waitFor(() => expect(searchFromItems).toHaveBeenCalledTimes(1));

        expect(screen.getByPlaceholderText('Search from all items')).toBeInTheDocument();
        expect(screen.getByText('Search')).toBeInTheDocument();
        expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('searches items when form is submitted', async () => {
        renderSearchPage();
        await waitFor(() => expect(searchFromItems).toHaveBeenCalledTimes(1));

        const searchInput = screen.getByPlaceholderText('Search from all items');
        fireEvent.change(searchInput, { target: { value: 'test search' } });

        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        await waitFor(() => expect(searchFromItems).toHaveBeenCalledTimes(2));

        const lastCall = getLastCall();

        expect(lastCall).toStrictEqual({
            from: DateTime.fromISO('2022-12-31T00:00:00.000+02:00').valueOf(),
            to: DateTime.fromISO('2023-01-10T23:59:59.999+02:00').valueOf(),
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

    it('exports items to CSV and JSON when export options are clicked', async () => {
        renderSearchPage();

        // Click the export button to open the menu
        const exportButton = screen.getByText('Export');
        fireEvent.click(exportButton);

        // Click CSV export option
        const csvExportOption = screen.getByText('Export to CSV');
        fireEvent.click(csvExportOption);

        // Verify that exportFromItems was called with CSV format
        await waitFor(() => expect(exportFromItems).toHaveBeenCalledTimes(1));
        expect(exportFromItems.mock.calls[0][0].format).toBe('csv');

        // Reset mock
        exportFromItems.mockClear();

        // Click the export button again to open the menu
        fireEvent.click(exportButton);

        // Click JSON export option
        const jsonExportOption = screen.getByText('Export to JSON');
        fireEvent.click(jsonExportOption);

        // Verify that exportFromItems was called with JSON format
        await waitFor(() => expect(exportFromItems).toHaveBeenCalledTimes(1));
        expect(exportFromItems.mock.calls[0][0].format).toBe('json');
    });

    it('updates the task type when type selector changes', async () => {
        renderSearchPage();
        await waitFor(() => expect(searchFromItems).toHaveBeenCalledTimes(1));

        // Find the type select dropdown and change its value
        const typeSelect = await screen.findByRole('combobox', { name: 'Type Select' });
        fireEvent.change(typeSelect, { target: { value: 'LogTrackItem' } });

        // Submit the form to trigger a new search
        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        await waitFor(() => expect(searchFromItems).toHaveBeenCalledTimes(2));

        const lastCall = getLastCall();

        expect(lastCall).toStrictEqual({
            from: DateTime.fromISO('2022-12-31T00:00:00.000+02:00').valueOf(),
            to: DateTime.fromISO('2023-01-10T23:59:59.999+02:00').valueOf(),
            taskName: 'LogTrackItem',
            searchStr: '',
            sumTotal: true,
            paging: { limit: 10, offset: 0, sortByKey: 'endDate', sortByOrder: 'desc' },
        });
    });

    it('updates timerange when date range selection changes', async () => {
        renderSearchPage();

        await waitFor(() => expect(searchFromItems).toHaveBeenCalledTimes(1));

        // Click the Month button to change the timerange
        const monthButton = screen.getByText('Month');
        fireEvent.click(monthButton);

        await waitFor(() => expect(searchFromItems).toHaveBeenCalledTimes(2));

        const lastCall = getLastCall();

        expect(lastCall).toStrictEqual({
            from: DateTime.fromISO('2022-12-10T00:00:00.000+02:00').valueOf(),
            to: DateTime.fromISO('2023-01-10T23:59:59.999+02:00').valueOf(),
            taskName: 'AppTrackItem',
            searchStr: '',
            sumTotal: true,
            paging: { limit: 10, offset: 0, sortByKey: 'endDate', sortByOrder: 'desc' },
        });
    });

    it('sorts items by BeginDate', async () => {
        renderSearchPage();
        await waitFor(() => expect(searchFromItems).toHaveBeenCalledTimes(1));

        // Click the header for the Begin column to sort
        const beginHeader = screen.getByText('Begin');
        fireEvent.click(beginHeader);

        // Submit the form to trigger a new search
        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        await waitFor(() => expect(searchFromItems).toHaveBeenCalledTimes(2));

        const lastCall = getLastCall();

        expect(lastCall).toStrictEqual({
            from: DateTime.fromISO('2022-12-31T00:00:00.000+02:00').valueOf(),
            to: DateTime.fromISO('2023-01-10T23:59:59.999+02:00').valueOf(),
            taskName: 'AppTrackItem',
            searchStr: '',
            sumTotal: true,
            paging: { limit: 10, offset: 0, sortByKey: 'beginDate', sortByOrder: 'desc' },
        });
    });
});
