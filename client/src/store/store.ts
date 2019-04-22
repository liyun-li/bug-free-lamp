import { createStore, combineReducers } from 'redux';
import { IOverlay, overlayReducer } from './overlay';

export interface IStore {
    overlay: IOverlay
}

const reducers = {
    overlay: overlayReducer
};

const rootReducer = combineReducers<IStore>(reducers);
const store = createStore(rootReducer);

export default store;