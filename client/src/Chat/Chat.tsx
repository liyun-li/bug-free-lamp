import { Badge, Button, Chip, createStyles, Divider, Drawer, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, Paper, TextField, Toolbar, withStyles } from '@material-ui/core';
import { Face, KeyboardReturn, People } from '@material-ui/icons';
import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import * as io from 'socket.io-client';
import { keyCodes } from 'src/constants';
import FriendRequestDialog from 'src/FriendRequestDialog';
import { getRequest, postRequest } from 'src/httpRequest';
import { setAlertBox } from 'src/store/alertBox';
import { IMessage, setMessages } from 'src/store/chat';
import { setFriendRequestDialogDisplay, setUserSearchDialogDisplay } from 'src/store/dialog';
import { setOverlayDisplay } from 'src/store/overlay';
import { IStore } from 'src/store/store';
import { IFriend, setCurrentChat, setFriendRequests, setFriends } from 'src/store/user';
import UserSearchDialog from 'src/UserSearchDialog';
import { getServerEndpoint } from 'src/utils';

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
}

interface IChatProps extends
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> {
    classes: IChatStyles;
}

export interface IStatusMessage {
    status: string;
    message: string;
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
        marginLeft: listWidth,
        marginRight: listWidth
    },
    messagePanelGrid: {
        flexGrow: 1
    },
    inputBox: {
        margin: '16px 0 16px 16px',
        padding: 0,
        display: 'flex'
    },
    enterButton: {
        textAlign: 'center'
    },
    chatBox: {
        left: '3.2%',
        position: 'relative',
        flex: '1 1 auto',
        display: 'flex'
    }
});
// #endregion

// #region react-redux mappers
const mapStateToProps = (state: IStore) => ({
    friends: state.user.friends || [],
    messages: state.chat.messages || [],
    friendRequests: state.user.friendRequests || [],
    currentChat: state.user.currentChat
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
    setMessages: (messages: IStore['chat']['messages']) => dispatch(setMessages(messages || [])),
    setRequests: (requests: IStore['user']['friendRequests']) => dispatch(setFriendRequests(requests)),
    showUserSearchDialog: () => dispatch(setUserSearchDialogDisplay(true)),
    showFriendRequestDialog: () => dispatch(setFriendRequestDialogDisplay(true)),
    showResponse: (errorMessage: string) => {
        dispatch(setAlertBox({
            display: true,
            text: errorMessage
        }));
    },
    setOverlayDisplay: (display: boolean) => {
        dispatch(setOverlayDisplay(display));
    },
    setCurrentChat: (currentChat: IFriend) => {
        dispatch(setCurrentChat(currentChat));
    },
    getFriends: () => {
        getRequest('/chat/get').then(response => {
            const data: string[] = response.data;
            if (data) {
                const friends = data.map(friend => ({
                    username: friend,
                    publicKey: ''
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
        chatSocket: io.connect(`${getServerEndpoint()}/chat`)
    }

    componentDidMount() {
        const { getFriends, messages, setMessages } = this.props;
        const { chatSocket } = this.state;

        getFriends();

        chatSocket.on('message', (response: IMessage) => {
            const newMessages = messages;
            newMessages.push(response);
            setMessages(newMessages);
        });

        chatSocket.on('update friend list', (_response: {}) => {
            getFriends();
        });
    }

    componentWillUnmount() {
        const { chatSocket } = this.state;
        chatSocket.emit('leave_chat', {});
    }

    render() {
        const {
            classes, friends, friendRequests, setMessages,
            showUserSearchDialog, showFriendRequestDialog,
            setOverlayDisplay, showResponse, currentChat,
            setCurrentChat, messages
        } = this.props;
        const { message, chatSocket } = this.state;

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
                                <React.Fragment>
                                    <ListItem button key={friend.username}
                                        onClick={() => {
                                            setOverlayDisplay(true);

                                            chatSocket.emit('join_chat', {
                                                username: friend.username
                                            });

                                            postRequest('/chat/get', {
                                                username: friend.username
                                            }).then(response => {
                                                const messages = response.data;

                                                setCurrentChat({
                                                    username: friend.username,
                                                    publicKey: ''
                                                });
                                                setMessages(messages);
                                                setOverlayDisplay(false);
                                            }).catch(error => {
                                                if (error && error.response) {
                                                    showResponse(error.response.data);
                                                }
                                                setOverlayDisplay(false);
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
                <Paper className={classes.messagePanel}>
                    <Grid container direction='row' justify='center' alignItems='flex-end'
                        className={classes.messagePanelGrid}>
                        <div className={classes.chatBox}>
                            <Grid item xs={12}>
                                <Grid container>
                                        {messages.map(_message => {
                                            const { username, timestamp, message } = _message;
                                            return (
                                                <Grid item xs={12}>
                                                    <Chip label={`${username} [${timestamp}]: ${message}`}
                                                        color="primary" icon={<Face />} />
                                                    <br />
                                                </Grid>
                                            )
                                        })}
                                </Grid>
                            </Grid>
                        </div>

                    <Grid item xs={12}>
                        <Grid container direction='row' justify='center' alignItems='center'>
                            <Grid item xs={11}>
                                <TextField className={classes.inputBox}
                                    placeholder='Hit Enter to send text.'
                                    variant='outlined' margin='dense'
                                    onChange={(e) => this.setState({
                                        ...this.state,
                                        message: e.target.value
                                    })} value={message}
                                    onKeyDown={(e) => {
                                        if (e.keyCode === keyCodes.enter) {
                                            // Emit message to server
                                            postRequest('/chat/send', {
                                                receiver: currentChat.username,
                                                message
                                            });

                                            // Clear message box
                                            this.setState({
                                                ...this.state,
                                                message: ''
                                            });
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={1} className={classes.enterButton}>
                                <IconButton>
                                    <KeyboardReturn />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                    </Grid>
                </Paper>

                {/* Right Drawer */ }
        <Drawer variant='permanent' anchor='right' className={classes.listRight}
            classes={{
                paper: classes.paperRight
            }}>
            <Toolbar />
            <List>
                <ListItem className={classes.listHeader}>
                    <ListItemText className={classes.listHeaderText}>
                        ACTION MENU
                            </ListItemText>
                </ListItem>
                <Divider />
                <ListItem className={classes.actionItem}>
                    <UserSearchDialog />
                    <Button fullWidth color='primary' onClick={() => {
                        showUserSearchDialog();
                    }}>Search User</Button>
                </ListItem>
                <ListItem className={classes.actionItem}>
                    <Button fullWidth color='primary' onClick={() => {

                    }}>Refresh Key</Button>
                </ListItem>
                <ListItem className={classes.actionItem}>
                    <FriendRequestDialog />
                    <Button fullWidth color='primary' onClick={() => {
                        showFriendRequestDialog();
                    }}>
                        {
                            friendRequests.length && (
                                <Badge badgeContent={friendRequests.length} color='secondary'>
                                    Friend Requests
                                    </Badge>
                            ) || 'Friend Requests'
                        }

                    </Button>
                </ListItem>
            </List>
        </Drawer>
            </React.Fragment >
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Chat));