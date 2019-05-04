import { combineReducers, createStore } from 'redux';
import { alertBoxReducer, IAlertBoxStore } from './alertBox';
import { dialogReducer, IDialogStore } from './dialog';
import { IOverlayStore, overlayReducer } from './overlay';
import { IUserStore, userReducer } from './user';
import { IChatStore, chatReducer } from './chat';

export interface IStore {
    overlay: IOverlayStore;
    user: IUserStore;
    dialog: IDialogStore;
    alertBox: IAlertBoxStore;
    chat: IChatStore;
}

const reducers = {
    overlay: overlayReducer,
    user: userReducer,
    dialog: dialogReducer,
    alertBox: alertBoxReducer,
    chat: chatReducer
};

const rootReducer = combineReducers<IStore>(reducers);
const store = createStore(rootReducer);

export default store;