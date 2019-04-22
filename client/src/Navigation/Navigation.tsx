import { AppBar, Badge, Button, createStyles, IconButton, Toolbar, Typography, withStyles } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ExitToApp from '@material-ui/icons/ExitToApp';
import MailIcon from '@material-ui/icons/Mail';
import PeopleIcon from '@material-ui/icons/People';
import * as React from 'react';

interface INavigationStyles {
    menuIcon: string;
    iconOnTheRight: string;
    flexGlow: string;
}

interface INavigationProps {
    classes: INavigationStyles;
    signedIn: boolean;
}

const styles = createStyles({
    menuIcon: {
        color: 'white'
    },
    iconOnTheRight: {
        color: 'white'
    },
    flexGlow: {
        flexGlow: 1,
        flex: 1
    }
});

class Navigation extends React.Component<INavigationProps> {
    render() {
        const { classes, signedIn } = this.props;

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
                                <Button className={classes.iconOnTheRight}>Sign Up</Button>
                                <Button className={classes.iconOnTheRight}>Sign In</Button>
                            </React.Fragment>
                        )
                    }
                </Toolbar>
            </AppBar>
        );
    }
}

export default withStyles(styles)(Navigation);