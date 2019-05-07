import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import { getRequest, SERVER_URL, postRequest } from 'src/httpRequest';
import { IStore } from 'src/store/store';
import { setLoginStatus, setFriendRequests, IUser, setMe, setMyPublicKey } from 'src/store/user';
import * as io from 'socket.io-client';
import { setAlertBox } from 'src/store/alertBox';


const withAuthentication = (Component: React.ComponentClass) => {
    // #region interfaces
    interface IWithAuthenticationProps extends
        ReturnType<typeof mapStateToProps>,
        ReturnType<typeof mapDispatchToProps> { }

    interface IStatusMessage {
        status: string;
        message: string;
    }
    // #endregion

    // #region react-redux
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
        },
        setMyPublicKey: (publicKey: string) => {
            dispatch(setMyPublicKey(publicKey));
        },
        showResponse: (text: string) => {
            dispatch(setAlertBox({
                text,
                display: true
            }));
        }
    });
    // #endregion

    class WithAuthentication extends React.Component<IWithAuthenticationProps> {
        // #region did mount
        componentDidMount() {
            const { setLoginStatus, setMe, setFriendRequests, setMyPublicKey } = this.props;

            getRequest('/user/hi')
                .then(response => {
                    setLoginStatus(true);

                    const me = response.data;

                    if (me) {
                        const myPublicKey = localStorage.getItem('Important')!;
                        setMe(me);
                        if (!me.publicKey && myPublicKey) {
                            postRequest('/user/set_public_key', { publicKey: myPublicKey })
                                .then(_response => {
                                    setMyPublicKey(myPublicKey);
                                });
                        } else if (me.publicKey) {
                            localStorage.setItem('Important', me.publicKey);
                        }
                    }

                    getRequest('/user/friend_requests').then(response => {
                        const requests = response.data;
                        setFriendRequests(requests);
                    });
                })
                .catch(_error => {
                    setLoginStatus(false)
                });
        }
        // #endregion

        // #region did update
        componentDidUpdate(prevProps: IWithAuthenticationProps) {
            const { signedIn, showResponse } = this.props;

            if (!prevProps.signedIn && signedIn) {
                const { setFriendRequests } = this.props;
                const mySocket = io.connect(`${SERVER_URL}/me`);

                mySocket.on('connect', () => {
                    mySocket.emit('login', {});
                });

                mySocket.on('disconnect', () => {
                    mySocket.emit('logout', {});
                });

                mySocket.on('update user status', (response: IStatusMessage) => {
                    showResponse(response && response.message || '');
                });

                mySocket.on('update friend request', (_response: {}) => {
                    getRequest('/user/friend_requests').then(response => {
                        const requests = response.data;
                        setFriendRequests(requests);
                    });
                });
            }
        }
        // #endregion

        render() {
            return <Component {...this.props} />;
        }
    }

    return connect(mapStateToProps, mapDispatchToProps)(WithAuthentication);
}

export default withAuthentication;