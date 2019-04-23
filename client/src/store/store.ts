import { combineReducers, createStore } from 'redux';
import { alertBoxReducer, IAlertBox } from './alertBox';
import { dialogReducer, IDialog } from './dialog';
import { IOverlay, overlayReducer } from './overlay';
import { IProfile, profileReducer } from './profile';

export interface IStore {
    overlay: IOverlay;
    profile: IProfile;
    dialog: IDialog;
    alertBox: IAlertBox;
}

const reducers = {
    overlay: overlayReducer,
    profile: profileReducer,
    dialog: dialogReducer,
    alertBox: alertBoxReducer
};

const rootReducer = combineReducers<IStore>(reducers);
const store = createStore(rootReducer);

export default store;