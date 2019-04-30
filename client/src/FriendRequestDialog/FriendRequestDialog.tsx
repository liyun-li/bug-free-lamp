import { ButtonBase, Grid, Typography, withStyles, createStyles } from '@material-ui/core';
import { Done, Clear } from '@material-ui/icons';
import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import AppDialog from 'src/AppDialog/AppDialog';
import { postRequest, getRequest } from 'src/httpRequest';
import { IStore } from 'src/store';
import { setAlertBox } from 'src/store/alertBox';
import { setFriendRequestDialogDisplay } from 'src/store/dialog';
import { setOverlayDisplay } from 'src/store/overlay';
import { setFriendRequests } from 'src/store/user';


// #region interfaces
interface IFriendRequestStyles {
    dialogWidth: string;
}

interface IFriendRequestDialogProps extends
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> {
    classes: IFriendRequestStyles;
}
// #endregion

const styles = createStyles({
    dialogWidth: {
        width: 240
    }
});

// #region mappers
const mapStateToProps = (state: IStore) => ({
    display: state.dialog.friendRequestDisplay,
    requests: state.user.friendRequests || []
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
    setDisplay: (display: boolean) => {
        dispatch(setFriendRequestDialogDisplay(display));
    },
    showResponse: (errorMessage: string) => {
        dispatch(setAlertBox({
            display: true,
            text: errorMessage
        }));
    },
    setOverlayDisplay: (display: boolean) => {
        dispatch(setOverlayDisplay(display));
    },
    setRequests: (requests: IStore['user']['friendRequests']) => dispatch(setFriendRequests(requests))
});
// #endregion

class FriendRequestDialog extends React.Component<IFriendRequestDialogProps> {
    componentDidMount() {
        const { setRequests } = this.props;

        getRequest('/user/friend_requests').then(response => {
            const requests = response.data;
            setRequests(requests);
        });
    }

    render() {
        const { display, setOverlayDisplay, setDisplay, setRequests, showResponse, requests, classes } = this.props;

        return (
            <AppDialog title='Friend Requests'
                description={requests.length === 0 ? 'No friend requests' : ''}
                display={display}
                hideDisplay={() => setDisplay(false)}
                buttons={[
                    {
                        text: 'Close',
                        func: () => setDisplay(false)
                    }
                ]}
            >
                <div className={classes.dialogWidth}>
                    {
                        requests.map(request => (
                            <Grid container alignItems='center'>
                                <Grid item xs={8}><Typography>{request}</Typography></Grid>
                                <Grid item xs={2}>
                                    <ButtonBase onClick={() => {
                                        setOverlayDisplay(true);
                                        postRequest('/user/accept', { username: request })
                                            .then(response => {
                                                const message = response.data;
                                                if (message) {
                                                    showResponse(message);
                                                }
                                                setDisplay(false);

                                                getRequest('/user/friend_requests').then(response => {
                                                    const requests = response.data;
                                                    setRequests(requests);
                                                });
                                            })
                                            .catch(error => {
                                                const response = error.response;
                                                if (response && response.data) {
                                                    showResponse(response.data);
                                                }
                                            })
                                            .finally(() => {
                                                setOverlayDisplay(false);
                                            });
                                    }}><Done /></ButtonBase>
                                </Grid>
                                <Grid xs={2}>
                                    <ButtonBase onClick={() => {
                                        setOverlayDisplay(true);
                                        postRequest('/user/reject', { username: request })
                                            .then(response => {
                                                const message = response.data;
                                                if (message) {
                                                    showResponse(message);
                                                }
                                            })
                                            .catch(error => {
                                                const response = error.response;
                                                if (response && response.data) {
                                                    showResponse(response.data);
                                                }
                                            })
                                            .finally(() => {
                                                setOverlayDisplay(false);
                                            });
                                    }}><Clear /></ButtonBase>
                                </Grid>
                            </Grid>
                        ))
                    }
                </div>
            </AppDialog>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FriendRequestDialog));