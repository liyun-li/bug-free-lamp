import { TextField } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import AppDialog from 'src/AppDialog';
import { postRequest } from 'src/httpRequest';
import { setAlertBox } from 'src/store/alertBox';
import { setSignInDialogDisplay } from 'src/store/dialog';
import { setOverlayDisplay } from 'src/store/overlay';
import { setLoginStatus, IUser, setMe } from 'src/store/user';
import { IStore } from 'src/store/store';

const mapStateToProps = (state: IStore) => ({
    display: state.dialog.signInDisplay
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
    setDisplay: (display: boolean) => {
        dispatch(setSignInDialogDisplay(display));
    },
    setLoginStatus: (signedIn: boolean) => {
        dispatch(setLoginStatus(signedIn));
    },
    showError: (errorMessage: string) => {
        dispatch(setAlertBox({
            display: true,
            text: errorMessage
        }));
    },
    setOverlayDisplay: (display: boolean) => {
        dispatch(setOverlayDisplay(display));
    },
    setMe: (me: IUser) => {
        dispatch(setMe(me));
    }
});

interface ISignInProps extends
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> { }

interface ISignInState {
    username: string;
    password: string;
}

class SignIn extends React.Component<ISignInProps, ISignInState> {
    state = {
        username: '',
        password: ''
    }

    render() {
        const { display, setDisplay, setLoginStatus, showError, setOverlayDisplay, setMe } = this.props;
        const { username, password } = this.state;

        return (
            <AppDialog title='Sign In'
                description='Please enter your username and password.'
                display={display}
                hideDisplay={() => setDisplay(false)}
                buttons={[
                    {
                        text: 'Sign In',
                        func: () => {
                            setOverlayDisplay(true);
                            postRequest('/login', {
                                username,
                                password
                            }).then(response => {
                                setLoginStatus(true);
                                setDisplay(false);
                                setOverlayDisplay(false);
                                if (response.data) setMe(response.data);
                            }).catch(error => {
                                const response = error.response;
                                if (response && response.data) {
                                    showError(response.data);
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
                <TextField fullWidth autoFocus label='Username'
                    onChange={(e) => this.setState({
                        ...this.state,
                        username: e.target.value
                    })}
                />
                <TextField fullWidth type='password' label='Password'
                    onChange={(e) => this.setState({
                        ...this.state,
                        password: e.target.value
                    })}
                />
            </AppDialog>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);