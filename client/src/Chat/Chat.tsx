import { Button, createStyles, Divider, Drawer, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, Paper, TextField, Toolbar, withStyles } from '@material-ui/core';
import ReadIcon from '@material-ui/icons/Drafts';
import EnterIcon from '@material-ui/icons/KeyboardReturn';
import UnreadIcon from '@material-ui/icons/Mail';
import * as React from 'react';

interface IChatStyles {
    listLeft: string;
    listRight: string;
    paperLeft: string;
    paperRight: string;
    listHeader: string;
    listHeaderText: string;
    actionItem: string;
    messagePanel: string;
    messagePanelGrid: string;
    inputBox: string;
}

interface IChatProps {
    classes: IChatStyles;
}

const listWidth = 240;

const styles = createStyles({
    listLeft: {
        width: listWidth,
        flexShrink: 0
    },
    paperLeft: {
        width: listWidth
    },
    listRight: {
        width: listWidth,
        flexShrink: 0
    },
    paperRight: {
        width: listWidth
    },
    listHeader: {
        textAlign: 'center',
        height: '72px'
    },
    listHeaderText: {
        paddingRight: 0
    },
    actionItem: {
        textAlign: 'center'
    },
    messagePanel: {
        flex: '1 1 auto',
        display: 'flex',
        marginLeft: listWidth,
        marginRight: listWidth
    },
    messagePanelGrid: {
        flexGrow: 1
    },
    inputBox: {
        margin: '16px 16px 16px 16px',
        padding: 0,
        display: 'flex'
    }
});

class Chat extends React.Component<IChatProps> {
    render() {
        const { classes } = this.props;

        return (
            <React.Fragment>
                <Drawer variant='permanent' className={classes.listLeft}
                    classes={{
                        paper: classes.paperLeft
                    }}>
                    <Toolbar />
                    <List>
                        <ListItem className={classes.listHeader}>
                            <ListItemText className={classes.listHeaderText}>
                                INBOX
                            </ListItemText>
                        </ListItem>
                        <Divider />
                        {
                            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(e => (
                                <React.Fragment>
                                    <ListItem button key={e}>
                                        <ListItemIcon>
                                            {e % 2 === 0 && <UnreadIcon /> || <ReadIcon />}
                                        </ListItemIcon>
                                        <ListItemText>{`${e} + ${e} = ${e + e}`}</ListItemText>
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            ))
                        }
                    </List>
                </Drawer>

                <Paper className={classes.messagePanel}>
                    <Grid container direction='row' justify='center' alignItems='flex-end'
                        className={classes.messagePanelGrid}>
                        <Grid item xs={12}>
                            <Grid container justify='center' alignItems='center'>
                                <Grid item xs={11}>
                                    <TextField className={classes.inputBox}
                                        placeholder='Hit Enter to send text.'
                                        variant='outlined' margin='dense'
                                    />
                                </Grid>
                                <Grid item xs={1}>
                                    <IconButton>
                                        <EnterIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>

                <Drawer variant='permanent' anchor='right' className={classes.listRight}
                    classes={{
                        paper: classes.paperRight
                    }}>
                    <Toolbar />
                    <List>
                        <ListItem className={classes.listHeader}>
                            <ListItemText className={classes.listHeaderText}>
                                ACTION MENU
                            </ListItemText>
                        </ListItem>
                        <Divider />
                        <ListItem className={classes.actionItem}>
                            <Button fullWidth color='primary'>Search User</Button>
                        </ListItem>
                        <ListItem className={classes.actionItem}>
                            <Button fullWidth color='primary'>Refresh Key</Button>
                        </ListItem>
                    </List>
                </Drawer>
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(Chat);