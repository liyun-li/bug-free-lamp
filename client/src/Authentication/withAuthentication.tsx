import * as React from 'react';
import { getRequest } from 'src/httpRequest';
import { Dispatch, Action } from 'redux';
import { setLoginStatus } from 'src/store/user';
import { connect } from 'react-redux';

const withAuthentication = (Component: React.ComponentClass) => {
    interface IWithAuthenticationProps extends
        ReturnType<typeof mapDispatchToProps> { }

    const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
        setLoginStatus: (signedIn: boolean) => {
            dispatch(setLoginStatus(signedIn));
        }
    });

    class WithAuthentication extends React.Component<IWithAuthenticationProps> {
        componentDidMount() {
            const { setLoginStatus } = this.props;

            getRequest('/user/hi').then(_response => setLoginStatus(true))
                .catch(_error => setLoginStatus(false));
        }

        render() {
            return <Component {...this.props} />;
        }
    }

    return connect(null, mapDispatchToProps)(WithAuthentication);
}

export default withAuthentication;