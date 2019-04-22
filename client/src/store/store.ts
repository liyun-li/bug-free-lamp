import { createStore, combineReducers } from 'redux';
import { IOverlay, overlayReducer } from './overlay';
import { IProfile, profileReducer } from './profile';

export interface IStore {
    overlay: IOverlay;
    profile: IProfile;
}

const reducers = {
    overlay: overlayReducer,
    profile: profileReducer
};

const rootReducer = combineReducers<IStore>(reducers);
const store = createStore(rootReducer);

export default store;