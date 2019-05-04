import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface IDialogStore {
    signInDisplay: boolean;
    signUpDisplay: boolean;
    userSearchDisplay: boolean;
    friendRequestDisplay: boolean;
}

const INITIAL_STATE: IDialogStore = {
    signInDisplay: false,
    signUpDisplay: false,
    userSearchDisplay: false,
    friendRequestDisplay: false
};

const actionCreator = actionCreatorFactory('Dialog');
export const setSignInDialogDisplay = actionCreator<IDialogStore['signInDisplay']>('setSignInDialogDisplay');
export const setSignUpDialogDisplay = actionCreator<IDialogStore['signUpDisplay']>('setSignUpDialogDisplay');
export const setUserSearchDialogDisplay = actionCreator<IDialogStore['userSearchDisplay']>('setUserSearchDialogDisplay');
export const setFriendRequestDialogDisplay = actionCreator<IDialogStore['friendRequestDisplay']>('setFriendRequestDialogDisplay');

export const dialogReducer = reducerWithInitialState(INITIAL_STATE)
    .case(setSignInDialogDisplay, (state, payload): IDialogStore => ({
        ...state,
        signInDisplay: payload
    }))
    .case(setSignUpDialogDisplay, (state, payload): IDialogStore => ({
        ...state,
        signUpDisplay: payload
    }))
    .case(setUserSearchDialogDisplay, (state, payload): IDialogStore => ({
        ...state,
        userSearchDisplay: payload
    }))
    .case(setFriendRequestDialogDisplay, (state, payload): IDialogStore => ({
        ...state,
        friendRequestDisplay: payload
    }));