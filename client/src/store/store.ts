import { createStore, combineReducers } from 'redux';

export interface IStore {

}

const reducers = {

};

const rootReducer = combineReducers<IStore>(reducers);
const store = createStore(rootReducer);

export default store;