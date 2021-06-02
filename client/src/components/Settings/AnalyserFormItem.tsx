import React, { useState } from 'react';
import { useFormState } from 'react-use-form-state';
import { testAnalyserItem } from './AnalyserForm.util';
import { AiOutlineDelete } from 'react-icons/ai';
import { IconButton } from '@chakra-ui/button';
import { Input } from '@chakra-ui/input';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Switch } from '@chakra-ui/switch';
import { Box, Divider, Flex } from '@chakra-ui/layout';

const AnalyserTestItem = ({ item }) => (
    <Box>
        <Box>
            <b>{item.title}</b>
        </Box>
        <Flex>
            <span>{item.findRe}</span> <i>|</i>
            <span>{item.takeGroup}</span> <i>|</i>
            <span>{item.takeTitle}</span>
        </Flex>
    </Box>
);

export const AnalyserFormItem = ({ analyserItem, removeItem, appItems, saveItem }) => {
    const [showTests, setShowTests] = useState(false);
    const toggleShowTests = () => {
        setShowTests(!showTests);
    };

    const [, { text, raw }] = useFormState(analyserItem, {
        onChange: (__ignore, ___ignore, nextStateValues) => {
            saveItem(nextStateValues);
        },
    });

    const check = raw('enabled');

    return (
        <div>
            <Flex justifyContent="space-between">
                <Flex pr={4}>
                    <Box p={1}>
                        <Input placeholder="Task" {...text({ name: 'findRe' })} minWidth={200} />
                    </Box>
                    <Box p={1}>
                        <Input
                            placeholder="Group"
                            {...text({ name: 'takeGroup' })}
                            minWidth={200}
                        />
                    </Box>
                    <Box p={1}>
                        <Input
                            placeholder="Title"
                            {...text({ name: 'takeTitle' })}
                            minWidth={200}
                        />
                    </Box>
                </Flex>
                <FormControl display="flex" alignItems="center" py={2} minWidth={100}>
                    <FormLabel htmlFor="active" mb="0">
                        Active
                    </FormLabel>
                    <Switch
                        id="active"
                        onChange={value => {
                            check.onChange(value);
                        }}
                        checked={check.value}
                    />
                </FormControl>
                <FormControl display="flex" alignItems="center" py={2} minWidth={100}>
                    <FormLabel htmlFor="test" mb="0">
                        Test
                    </FormLabel>
                    <Switch id="test" onChange={toggleShowTests} />
                </FormControl>

                <IconButton icon={<AiOutlineDelete />} onClick={removeItem} aria-label="Add Item" />
            </Flex>

            {showTests && (
                <Box>
                    <Divider />

                    {testAnalyserItem(appItems, analyserItem).map((item: any) => (
                        <AnalyserTestItem item={item} key={item.title} />
                    ))}
                </Box>
            )}
        </div>
    );
};
