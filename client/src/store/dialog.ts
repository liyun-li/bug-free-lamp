import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface IDialog {
    signInDisplay: boolean;
    signUpDisplay: boolean;
    userSearchDisplay: boolean;
}

const INITIAL_STATE: IDialog = {
    signInDisplay: false,
    signUpDisplay: false,
    userSearchDisplay: false
}

const actionCreator = actionCreatorFactory('Dialog');
export const setSignInDialogDisplay = actionCreator<IDialog['signInDisplay']>('setSignInDialogDisplay');
export const setSignUpDialogDisplay = actionCreator<IDialog['signUpDisplay']>('setSignUpDialogDisplay');
export const setUserSearchDialogDisplay = actionCreator<IDialog['userSearchDisplay']>('setUserSearchDialogDisplay');

export const dialogReducer = reducerWithInitialState(INITIAL_STATE)
    .case(setSignInDialogDisplay, (state, payload): IDialog => ({
        ...state,
        signInDisplay: payload
    }))
    .case(setSignUpDialogDisplay, (state, payload): IDialog => ({
        ...state,
        signUpDisplay: payload
    }))
    .case(setUserSearchDialogDisplay, (state, payload): IDialog => ({
        ...state,
        userSearchDisplay: payload
    }));