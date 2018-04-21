import { connect } from 'dva';
import { TrayMenu } from './TrayMenu';

export const TrayMenuContainer = connect()(TrayMenu);
