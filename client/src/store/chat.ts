import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface IMessage {
    message: string;
    timestamp: number;
    username: string;
}

export interface IChat {
    messages: IMessage[]
}

const INITIAL_STATE: IChat = {
    messages: []
};

const actionCreator = actionCreatorFactory('Chat');
export const setMessages = actionCreator<IChat['messages']>('setMessages');


export const chatReducer = reducerWithInitialState(INITIAL_STATE)
    .case(setMessages, (state, payload): IChat => ({
        ...state,
        messages: payload
    }));