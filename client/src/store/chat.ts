import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface IMessage {
    message: string;
    timestamp: number;
    username: string;
}

export interface IChatStore {
    messages: IMessage[]
}

const INITIAL_STATE: IChatStore = {
    messages: []
};

const actionCreator = actionCreatorFactory('Chat');
export const setMessages = actionCreator<IChatStore['messages']>('setMessages');


export const chatReducer = reducerWithInitialState(INITIAL_STATE)
    .case(setMessages, (state, payload): IChatStore => ({
        ...state,
        messages: payload
    }));