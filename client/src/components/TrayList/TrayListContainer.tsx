import { connect } from 'dva';
import { TrayList } from './TrayList';

const mapStateToProps = ({ tray, loading }: any) => ({
    lastLogItems: tray.lastLogItems,
    runningLogItem: tray.runningLogItem,
    loading: loading.models.tray,
});

export const TrayListContainer = connect(mapStateToProps)(TrayList);
