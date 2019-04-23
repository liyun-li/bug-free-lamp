import { AppBar, Badge, Button, createStyles, IconButton, Toolbar, Typography, withStyles, Theme } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ExitToApp from '@material-ui/icons/ExitToApp';
import MailIcon from '@material-ui/icons/Mail';
import PeopleIcon from '@material-ui/icons/People';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Dispatch } from 'redux';
import { routes } from 'src/constants';
import { postRequest } from 'src/httpRequest';
import SignIn from 'src/SignIn';
import SignUp from 'src/SignUp';
import { IStore } from 'src/store';
import { setSignInDialogDisplay, setSignUpDialogDisplay } from 'src/store/dialog';
import { setLoginStatus } from 'src/store/profile';

interface INavigationStyles {
    appBar: string;
    menuIcon: string;
    iconOnTheRight: string;
    flexGlow: string;
    spacing: string;
}

interface INavigationProps extends
    RouteComponentProps,
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> {
    classes: INavigationStyles;
}

const styles = (theme: Theme) => createStyles({
    appBar: {
        zIndex: theme.zIndex.drawer + 1
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

const mapStateToProps = (state: IStore) => ({
    signedIn: state.profile.signedIn
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

class Navigation extends React.Component<INavigationProps> {
    render() {
        const { classes, signedIn, setSignInDialogDisplay, setSignUpDialogDisplay, signOut, history } = this.props;

        return (
            <AppBar className={classes.appBar}>
                <Toolbar>
                    <Button onClick={() => history.push('/', null)} color='inherit'>
                        <Typography variant='title' color='inherit'>
                            Bug Free Lamp
                        </Typography>
                    </Button>
                    <div className={classes.flexGlow} />
                    {
                        signedIn && (
                            <React.Fragment>
                                <IconButton onClick={() => history.push(routes.group)}>
                                    <PeopleIcon className={classes.iconOnTheRight} />
                                </IconButton>
                                <IconButton onClick={() => history.push(routes.chat)}>
                                    <Badge badgeContent={4} color='secondary'>
                                        <MailIcon className={classes.iconOnTheRight} />
                                    </Badge>
                                </IconButton>
                                <IconButton onClick={() => history.push(routes.profile)}>
                                    <AccountCircle className={classes.iconOnTheRight} />
                                </IconButton>
                                <IconButton onClick={() => {
                                    postRequest('/logout').then(_response => {
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