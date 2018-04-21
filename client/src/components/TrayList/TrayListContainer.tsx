import { connect } from 'dva';
import { TrayList } from './TrayList';
import { toJS } from '../ToJS';

const mapStateToProps = ({ tray, loading }: any) => ({
    lastLogItems: tray.get('lastLogItems'),
    runningLogItem: tray.get('runningLogItem'),
    loading: loading.models.tray,
});

export const TrayListContainer = connect(mapStateToProps)(toJS(TrayList));
