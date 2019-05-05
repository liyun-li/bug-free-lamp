import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import { getRequest, SERVER_URL } from 'src/httpRequest';
import { IStore } from 'src/store/store';
import { setLoginStatus, setFriendRequests, IUser, setMe } from 'src/store/user';
import * as io from 'socket.io-client';

const withAuthentication = (Component: React.ComponentClass) => {
    interface IWithAuthenticationProps extends
        ReturnType<typeof mapStateToProps>,
        ReturnType<typeof mapDispatchToProps> { }

    const mapStateToProps = (state: IStore) => ({
        signedIn: state.user.signedIn
    });

    const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
        setLoginStatus: (signedIn: boolean) => {
            dispatch(setLoginStatus(signedIn));
        },
        setFriendRequests: (requests: string[]) => {
            dispatch(setFriendRequests(requests));
        },
        setMe: (me: IUser) => {
            dispatch(setMe(me));
        }
    });

    class WithAuthentication extends React.Component<IWithAuthenticationProps> {
        componentDidMount() {
            const { setLoginStatus, setMe } = this.props;

            getRequest('/user/hi')
                .then(response => {
                    setLoginStatus(true);
                    if (response.data) setMe(response.data);
                })
                .catch(_error => setLoginStatus(false));
        }

        componentDidUpdate(prevProps: IWithAuthenticationProps) {
            const { signedIn } = this.props;

            if (!prevProps.signedIn && signedIn) {
                const { setFriendRequests } = this.props;
                const mySocket = io.connect(`${SERVER_URL}/me`);

                mySocket.on('connect', () => {
                    mySocket.emit('login', {});
                });

                mySocket.on('disconnect', () => {
                    mySocket.emit('logout', {});
                });

                mySocket.on('update friend request', (_response: {}) => {
                    getRequest('/user/friend_requests').then(response => {
                        const requests = response.data;
                        setFriendRequests(requests);
                    });
                });
            }
        }

        render() {
            return <Component {...this.props} />;
        }
    }

    return connect(mapStateToProps, mapDispatchToProps)(WithAuthentication);
}

export default withAuthentication;