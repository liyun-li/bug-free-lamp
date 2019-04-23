import { TextField } from '@material-ui/core';
import axios from 'axios';
import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import AppDialog from 'src/AppDialog';
import { setSignInDialogDisplay } from 'src/store/dialog';
import { IStore } from 'src/store/store';
import { setLoginStatus } from 'src/store/profile';
import { setAlertBox } from 'src/store/alertBox';
import { setOverlayDisplay } from 'src/store/overlay';

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
        const { display, setDisplay, setLoginStatus, showError, setOverlayDisplay } = this.props;
        const { username, password } = this.state;

        return (
            <AppDialog title='Sign In'
                description='Please enter your username and password.'
                display={display}
                setDisplay={() => setDisplay(false)}
                buttons={[
                    {
                        text: 'Sign In',
                        func: () => {
                            setOverlayDisplay(true);
                            axios.post('http://127.0.0.1:3001/login', {
                                username,
                                password
                            }).then(_response => {
                                setLoginStatus(true);
                                setDisplay(false);
                                setOverlayDisplay(false);
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