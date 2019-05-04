import { AppBar, Button, createStyles, IconButton, Theme, Toolbar, Typography, withStyles } from '@material-ui/core';
import { Search, People, Mail, ExitToApp, AccountCircle } from '@material-ui/icons';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Dispatch } from 'redux';
import { routes } from 'src/constants';
import { getRequest } from 'src/httpRequest';
import SignIn from 'src/SignIn';
import SignUp from 'src/SignUp';
import { IStore } from 'src/store';
import { setSignInDialogDisplay, setSignUpDialogDisplay } from 'src/store/dialog';
import { setLoginStatus } from 'src/store/user';

// #region interfaces
interface INavigationStyles {
    appBar: string;
    menuIcon: string;
    homePageButton: string;
    iconOnTheRight: string;
    flexGlow: string;
    spacing: string;
}

interface INavigationProps extends
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {
    classes: INavigationStyles;
}
// #endregion

// #region styles
const styles = (theme: Theme) => createStyles({
    appBar: {
        zIndex: theme.zIndex.drawer + 1
    },
    homePageButton: {
        '&:hover': {
            backgroundColor: theme.palette.primary.main
        }
    },
    menuIcon: {
        color: 'white'
    },
    iconOnTheRight: {
        color: 'white',
        borderColor: 'white'
    },
    flexGlow: {
        flexGlow: 1,
        flex: 1
    },
    spacing: {
        paddingLeft: '8px'
    }
});
// #endregion

// #region react-redux
const mapStateToProps = (state: IStore) => ({
    signedIn: state.user.signedIn,
    me: state.user.me
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setSignInDialogDisplay: (display: boolean) => {
        dispatch(setSignInDialogDisplay(display));
    },
    setSignUpDialogDisplay: (display: boolean) => {
        dispatch(setSignUpDialogDisplay(display));
    },
    signOut: () => {
        dispatch(setLoginStatus(false));
    }
});
// #endregion

class Navigation extends React.Component<INavigationProps> {
    render() {
        const { classes, signedIn, setSignInDialogDisplay, setSignUpDialogDisplay, signOut, history, me } = this.props;

        return (
            <AppBar className={classes.appBar}>
                <Toolbar>
                    <Button onClick={() => history.push('/', null)} disableRipple disableTouchRipple
                        className={classes.homePageButton} color='inherit'>
                        <Typography variant='title' color='inherit'>
                            Bug Free Lamp
                        </Typography>
                    </Button>
                    <div className={classes.flexGlow} />
                    {
                        signedIn && (
                            <React.Fragment>
                                <Typography style={{ color: 'white' }}>
                                    Hello, {me.username}
                                </Typography>
                                <IconButton onClick={() => history.push(routes.group)}>
                                    <Search className={classes.iconOnTheRight} />
                                </IconButton>
                                <IconButton onClick={() => history.push(routes.group)}>
                                    <People className={classes.iconOnTheRight} />
                                </IconButton>
                                <IconButton onClick={() => history.push(routes.chat)}>
                                    <Mail className={classes.iconOnTheRight} />
                                </IconButton>
                                <IconButton onClick={() => history.push(routes.profile)}>
                                    <AccountCircle className={classes.iconOnTheRight} />
                                </IconButton>
                                <IconButton onClick={() => {
                                    getRequest('/logout').then(_response => {
                                        signOut();
                                    });
                                }}>
                                    <ExitToApp className={classes.iconOnTheRight} />
                                </IconButton>
                            </React.Fragment>
                        ) || (
                            <React.Fragment>
                                <SignIn />
                                <SignUp />
                                <Button className={classes.iconOnTheRight} variant='outlined'
                                    onClick={() => setSignUpDialogDisplay(true)}>
                                    Sign Up
                                </Button>
                                <div className={classes.spacing} />
                                <Button className={classes.iconOnTheRight} variant='outlined'
                                    onClick={() => setSignInDialogDisplay(true)}>
                                    Sign In
                                </Button>
                            </React.Fragment>
                        )
                    }
                </Toolbar>
            </AppBar>
        );
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Navigation)));