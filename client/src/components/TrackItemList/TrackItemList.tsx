import * as React from 'react';
import { withStyles } from 'material-ui/styles';
import { StyleRulesCallback } from 'material-ui/styles/withStyles';
import { ITrackItem } from '../../@types/ITrackItem';
import Table, {
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import { Theme } from 'material-ui/styles/createMuiTheme';

const styles: StyleRulesCallback = (theme: Theme) => ({
    root: {
        width: '100%',
        marginTop: theme.spacing.unit * 3,
        overflowX: 'auto'
    },
    table: {
        minWidth: 500
    }
});

interface IHocProps {
    classes: {
        root: any;
        table: any;
    };
}

interface IProps {
    className?: string;
    trackItems: ITrackItem[];
}

type IFullProps = IProps & IHocProps;

function BasicTable({ classes, className, trackItems }: IFullProps) {
    if (!trackItems) {
        return <div>No TrackItems</div>;
    }

    return (
        <Paper className={classes.root}>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>App</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Begin</TableCell>
                        <TableCell>End</TableCell>
                        <TableCell>Color</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {trackItems.map(n => {
                        return (
                            <TableRow key={n.id}>
                                <TableCell>{n.taskName}</TableCell>
                                <TableCell>{n.app}</TableCell>
                                <TableCell>{n.title}</TableCell>
                                <TableCell>{n.beginDate}</TableCell>
                                <TableCell>{n.endDate}</TableCell>
                                <TableCell>{n.color}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Paper>
    );
}

export const TrackItemList = withStyles(styles, { name: 'TrackItemList' })<
    IProps
>(BasicTable);
