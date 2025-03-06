import { createTypedHooks } from 'easy-peasy';
import { StoreModel } from './mainStore';

// Create typed hooks for the main store
const mainTypedHooks = createTypedHooks<StoreModel>();

export const useStoreActions = mainTypedHooks.useStoreActions;
export const useStoreDispatch = mainTypedHooks.useStoreDispatch;
export const useStoreState = mainTypedHooks.useStoreState;
