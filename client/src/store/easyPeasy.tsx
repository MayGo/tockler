import { createTypedHooks } from 'easy-peasy';
import { StoreModel } from './mainStore';
import { TrayStoreModel } from './trayStore';

// Create typed hooks for the main store
const mainTypedHooks = createTypedHooks<StoreModel>();

export const useStoreActions = mainTypedHooks.useStoreActions;
export const useStoreDispatch = mainTypedHooks.useStoreDispatch;
export const useStoreState = mainTypedHooks.useStoreState;

// Create typed hooks for the tray store
const trayTypedHooks = createTypedHooks<TrayStoreModel>();

export const useTrayStoreActions = trayTypedHooks.useStoreActions;
export const useTrayStoreDispatch = trayTypedHooks.useStoreDispatch;
export const useTrayStoreState = trayTypedHooks.useStoreState;
