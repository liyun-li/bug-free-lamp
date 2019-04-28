import { Button, createStyles, Divider, Drawer, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, Paper, TextField, Toolbar, withStyles } from '@material-ui/core';
import { People, KeyboardReturn } from '@material-ui/icons';
import * as React from 'react';
import { keyCodes } from 'src/constants';
import * as io from 'socket.io-client';
import { getServerEndpoint } from 'src/utils';
import { getRequest } from 'src/httpRequest';
import { IStore } from 'src/store/store';
import { Action, Dispatch } from 'redux';
import { setFriends } from 'src/store/user';
import { connect } from 'react-redux';
import UserSearchDialog from 'src/UserSearchDialog';
import { setUserSearchDialogDisplay } from 'src/store/dialog';

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

interface IMessageResponse {
    message: string;
    timestamp: number;
    username: string;
}

interface IChatState {
    message: string;
    socket: SocketIOClientStatic['Socket'];
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
    friends: state.user.friends
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
    setFriends: (friends: IStore['user']['friends']) => dispatch(setFriends(friends)),
    setUserSearchDialogDisplay: (display: boolean) => dispatch(setUserSearchDialogDisplay(display))
});
// #endregion

class Chat extends React.Component<IChatProps, IChatState> {
    constructor(props: IChatProps) {
        super(props);

        const socket = io.connect(`${getServerEndpoint()}/chat`);
        socket.on('message', (response: IMessageResponse) => {
            console.log(response);
        });

        this.state = {
            message: '',
            socket
        };
    }

    componentDidMount() {
        const { setFriends } = this.props;
        getRequest('/chat/get').then(response => {
            const friends = response.data;
            if (friends)
                setFriends(friends);
        });
    }

    componentWillUnmount() {
        const { socket } = this.state;
        socket.emit('leave_chat');
    }

    render() {
        const { classes, friends, setUserSearchDialogDisplay } = this.props;
        const { message, socket } = this.state;

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
                                    <ListItem button key={friend.username}>
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
                                                socket.emit('message', message);

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
                                setUserSearchDialogDisplay(true);
                            }}>Search User</Button>
                        </ListItem>
                        <ListItem className={classes.actionItem}>
                            <Button fullWidth color='primary' onClick={() => {
                                
                            }}>Refresh Key</Button>
                        </ListItem>
                    </List>
                </Drawer>
            </React.Fragment>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Chat));