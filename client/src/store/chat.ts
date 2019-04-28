import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface IChat {
    messages: []
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