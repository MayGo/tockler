export interface ITrackItem {
    id: number;
    taskName?: string;
    beginDate: number;
    endDate: number;
    app: string;
    title?: string;
    color?: string;
    url?: string;
}

export interface NewTrackItem extends Omit<ITrackItem, 'id'> {
    id?: number;
}

export interface SelectedTrackItem extends Omit<ITrackItem, 'id'> {
    id?: number;
}
/*
  beginDate: 2017-12-08T07:15:49.792Z,
  endDate: 2017-12-08T07:15:52.792Z,
  app: 'Code',
  title: 'ITrackItem.ts — tockler',
  color: '#fcd1c7'
*/
