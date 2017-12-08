export default interface IMapStateToProps<
  TStateProps,
  IReturnedStateProps,
  TOwnProps
> {
  (state: TStateProps, ownProps?: TOwnProps): IReturnedStateProps;
};
