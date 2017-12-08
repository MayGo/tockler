import IBaseAction from './IBaseAction';

type IBaseReducer<T> = (state?: T, action?: IBaseAction) => T;

export default IBaseReducer;
