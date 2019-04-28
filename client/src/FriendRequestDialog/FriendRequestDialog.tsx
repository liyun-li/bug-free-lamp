import { ButtonBase, Grid, Typography } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import AppDialog from 'src/AppDialog/AppDialog';
import { postRequest, getRequest } from 'src/httpRequest';
import { IStore } from 'src/store';
import { setAlertBox } from 'src/store/alertBox';
import { setFriendRequestDialogDisplay } from 'src/store/dialog';
import { setOverlayDisplay } from 'src/store/overlay';


// #region interfaces
interface IFriendRequestDialogProps extends
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> { }

interface IFriendRequestDialogState {
    requests: {
        username: string;
    }[];
}
// #endregion

// #region mappers
const mapStateToProps = (state: IStore) => ({
    display: state.dialog.friendRequestDisplay
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
    }
});
// #endregion

class FriendRequestDialog extends React.Component<IFriendRequestDialogProps, IFriendRequestDialogState> {
    state: IFriendRequestDialogState = {
        requests: []
    }

    componentDidMount() {
        getRequest('/user/friend_requests').then(response => {
            const { requests } = response.data;
            console.log(requests);
        });
    }

    render() {
        const { display, setOverlayDisplay, setDisplay, showResponse } = this.props;
        const { requests } = this.state;

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
                {
                    requests.map(request => (
                        <Grid container justify='center' alignItems='center'>
                            <Grid item xs={8}><Typography>{request.username}</Typography></Grid>
                            <Grid item xs={2}>
                                <ButtonBase onClick={() => {
                                    setOverlayDisplay(true);
                                    postRequest('/user/accept', { username: request.username })
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
                                }}>Accept</ButtonBase>
                                <ButtonBase onClick={() => {
                                    setOverlayDisplay(true);
                                    postRequest('/user/reject', { username: request.username })
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
                                }}>Accept</ButtonBase>
                            </Grid>
                        </Grid>
                    ))
                }
            </AppDialog>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FriendRequestDialog);