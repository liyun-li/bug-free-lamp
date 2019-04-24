import { createStyles, Divider, Drawer, List, ListItem, ListItemText, ListItemIcon, Toolbar, withStyles } from '@material-ui/core';
import MailIcon from '@material-ui/icons/Mail';
import * as React from 'react';

interface IChatStyles {
    contactDrawer: string;
    contactList: string;
    contactListHeader: string;
}

interface IChatProps {
    classes: IChatStyles;
}

const styles = createStyles({
    contactDrawer: {
        width: '240px'
    },
    contactList: {
        width: '240px'
    },
    contactListHeader: {

    }
});

class Chat extends React.Component<IChatProps> {
    render() {
        const { classes } = this.props;

        return (
            <React.Fragment>
                <Drawer variant='permanent' className={classes.contactDrawer}>
                    <Toolbar />
                    <List className={classes.contactList}>
                        <ListItem className={classes.contactListHeader}>
                            <ListItemIcon>
                                <MailIcon />
                            </ListItemIcon>
                            <ListItemText>Inbox</ListItemText>
                        </ListItem>
                        <Divider />
                        {
                            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(e => (
                                <React.Fragment>
                                    <ListItem button key={e}>
                                        <ListItemText>{`${e} + ${e} = ${e + e}`}</ListItemText>
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            ))
                        }
                    </List>
                </Drawer>
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(Chat);