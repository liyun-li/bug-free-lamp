import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface IAlertBoxStore {
    display: boolean;
    text: string;
}

const INITIAL_STATE: IAlertBoxStore = {
    display: false,
    text: ''
}

const actionCreator = actionCreatorFactory('alertBox');
export const setAlertBox = actionCreator<IAlertBoxStore>('setAlertBox');
export const setAlertBoxDisplay = actionCreator<IAlertBoxStore['display']>('setAlertBoxDisplay');
export const setAlertBoxText = actionCreator<IAlertBoxStore['text']>('setAlertBoxText');

export const alertBoxReducer = reducerWithInitialState(INITIAL_STATE)
    .case(setAlertBox, (_state, payload): IAlertBoxStore => ({
        ...payload
    }))
    .case(setAlertBoxDisplay, (state, payload): IAlertBoxStore => ({
        ...state,
        display: payload
    }))
    .case(setAlertBoxText, (state, payload): IAlertBoxStore => ({
        ...state,
        text: payload
    }));