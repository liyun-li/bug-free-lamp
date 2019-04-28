import { combineReducers, createStore } from 'redux';
import { alertBoxReducer, IAlertBox } from './alertBox';
import { dialogReducer, IDialog } from './dialog';
import { IOverlay, overlayReducer } from './overlay';
import { IUser, userReducer } from './user';
import { IChat, chatReducer } from './chat';

export interface IStore {
    overlay: IOverlay;
    user: IUser;
    dialog: IDialog;
    alertBox: IAlertBox;
    chat: IChat;
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