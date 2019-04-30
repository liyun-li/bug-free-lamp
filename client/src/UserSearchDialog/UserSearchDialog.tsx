import { ButtonBase, Grid, TextField, Typography } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import AppDialog from 'src/AppDialog/AppDialog';
import { postRequest } from 'src/httpRequest';
import { IStore } from 'src/store';
import { setAlertBox } from 'src/store/alertBox';
import { setUserSearchDialogDisplay } from 'src/store/dialog';
import { setOverlayDisplay } from 'src/store/overlay';


// #region interfaces
interface IUserSearchDialogProps extends
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> { }

interface IUserSearchDialogState {
    usernameField: string;
    username: string;
}
// #endregion

// #region mappers
const mapStateToProps = (state: IStore) => ({
    display: state.dialog.userSearchDisplay
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
    setDisplay: (display: boolean) => {
        dispatch(setUserSearchDialogDisplay(display));
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

class UserSearchDialog extends React.Component<IUserSearchDialogProps, IUserSearchDialogState> {
    state: IUserSearchDialogState = {
        usernameField: '',
        username: ''
    }

    render() {
        const { display, setOverlayDisplay, setDisplay, showResponse } = this.props;
        const { usernameField, username } = this.state;

        return (
            <AppDialog title='Search User'
                display={display}
                hideDisplay={() => setDisplay(false)}
                buttons={[
                    {
                        text: 'Search',
                        func: () => {
                            setOverlayDisplay(true);
                            postRequest('/user/search', { username: usernameField })
                                .then(response => {
                                    setOverlayDisplay(false);

                                    const username = response.data;
                                    if (username) {
                                        this.setState({
                                            ...this.state,
                                            username
                                        });
                                    }
                                }).catch(error => {
                                    const response = error.response;
                                    if (response && response.data) {
                                        showResponse(response.data);
                                    }
                                    setOverlayDisplay(false);
                                });
                        }
                    },
                    {
                        text: 'Close',
                        func: () => setDisplay(false)
                    }
                ]}>
                <TextField fullWidth autoFocus label='Enter a Username'
                    onChange={(e) => this.setState({
                        ...this.state,
                        usernameField: e.target.value
                    })}
                />
                {
                    username &&
                    <Grid container alignItems='center'>
                        <Grid item xs={10}><Typography>{username}</Typography></Grid>
                        <Grid item xs={2}>
                            <ButtonBase onClick={() => {
                                setOverlayDisplay(true);
                                postRequest('/user/add', { username })
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
                            }}><Add /></ButtonBase>
                        </Grid>
                    </Grid>
                }
            </AppDialog>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSearchDialog);