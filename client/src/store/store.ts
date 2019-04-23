import { createStore, combineReducers } from 'redux';
import { IOverlay, overlayReducer } from './overlay';
import { IProfile, profileReducer } from './profile';
import { dialogReducer, IDialog } from './dialog';

export interface IStore {
    overlay: IOverlay;
    profile: IProfile;
    dialog: IDialog;
}

const reducers = {
    overlay: overlayReducer,
    profile: profileReducer,
    dialog: dialogReducer
};

const rootReducer = combineReducers<IStore>(reducers);
const store = createStore(rootReducer);

export default store;