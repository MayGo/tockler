import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Box,
    Button,
    Code,
    Heading,
    HStack,
    Stack,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

const ErrorFallback = ({
    error,
    errorInfo,
    resetErrorBoundary,
}: {
    error: Error | null;
    errorInfo: ErrorInfo | null;
    resetErrorBoundary: () => void;
}) => {
    const bgColor = useColorModeValue('red.50', 'rgba(254, 178, 178, 0.16)');
    const borderColor = useColorModeValue('red.400', 'red.300');

    return (
        <Box p={6} m={4} borderRadius="md" bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <Alert status="error" variant="solid" borderRadius="md" mb={4}>
                <AlertIcon />
                <AlertTitle mr={2}>Something went wrong</AlertTitle>
                <AlertDescription>An error occurred in the application</AlertDescription>
            </Alert>

            <Stack spacing={4}>
                <Heading as="h2" size="md">
                    Error Details
                </Heading>
                {error && (
                    <Box>
                        <Text fontWeight="bold">Error:</Text>
                        <Code p={2} width="100%" borderRadius="md" variant="subtle" colorScheme="red">
                            {error.toString()}
                        </Code>
                    </Box>
                )}

                {errorInfo && (
                    <Box>
                        <Text fontWeight="bold">Component Stack:</Text>
                        <Code
                            p={2}
                            width="100%"
                            borderRadius="md"
                            overflowX="auto"
                            variant="subtle"
                            display="block"
                            whiteSpace="pre-wrap"
                        >
                            {errorInfo.componentStack}
                        </Code>
                    </Box>
                )}

                <HStack spacing={4} mt={4}>
                    <Button colorScheme="blue" onClick={resetErrorBoundary}>
                        Try Again
                    </Button>
                </HStack>
            </Stack>
        </Box>
    );
};

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({
            error,
            errorInfo,
        });

        // You can also log the error to an error reporting service here
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    resetErrorBoundary = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render(): ReactNode {
        const { hasError, error, errorInfo } = this.state;
        const { children, fallback } = this.props;

        if (hasError) {
            if (fallback) {
                return fallback;
            }

            return <ErrorFallback error={error} errorInfo={errorInfo} resetErrorBoundary={this.resetErrorBoundary} />;
        }

        return children;
    }
}
