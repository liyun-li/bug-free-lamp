import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface IAlertBox {
    display: boolean;
    text: string;
}

const INITIAL_STATE: IAlertBox = {
    display: false,
    text: ''
}

const actionCreator = actionCreatorFactory('Profile');
export const setAlertBox = actionCreator<IAlertBox>('setAlertBox');
export const setAlertBoxDisplay = actionCreator<IAlertBox['display']>('setAlertBoxDisplay');
export const setAlertBoxText = actionCreator<IAlertBox['text']>('setAlertBoxText');

export const alertBoxReducer = reducerWithInitialState(INITIAL_STATE)
    .case(setAlertBox, (_state, payload): IAlertBox => ({
        ...payload
    }))
    .case(setAlertBoxDisplay, (state, payload): IAlertBox => ({
        ...state,
        display: payload
    }))
    .case(setAlertBoxText, (state, payload): IAlertBox => ({
        ...state,
        text: payload
    }));