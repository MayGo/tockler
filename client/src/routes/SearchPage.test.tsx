// Set up mocks before any imports
import { vi } from 'vitest';

// Now import the rest of the dependencies
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DateTime, Settings } from 'luxon';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
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
        return searchFromItems;
    }

    if (channel === 'exportFromItems') {
        return Promise.resolve([]);
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
                <SearchPage />
            </MemoryRouter>
        </ChakraProvider>,
    );
};

const getLastCall = () => {
    // Filter calls to the invokeIpc function for the searchFromItems channel
    const searchCalls = invokeIpc.mock.calls.filter((call) => call[0] === 'searchFromItems');
    const lastCall = searchCalls[searchCalls.length - 1];
    return lastCall ? lastCall[1] : null; // The payload is the second argument
};

describe('SearchPage Component', () => {
    beforeEach(() => {
        // Clear all mocks between tests
        vi.clearAllMocks();
        Settings.now = () => NOW;
        vi.stubGlobal('electronBridge', mockElectronBridge);
    });

    it('renders the search form correctly', async () => {
        renderSearchPage();

        await waitFor(() => expect(invokeIpc).toHaveBeenCalledWith('searchFromItems', expect.anything()));

        expect(screen.getByPlaceholderText('Search from all items')).toBeInTheDocument();
        expect(screen.getByText('Search')).toBeInTheDocument();
        expect(screen.getByText('Export to CSV')).toBeInTheDocument();
    });

    it('searches items when form is submitted', async () => {
        renderSearchPage();
        await waitFor(() => expect(invokeIpc).toHaveBeenCalledWith('searchFromItems', expect.anything()));

        const searchInput = screen.getByPlaceholderText('Search from all items');
        fireEvent.change(searchInput, { target: { value: 'test search' } });

        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        await waitFor(() => {
            const searchCalls = invokeIpc.mock.calls.filter((call) => call[0] === 'searchFromItems');
            return expect(searchCalls.length).toBe(2);
        });

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

    it('exports items to CSV when export button is clicked', async () => {
        renderSearchPage();

        // Click the export button
        const exportButton = screen.getByText('Export to CSV');
        fireEvent.click(exportButton);

        // Verify that exportFromItems was called via invokeIpc
        await waitFor(() => expect(invokeIpc).toHaveBeenCalledWith('exportFromItems', expect.anything()));
    });

    it('updates the task type when type selector changes', async () => {
        renderSearchPage();
        await waitFor(() => expect(invokeIpc).toHaveBeenCalledWith('searchFromItems', expect.anything()));

        // Find the type select dropdown and change its value
        const typeSelect = await screen.findByRole('combobox', { name: 'Type Select' });
        fireEvent.change(typeSelect, { target: { value: 'LogTrackItem' } });

        // Submit the form to trigger a new search
        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        await waitFor(() => {
            const searchCalls = invokeIpc.mock.calls.filter((call) => call[0] === 'searchFromItems');
            return expect(searchCalls.length).toBe(2);
        });

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

        await waitFor(() => expect(invokeIpc).toHaveBeenCalledWith('searchFromItems', expect.anything()));

        // Click the Month button to change the timerange
        const monthButton = screen.getByText('Month');
        fireEvent.click(monthButton);

        await waitFor(() => {
            const searchCalls = invokeIpc.mock.calls.filter((call) => call[0] === 'searchFromItems');
            return expect(searchCalls.length).toBe(2);
        });

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
        await waitFor(() => expect(invokeIpc).toHaveBeenCalledWith('searchFromItems', expect.anything()));

        // Click the header for the Begin column to sort
        const beginHeader = screen.getByText('Begin');
        fireEvent.click(beginHeader);

        // Submit the form to trigger a new search
        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);

        await waitFor(() => {
            const searchCalls = invokeIpc.mock.calls.filter((call) => call[0] === 'searchFromItems');
            return expect(searchCalls.length).toBe(2);
        });

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
