import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface IOverlay {
    display: boolean;
}

const INITIAL_STATE: IOverlay = {
    display: false
}

const actionCreator = actionCreatorFactory('Overlay');
export const setOverlayDisplay = actionCreator<IOverlay['display']>('setOverlayDisplay');

export const overlayReducer = reducerWithInitialState(INITIAL_STATE)
    .case(setOverlayDisplay, (state: IOverlay, payload) => ({
        ...state,
        display: payload
    }));