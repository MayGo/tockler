import React, { memo } from 'react';
import { Box, Flex } from 'reflexbox';
import { Card, Typography } from 'antd';
import {
    deleteWhitelistItems,
    getWhitelist,
    ListItem,
    upsertWhitelistItems,
} from '../../services/lists.api';
import { useState } from 'react';
import { useEffect } from 'react';
import ListFormUI from './ListFormUI';

const WhitelistForm = memo(() => {
    const [loading, setLoading] = useState(true);
    const [whitelist, setWhitelist] = useState<ListItem[]>([]);

    const _getWhitelist = async () => {
        setLoading(true);
        const whitelist = await getWhitelist(); // TODO: replace with getWhitelist (getWhitelist was just used for testing purposes)
        setWhitelist(whitelist);
        setLoading(false);
    };

    const handleSave = async (itemsToUpsert: Partial<ListItem>[]) => {
        return await upsertWhitelistItems(itemsToUpsert);
    };

    const handleDeleteOne = async (itemId: number) => {
        await deleteWhitelistItems([itemId]);
    };

    useEffect(() => {
        if (whitelist.length === 0) {
            _getWhitelist();
        }
        // eslint-disable-next-line
    }, []);

    if (loading) return null;

    return (
        <Card title="Whitelist Conditions">
            <Flex style={{ marginBottom: 8 }}>
                <Box p={1}>
                    <Typography>
                        The app will track and send to GitStart any activity that matches the
                        following conditions:
                    </Typography>
                </Box>
            </Flex>
            <ListFormUI initialList={whitelist} onSave={handleSave} onDeleteOne={handleDeleteOne} />
            <Flex style={{ marginBottom: 8 }}>
                <Box p={1}>
                    <Typography>
                        <strong>Note</strong>: Any activity that neither matches the Blacklist
                        conditions nor Whitelist conditions is still tracked but not sent to
                        GitStart.
                    </Typography>
                    <Typography>
                        <strong>Note 2</strong>: Adding a new condition will affect both{' '}
                        <strong>new and old</strong> activities. Old activities will be sent after
                        adding a new condition.
                    </Typography>
                </Box>
            </Flex>
        </Card>
    );
});

export default WhitelistForm;
