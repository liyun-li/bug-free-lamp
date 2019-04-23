import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import AppDialog from 'src/AppDialog';
import { setSignUpDialogDisplay } from 'src/store/dialog';
import { post } from 'src/store/requests';
import { IStore } from 'src/store/store';

const mapStateToProps = (state: IStore) => ({
    display: state.dialog.signUpDisplay
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
    setDisplay: (display: boolean) => {
        dispatch(setSignUpDialogDisplay(display));
    }
});

interface ISignInProps extends
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> { }

class SignUp extends React.Component<ISignInProps> {
    render() {
        const { display, setDisplay } = this.props;

        return (
            <AppDialog title='Sign Up'
                description='Please choose a username and a password.'
                display={display}
                setDisplay={() => setDisplay(false)}
                buttons={[
                    {
                        text: 'Sign Up',
                        func: () => {
                            const data = post('/register', {
                                data: {
                                    username: 'bob',
                                    password: 'alice'
                                }
                            });
                            console.log(data);
                        }
                    },
                    {
                        text: 'Close',
                        func: () => setDisplay(false)
                    }
                ]}>
            </AppDialog>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);