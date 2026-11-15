/** User-facing message for a failed category/app-setting IPC call. */
export const describeCategoryError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('UNIQUE constraint failed: Categories.name')) {
        return 'A category with this name already exists.';
    }
    return message;
};

export const errorToast = (title: string, error: unknown) => ({
    title,
    description: describeCategoryError(error),
    status: 'error' as const,
    isClosable: true,
});
