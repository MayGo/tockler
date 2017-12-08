import { Action } from 'redux';

export default interface IBaseAction extends Action {
  type: string;
  payload?: any;
};
