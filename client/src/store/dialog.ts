import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface IDialog {
    display: boolean;
}

const INITIAL_STATE: IDialog = {
    display: false
}

const actionCreator = actionCreatorFactory('Profile');
export const setDialogDisplay = actionCreator<IDialog['display']>('setLoginStatus');

export const dialogReducer = reducerWithInitialState(INITIAL_STATE)
    .case(setDialogDisplay, (state: IDialog, payload) => ({
        ...state,
        display: payload
    }));