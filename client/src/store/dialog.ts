import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface IDialog {
    signInDisplay: boolean;
    signUpDisplay: boolean;
}

const INITIAL_STATE: IDialog = {
    signInDisplay: false,
    signUpDisplay: false
}

const actionCreator = actionCreatorFactory('Profile');
export const setSignInDialogDisplay = actionCreator<IDialog['signInDisplay']>('setSignInDialogDisplay');
export const setSignUpDialogDisplay = actionCreator<IDialog['signUpDisplay']>('setSignUpDialogDisplay');

export const dialogReducer = reducerWithInitialState(INITIAL_STATE)
    .case(setSignInDialogDisplay, (state, payload): IDialog => ({
        ...state,
        signInDisplay: payload
    }))
    .case(setSignUpDialogDisplay, (state, payload): IDialog => ({
        ...state,
        signUpDisplay: payload
    }));