import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface IOverlayStore {
    display: boolean;
}

const INITIAL_STATE: IOverlayStore = {
    display: false
}

const actionCreator = actionCreatorFactory('Overlay');
export const setOverlayDisplay = actionCreator<IOverlayStore['display']>('setOverlayDisplay');

export const overlayReducer = reducerWithInitialState(INITIAL_STATE)
    .case(setOverlayDisplay, (state: IOverlayStore, payload) => ({
        ...state,
        display: payload
    }));