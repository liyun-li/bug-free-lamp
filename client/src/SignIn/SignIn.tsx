import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import AppDialog from 'src/AppDialog';
import { setSignInDialogDisplay } from 'src/store/dialog';
import { post } from 'src/store/requests';
import { IStore } from 'src/store/store';

const mapStateToProps = (state: IStore) => ({
    display: state.dialog.signInDisplay
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
    setDisplay: (display: boolean) => {
        dispatch(setSignInDialogDisplay(display));
    }
});

interface ISignInProps extends
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> { }

class SignIn extends React.Component<ISignInProps> {
    render() {
        const { display, setDisplay } = this.props;

        return (
            <AppDialog title='Sign In'
                description='Please enter your username and password.'
                display={display}
                setDisplay={() => setDisplay(false)}
                buttons={[
                    {
                        text: 'Sign In',
                        func: () => {
                            const data = post('/login', {
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

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);