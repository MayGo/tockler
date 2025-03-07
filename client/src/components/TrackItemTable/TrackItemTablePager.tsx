import { ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
    Flex,
    IconButton,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Select,
    Text,
    Tooltip,
} from '@chakra-ui/react';

interface TrackItemTablePagerProps {
    gotoPage: (page: number) => void;
    canPreviousPage: boolean;
    previousPage: () => void;
    pageIndex: number;
    pageSize: number;
    nextPage: () => void;
    canNextPage: boolean;
    pageCount: number;
    setPageSize: (size: number) => void;
}

export const TrackItemTablePager = ({
    gotoPage,
    canPreviousPage,
    previousPage,
    pageIndex,
    pageSize,
    nextPage,
    canNextPage,
    pageCount,
    setPageSize,
}: TrackItemTablePagerProps) => {
    if (pageCount === 0) return null;

    return (
        <Flex justifyContent="space-between" m={4} alignItems="center">
            <Flex>
                <Tooltip label="First Page">
                    <IconButton
                        aria-label="First Page"
                        onClick={() => gotoPage(0)}
                        isDisabled={!canPreviousPage}
                        icon={<ArrowLeftIcon h={3} w={3} />}
                        mr={4}
                    />
                </Tooltip>
                <Tooltip label="Previous Page">
                    <IconButton
                        aria-label="Previous Page"
                        onClick={previousPage}
                        isDisabled={!canPreviousPage}
                        icon={<ChevronLeftIcon h={6} w={6} />}
                    />
                </Tooltip>
            </Flex>

            <Flex alignItems="center">
                <Text flexShrink={0} mr={8}>
                    Page{' '}
                    <Text fontWeight="bold" as="span">
                        {pageIndex + 1}
                    </Text>{' '}
                    of{' '}
                    <Text fontWeight="bold" as="span">
                        {Math.max(pageCount, 1)}
                    </Text>
                </Text>
                <Text flexShrink={0}>Go to page:</Text>{' '}
                <NumberInput
                    ml={2}
                    mr={8}
                    w={28}
                    min={1}
                    max={Math.max(pageCount, 1)}
                    onChange={(value) => {
                        const currentPage = Number(value);
                        const page = currentPage ? currentPage - 1 : 0;
                        gotoPage(page);
                    }}
                    defaultValue={pageIndex + 1}
                    value={pageIndex + 1}
                >
                    <NumberInputField />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
                <Select
                    w={32}
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(Number(e.target.value));
                    }}
                >
                    {[10, 20, 30, 40, 50].map((size) => (
                        <option key={size} value={size}>
                            Show {size}
                        </option>
                    ))}
                </Select>
            </Flex>

            <Flex>
                <Tooltip label="Next Page">
                    <IconButton
                        aria-label="Next Page"
                        onClick={nextPage}
                        isDisabled={!canNextPage}
                        icon={<ChevronRightIcon h={6} w={6} />}
                    />
                </Tooltip>
                <Tooltip label="Last Page">
                    <IconButton
                        aria-label="Last Page"
                        onClick={() => gotoPage(Math.max(pageCount - 1, 0))}
                        isDisabled={!canNextPage}
                        icon={<ArrowRightIcon h={3} w={3} />}
                        ml={4}
                    />
                </Tooltip>
            </Flex>
        </Flex>
    );
};
