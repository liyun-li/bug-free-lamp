import { AppBar, createStyles, IconButton, Toolbar, Typography, withStyles, Badge, Button } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import MenuIcon from '@material-ui/icons/Menu';
import PeopleIcon from '@material-ui/icons/People';
import ExitToApp from '@material-ui/icons/ExitToApp';
import * as React from 'react';

interface INavigationStyles {
    noPadding: string;
    menuIcon: string;
    iconsOnTheRight: string;
    flexGlow: string;
}

interface INavigationProps {
    classes: INavigationStyles;
    signedIn: boolean;
}

const styles = createStyles({
    noPadding: {
        paddingLeft: 0
    },
    menuIcon: {
        color: 'white'
    },
    iconsOnTheRight: {
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
                <Toolbar className={classes.noPadding}>
                    <IconButton>
                        <MenuIcon className={classes.menuIcon} />
                    </IconButton>
                    <Typography variant='h6' color='inherit'>
                        Best Social Media Not
                    </Typography>
                    <div className={classes.flexGlow} />
                    {
                        signedIn ? (
                        <React.Fragment>
                            <IconButton>
                                <PeopleIcon className={classes.iconsOnTheRight} />
                            </IconButton>
                            <IconButton>
                                <Badge badgeContent={4} color='secondary'>
                                    <MailIcon className={classes.iconsOnTheRight} />
                                </Badge>
                            </IconButton>
                            <IconButton>
                                <AccountCircle className={classes.iconsOnTheRight} />
                            </IconButton>
                            <IconButton>
                                <ExitToApp className={classes.iconsOnTheRight} />
                            </IconButton>
                        </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <Button>Sign Up</Button>
                                <Button>Sign In</Button>
                            </React.Fragment>
                        )
                    }
                </Toolbar>
            </AppBar>
        );
    }
}

export default withStyles(styles)(Navigation);