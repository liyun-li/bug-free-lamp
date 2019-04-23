import { AppBar, Badge, Button, createStyles, IconButton, Toolbar, Typography, withStyles } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ExitToApp from '@material-ui/icons/ExitToApp';
import MailIcon from '@material-ui/icons/Mail';
import PeopleIcon from '@material-ui/icons/People';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import SignIn from 'src/SignIn';
import SignUp from 'src/SignUp';
import { IStore } from 'src/store';
import { setSignInDialogDisplay, setSignUpDialogDisplay } from 'src/store/dialog';

interface INavigationStyles {
    menuIcon: string;
    iconOnTheRight: string;
    flexGlow: string;
    spacing: string;
}

interface INavigationProps extends
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> {
    classes: INavigationStyles;
}

const styles = createStyles({
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
    }
});

class Navigation extends React.Component<INavigationProps> {
    render() {
        const { classes, signedIn, setSignInDialogDisplay, setSignUpDialogDisplay } = this.props;

        return (
            <AppBar>
                <Toolbar>
                    <Typography variant='h6' color='inherit'>
                        Best Social Media Not
                    </Typography>
                    <div className={classes.flexGlow} />
                    {
                        signedIn && (
                            <React.Fragment>
                                <IconButton>
                                    <PeopleIcon className={classes.iconOnTheRight} />
                                </IconButton>
                                <IconButton>
                                    <Badge badgeContent={4} color='secondary'>
                                        <MailIcon className={classes.iconOnTheRight} />
                                    </Badge>
                                </IconButton>
                                <IconButton>
                                    <AccountCircle className={classes.iconOnTheRight} />
                                </IconButton>
                                <IconButton>
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

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Navigation));