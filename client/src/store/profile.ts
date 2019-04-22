import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface IProfile {
    signedIn: boolean;
}

const INITIAL_STATE: IProfile = {
    signedIn: false
}

const actionCreator = actionCreatorFactory('Profile');
export const setLoginStatus = actionCreator<IProfile['signedIn']>('setLoginStatus');

export const profileReducer = reducerWithInitialState(INITIAL_STATE)
    .case(setLoginStatus, (state: IProfile, payload) => ({
        ...state,
        signeIn: payload
    }));