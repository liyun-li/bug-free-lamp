import { Chip, createStyles, Divider, Drawer, Grid, List, ListItem, ListItemIcon, ListItemText, Paper, TextField, Toolbar, withStyles } from '@material-ui/core';
import { Face, People } from '@material-ui/icons';
import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import * as io from 'socket.io-client';
import { keyCodes } from 'src/constants';
import { getRequest, postRequest, SERVER_URL } from 'src/httpRequest';
import { setAlertBox } from 'src/store/alertBox';
import { IMessage, setMessages, IMessageModel } from 'src/store/chat';
import { setOverlayDisplay } from 'src/store/overlay';
import { IStore } from 'src/store/store';
import { IUser, setCurrentChat, setFriendRequests, setFriends } from 'src/store/user';
import { RouteComponentProps } from 'react-router-dom';
import { encryptMessage, decryptMessage } from 'src/utils';

// #region interfaces
interface IChatStyles {
    listLeft: string;
    listRight: string;
    paperLeft: string;
    paperRight: string;
    listHeader: string;
    listHeaderText: string;
    actionItem: string;
    messagePanel: string;
    messagePanelGrid: string;
    inputBox: string;
    enterButton: string;
    chatBox: string;
    message: string;
}

interface IChatProps extends
    RouteComponentProps,
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> {
    classes: IChatStyles;
}

interface IChatState {
    message: string;
    chatSocket: SocketIOClientStatic['Socket'];
}
// #endregion

// #region styles
const listWidth = 240;

const styles = createStyles({
    listLeft: {
        width: listWidth,
        flexShrink: 0
    },
    paperLeft: {
        width: listWidth
    },
    listRight: {
        width: listWidth,
        flexShrink: 0
    },
    paperRight: {
        width: listWidth
    },
    listHeader: {
        textAlign: 'center',
        height: '72px'
    },
    listHeaderText: {
        paddingRight: 0
    },
    actionItem: {
        textAlign: 'center'
    },
    messagePanel: {
        flex: '1 1 auto',
        display: 'flex',
        marginLeft: listWidth
    },
    messagePanelGrid: {
        flexGrow: 1
    },
    inputBox: {
        margin: 16,
        padding: 0,
        display: 'flex'
    },
    enterButton: {
        textAlign: 'center'
    },
    chatBox: {
        left: 16,
        position: 'relative',
        maxWidth: '45%'
    },
    message: {
        marginTop: 8
    }
});
// #endregion

// #region react-redux mappers
const mapStateToProps = (state: IStore) => ({
    friends: state.user.friends || [],
    messages: state.chat.messages || [],
    currentChat: state.user.currentChat,
    me: state.user.me
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
    setMessages: (messages: IStore['chat']['messages']) => dispatch(setMessages(messages || [])),
    setRequests: (requests: IStore['user']['friendRequests']) => dispatch(setFriendRequests(requests)),
    showResponse: (errorMessage: string) => {
        dispatch(setAlertBox({
            display: true,
            text: errorMessage
        }));
    },
    setOverlayDisplay: (display: boolean) => {
        dispatch(setOverlayDisplay(display));
    },
    setCurrentChat: (currentChat: IUser) => {
        dispatch(setCurrentChat(currentChat));
    },
    getFriends: () => {
        getRequest('/chat/get').then(response => {
            const data: IUser[] = response.data;
            if (data) {
                const friends = data.map(friend => ({
                    username: friend.username,
                    publicKey: friend.publicKey || '',
                    mood: friend.mood || '',
                    status: friend.status || ''
                }));

                if (friends) {
                    dispatch(setFriends(friends));
                }
            }
        });
    }
});
// #endregion

class Chat extends React.Component<IChatProps, IChatState> {
    state = {
        message: '',
        chatSocket: io.connect(`${SERVER_URL}/chat`)
    }

    // #region componentDidMount
    componentDidMount() {
        const { getFriends, setMessages, me } = this.props;
        const { chatSocket } = this.state;

        getFriends();

        chatSocket.on('get new message', (response: IMessageModel) => {
            const newMessages = [...this.props.messages];
            console.log(response.sender);
            console.log(me.username);
            newMessages.push({
                ...response,
                message: decryptMessage(
                    response.sender === me.username
                        ? response.messageForSender
                        : response.messageForReceiver,
                    localStorage.getItem('Not Important')!
                )
            });
            setMessages(newMessages);
        });

        chatSocket.on('update friend list', (_response: {}) => {
            getFriends();
        });
    }
    // #endregion

