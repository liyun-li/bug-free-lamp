import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface IOverlay {
    display: boolean;
}

const INITIAL_STATE: IOverlay = {
    display: false
}

const actionCreator = actionCreatorFactory('Profile');
export const setOverlayDisplay = actionCreator<IOverlay['display']>('setLoginStatus');

export const overlayReducer = reducerWithInitialState(INITIAL_STATE)
    .case(setOverlayDisplay, (state: IOverlay, payload) => ({
        ...state,
        display: payload
    }));