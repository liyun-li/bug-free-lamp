import { TextField } from '@material-ui/core';
import axios from 'axios';
import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import AppDialog from 'src/AppDialog';
import { setSignUpDialogDisplay } from 'src/store/dialog';
import { IStore } from 'src/store/store';
import { RouteComponentProps, withRouter } from 'react-router';
import { setAlertBox } from 'src/store/alertBox';
import { setOverlayDisplay } from 'src/store/overlay';
import { setLoginStatus } from 'src/store/profile';

const mapStateToProps = (state: IStore) => ({
    display: state.dialog.signUpDisplay
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
    setDisplay: (display: boolean) => {
        dispatch(setSignUpDialogDisplay(display));
    },
    showError: (errorMessage: string) => {
        dispatch(setAlertBox({
            display: true,
            text: errorMessage
        }));
    },
    setLoginStatus: (signedIn: boolean) => {
        dispatch(setLoginStatus(signedIn));
    },
    setOverlayDisplay: (display: boolean) => {
        dispatch(setOverlayDisplay(display));
    }
});

interface ISignUpProps extends
    RouteComponentProps,
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> { }

interface ISignUpState {
    username: string;
    password: string;
}

class SignUp extends React.Component<ISignUpProps, ISignUpState> {
    state = {
        username: '',
        password: ''
    }

    render() {
        const { display, setDisplay, showError, setOverlayDisplay, setLoginStatus } = this.props;
        const { username, password } = this.state;

        return (
            <AppDialog title='Sign Up'
                description='Please choose a username and a password.'
                display={display}
                setDisplay={() => setDisplay(false)}
                buttons={[
                    {
                        text: 'Sign Up',
                        func: () => {
                            setOverlayDisplay(true);
                            axios.post('http://127.0.0.1:3001/register', {
                                username,
                                password
                            }).then(_response => {
                                setLoginStatus(true);
                                setDisplay(false);
                                setOverlayDisplay(false);
                            }).catch(error => {
                                const response = error.response;
                                if (response && response.data)
                                    showError(response.data);
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SignUp));