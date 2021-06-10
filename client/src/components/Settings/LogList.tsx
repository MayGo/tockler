import React, { useEffect, useState } from 'react';
import { Alert } from 'antd';
import { findAllLogs } from '../../services/logs-api';
import moment from 'moment';

type Log = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    type: 'ERROR' | 'WARNING';
    message?: string;
    jsonData?: string;
};

export const LogList = () => {
    const [logs, setLogs] = useState<Log[]>([]);

    const getAllLogs = async () => {
        const newLogs = await findAllLogs(
            moment()
                .subtract(1, 'day')
                .toDate(),
        );
        setLogs(newLogs);
    };

    const handleDismiss = () => {
        // TODO: handle dismissing of logs
    };

    useEffect(() => {
        if (logs.length === 0) {
            getAllLogs();
        }
        const toCancel = setTimeout(() => {
            getAllLogs();
        }, 10000);

        return () => clearTimeout(toCancel);
        // eslint-disable-next-line
    }, []);

    if (logs.length === 0) {
        return null;
    }

    return (
        <>
            {logs.map(log => (
                <Alert
                    type={
                        log.type === 'ERROR' ? 'error' : log.type === 'WARNING' ? 'warning' : 'info'
                    }
                    message={`"${log.message}" ${moment(log.updatedAt).fromNow()}`}
                    description={`${JSON.stringify(log.jsonData)} | Created at: ${moment(
                        log.createdAt,
                    ).format()}`}
                    closeText="Dismiss"
                    onClose={handleDismiss}
                    style={{ marginBottom: '16px' }}
                />
            ))}
        </>
    );
};
