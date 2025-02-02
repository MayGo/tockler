import { Button } from '@chakra-ui/react';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';

export function TimelineItemEditDeleteButton({ deleteItem }) {
    const [isOpen, setIsOpen] = useState(false);
    const onClose = () => setIsOpen(false);
    const onDelete = () => {
        deleteItem();
        onClose();
    };
    const cancelRef = useRef<HTMLButtonElement>(null!);

    return (
        <>
            <Button colorScheme="red" leftIcon={<AiOutlineDelete />} onClick={() => setIsOpen(true)}>
                Delete
            </Button>

            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Timeline Item
                        </AlertDialogHeader>

                        <AlertDialogBody>Are you sure? You can't undo this action afterwards.</AlertDialogBody>

                        <AlertDialogFooter>
                            <Button variant="outline" ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" ml={3} onClick={onDelete}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
}
