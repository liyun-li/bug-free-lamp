import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface IFriend {
    username: string;
    publicKey: string;
}

export interface IUser {
    signedIn: boolean;
    friends: IFriend[];
}

const INITIAL_STATE: IUser = {
    signedIn: false,
    friends: []
}

const actionCreator = actionCreatorFactory('User');
export const setLoginStatus = actionCreator<IUser['signedIn']>('setLoginStatus');
export const setFriends = actionCreator<IUser['friends']>('setFriends');


export const userReducer = reducerWithInitialState(INITIAL_STATE)
    .case(setLoginStatus, (state, payload): IUser => ({
        ...state,
        signedIn: payload
    }))
    .case(setFriends, (state, payload): IUser => ({
        ...state,
        friends: payload
    }));