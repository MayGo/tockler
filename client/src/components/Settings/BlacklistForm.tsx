import React, { memo } from 'react';
import { Box, Flex } from 'reflexbox';
import { Card, Typography } from 'antd';
import {
    deleteBlacklistItems,
    getBlacklist,
    ListItem,
    upsertBlacklistItems,
} from '../../services/lists.api';
import { useState } from 'react';
import { useEffect } from 'react';
import ListFormUI from './ListFormUI';

const BlacklistForm = memo(() => {
    const [loading, setLoading] = useState(true);
    const [blacklist, setBlacklist] = useState<ListItem[]>([]);

    const _getBlacklist = async () => {
        setLoading(true);
        const blacklist = await getBlacklist(); // TODO: replace with getBlacklist (getWhitelist was just used for testing purposes)
        setBlacklist(blacklist);
        setLoading(false);
    };

    const handleSave = async (itemsToUpsert: Partial<ListItem>[]) => {
        return await upsertBlacklistItems(itemsToUpsert);
    };

    const handleDeleteOne = async (itemId: number) => {
        await deleteBlacklistItems([itemId]);
    };

    useEffect(() => {
        if (blacklist.length === 0) {
            _getBlacklist();
        }
        // eslint-disable-next-line
    }, []);

    if (loading) return null;

    return (
        <Card title="Blacklist Conditions">
            <Flex style={{ marginBottom: 8 }}>
                <Box p={1}>
                    <Typography>
                        The app will NOT track any activity that matches the following conditions:
                    </Typography>
                </Box>
            </Flex>
            <ListFormUI initialList={blacklist} onSave={handleSave} onDeleteOne={handleDeleteOne} />
            <Typography>
                <strong>Note</strong>: Adding a new condition will{' '}
                <strong>only affect new activities</strong>.
            </Typography>
        </Card>
    );
});

export default BlacklistForm;
