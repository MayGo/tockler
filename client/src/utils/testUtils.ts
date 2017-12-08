export const transformConsoleMessagesToExceptions = () => {
    console.warn = jest.fn(warn => {
        throw new Error(warn);
    });
    console.error = jest.fn(error => {
        throw new Error(error);
    });
};
