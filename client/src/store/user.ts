import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface IUser {
    username: string;
    publicKey: string;
    mood: string;
    status: string;
}

export interface IUserStore {
    signedIn: boolean;
    friends: IUser[];
    friendRequests: string[];
    currentChat: IUser;
    me: IUser;
}

const INITIAL_STATE: IUserStore = {
    signedIn: false,
    friends: [],
    friendRequests: [],
    currentChat: {
        username: '',
        publicKey: '',
        mood: '',
        status: ''
    },
    me: {
        username: '',
        publicKey: '',
        mood: '',
        status: ''
    }
};

const actionCreator = actionCreatorFactory('User');
export const setLoginStatus = actionCreator<IUserStore['signedIn']>('setLoginStatus');
export const setFriends = actionCreator<IUserStore['friends']>('setFriends');
export const setFriendRequests = actionCreator<IUserStore['friendRequests']>('setFriendRequests');
export const setCurrentChat = actionCreator<IUserStore['currentChat']>('setCurrentChat');
export const setMe = actionCreator<IUserStore['me']>('setMe');


export const userReducer = reducerWithInitialState(INITIAL_STATE)
    .case(setLoginStatus, (state, payload): IUserStore => ({
        ...state,
        signedIn: payload
    }))
    .case(setFriends, (state, payload): IUserStore => ({
        ...state,
        friends: payload
    }))
    .case(setFriendRequests, (state, payload): IUserStore => ({
        ...state,
        friendRequests: payload
    }))
    .case(setCurrentChat, (state, payload): IUserStore => ({
        ...state,
        currentChat: payload
    }))
    .case(setMe, (state, payload): IUserStore => ({
        ...state,
        me: payload
    }));