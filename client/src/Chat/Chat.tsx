import { Badge, Button, createStyles, Divider, Drawer, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, Paper, TextField, Toolbar, withStyles } from '@material-ui/core';
import { KeyboardReturn, People } from '@material-ui/icons';
import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import * as io from 'socket.io-client';
import { keyCodes } from 'src/constants';
import FriendRequestDialog from 'src/FriendRequestDialog';
import { getRequest, postRequest } from 'src/httpRequest';
import { setFriendRequestDialogDisplay, setUserSearchDialogDisplay } from 'src/store/dialog';
import { IStore } from 'src/store/store';
import { setFriends, setFriendRequests } from 'src/store/user';
import UserSearchDialog from 'src/UserSearchDialog';
import { getServerEndpoint } from 'src/utils';
import { setMessages, IMessage } from 'src/store/chat';
import { setAlertBox } from 'src/store/alertBox';
import { setOverlayDisplay } from 'src/store/overlay';

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
}

interface IChatProps extends
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> {
    classes: IChatStyles;
}

interface IStatusMessage {
    status: string;
    message: string;
}

interface IChatState {
    message: string;
    chatSocket: SocketIOClientStatic['Socket'];
    updateSocket: SocketIOClientStatic['Socket'];
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
    }
});
// #endregion

// #region react-redux mappers
const mapStateToProps = (state: IStore) => ({
    friends: state.user.friends || [],
    messages: state.chat.messages || [],
    friendRequests: state.user.friendRequests || []
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
    setFriends: (friends: IStore['user']['friends']) => dispatch(setFriends(friends || [])),
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
    }
});
// #endregion

class Chat extends React.Component<IChatProps, IChatState> {
    constructor(props: IChatProps) {
        super(props);

        const { messages, setRequests, setMessages } = props;

        const chatSocket = io.connect(`${getServerEndpoint()}/chat`);
        const updateSocket = io.connect(`${getServerEndpoint()}/me`);

        chatSocket.on('message', (response: IMessage) => {
            const newMessages = messages;
            newMessages.push(response);
            setMessages(newMessages);
        });

        updateSocket.on('update_friend_request', (_response: {}) => {
            console.log('fdsa');
            getRequest('/user/friend_requests').then(response => {
                const requests = response.data;
                setRequests(requests);
            });
        });

        this.state = {
            message: '',
            chatSocket,
            updateSocket
        };
    }

    componentDidMount() {
        const { setFriends, showResponse } = this.props;
        const { updateSocket } = this.state;
        getRequest('/chat/get').then(response => {
            const data: string[] = response.data;
            if (data) {
                const friends = data.map(friend => ({
                    username: friend,
                    publicKey: ''
                }));

                if (friends) {
                    setFriends(friends);
                }
            }
        });

        updateSocket.emit('login', {}, (response: IStatusMessage | undefined) => {
            if (response && response.status === 'error') {
                showResponse(response.message || 'ERROR');
            }
        });
    }

    componentWillUnmount() {
        const { chatSocket: socket } = this.state;
        socket.emit('leave_chat');
    }

    render() {
        const {
            classes, friends, friendRequests, setMessages,
            showUserSearchDialog, showFriendRequestDialog,
            setOverlayDisplay, showResponse
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

                                            postRequest('/chat/join', {
                                                username: friend.username
                                            }).then(_response => {
                                                postRequest('/chat/get', {
                                                    username: friend.username
                                                }).then(response => {
                                                    setMessages(response.data);
                                                    setOverlayDisplay(false);
                                                });
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
                                                chatSocket.emit('message', message);

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

                {/* Right Drawer */}
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
            </React.Fragment>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Chat));