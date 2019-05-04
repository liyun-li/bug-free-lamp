import { combineReducers, createStore, applyMiddleware, Dispatch } from 'redux';
import { alertBoxReducer, IAlertBoxStore, setAlertBox } from './alertBox';
import { dialogReducer, IDialogStore } from './dialog';
import { IOverlayStore, overlayReducer, setOverlayDisplay } from './overlay';
import { IUserStore, userReducer, IUser, setMe } from './user';
import { IChatStore, chatReducer } from './chat';
import thunk from 'redux-thunk';

export interface IStore {
    overlay: IOverlayStore;
    user: IUserStore;
    dialog: IDialogStore;
    alertBox: IAlertBoxStore;
    chat: IChatStore;
}

export const globalStateProps = (state: IStore) => ({
    signedIn: state.user.signedIn,
    me: state.user.me
});

export const globalDispatchProps = (dispatch: Dispatch) => ({
    setOverlayDisplay: (display: boolean) => {
        dispatch(setOverlayDisplay(display));
    },
    setAlertBox: (alertBox: IAlertBoxStore) => {
        dispatch(setAlertBox(alertBox));
    },
    setMe: (me: IUser) => {
        dispatch(setMe(me));
    }
});

const reducers = {
    overlay: overlayReducer,
    user: userReducer,
    dialog: dialogReducer,
    alertBox: alertBoxReducer,
    chat: chatReducer
};

const rootReducer = combineReducers<IStore>(reducers);
const store = createStore(
    rootReducer,
    applyMiddleware(thunk)
);

export default store;