    // #region componentWillUnmount
    componentWillUnmount() {
        const { chatSocket } = this.state;
        chatSocket.emit('leave_chat', {});
    }
    // #endregion

    render() {
        const {
            classes, friends, setMessages, setOverlayDisplay, showResponse,
            currentChat, setCurrentChat, messages, me
        } = this.props;
        const { message, chatSocket } = this.state;

        const chatMessages = messages.map(_message => {
            const { sender, timestamp, message } = _message;
            return (
                <Grid item xs={12} key={`${timestamp}`}>
                    <Chip label={`${sender} [${timestamp}]: ${message}`}
                        color="primary" icon={<Face />}
                        className={classes.message}
                    />
                </Grid>
            )
        });

        return (
            <React.Fragment>
                {/* Left Drawer */}
                <Drawer variant='permanent' className={classes.listLeft}
                    classes={{
                        paper: classes.paperLeft
                    }}>
                    <Toolbar />
                    <List>
                        <ListItem className={classes.listHeader}>
                            <ListItemText className={classes.listHeaderText}>
                                INBOX
                            </ListItemText>
                        </ListItem>
                        <Divider />
                        {
                            friends.map(friend => (
                                <React.Fragment key={friend.username}>
                                    <ListItem button
                                        selected={currentChat.username === friend.username}
                                        onClick={() => {
                                            setOverlayDisplay(true);

                                            chatSocket.emit('join_chat', {
                                                username: friend.username
                                            });

                                            postRequest('/chat/get', {
                                                username: friend.username
                                            }).then(response => {
                                                const messages: IMessageModel[] = response.data;
                                                const decryptedMessages: IMessage[] = [];

                                                (messages || []).forEach(message => {
                                                    try {
                                                        decryptedMessages.push({
                                                            ...message,
                                                            message: decryptMessage(
                                                                message.sender === me.username
                                                                    ? message.messageForSender
                                                                    : message.messageForReceiver,
                                                                localStorage.getItem('Not Important')!
                                                            )
                                                        });
                                                    } catch (error) {
                                                        console.error(error);
                                                    }
                                                });

                                                setMessages(decryptedMessages);
                                                setOverlayDisplay(false);
                                            }).catch(error => {
                                                if (error && error.response) {
                                                    showResponse(error.response.data);
                                                }
                                                setMessages([]);
                                                setOverlayDisplay(false);
                                            }).finally(() => {
                                                setCurrentChat({
                                                    username: friend.username,
                                                    publicKey: friend.publicKey || '',
                                                    mood: friend.mood || '',
                                                    status: friend.status || ''
                                                });
                                            });
                                        }}
                                    >
                                        <ListItemIcon><People /></ListItemIcon>
                                        <ListItemText>{friend.username}</ListItemText>
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            ))
                        }
                    </List>
                </Drawer>

                {/* Chat Panel */}
                {
                    (currentChat || {}).username &&
                    <Paper className={classes.messagePanel}>
                        <Grid container direction='row' justify='center' alignItems='flex-end'
                            className={classes.messagePanelGrid}>
                            <Grid item xs={12}>
                                <Grid container direction='row' justify='center' alignItems='center'>
                                    <Grid item xs={12}>
                                        <div className={classes.chatBox}>
                                            {chatMessages}
                                        </div>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField className={classes.inputBox}
                                            placeholder='Hit Enter to send text.'
                                            variant='outlined' margin='dense'
                                            onChange={(e) => this.setState({
                                                ...this.state,
                                                message: e.target.value
                                            })} value={message}
                                            onKeyDown={(e) => {
                                                if (e.keyCode === keyCodes.enter && currentChat.publicKey && me.publicKey) {
                                                    setOverlayDisplay(true);
                                                    // Emit message to server
                                                    postRequest('/chat/send', {
                                                        receiver: currentChat.username,
                                                        messageForReceiver: encryptMessage(message, currentChat.publicKey),
                                                        messageForSender: encryptMessage(message, me.publicKey)
                                                    }).then(() => {
                                                        setOverlayDisplay(false);
                                                        // Clear message box
                                                        this.setState({
                                                            ...this.state,
                                                            message: ''
                                                        });
                                                    });
                                                } else if (!me.publicKey) {
                                                    showResponse('Your public key is empty.');
                                                } else if (!currentChat.publicKey) {
                                                    showResponse('Your friend does not have a public key.')
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Paper>
                }
            </React.Fragment >
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Chat));