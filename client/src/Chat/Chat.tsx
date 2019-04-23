import { createStyles, Drawer, List, Theme, withStyles, ListItem, Typography, Toolbar } from '@material-ui/core';
import * as React from 'react';

interface IChatStyles {
    contacts: string;
}

interface IChatProps {
    classes: IChatStyles;
}

const styles = (theme: Theme) => createStyles({
    contacts: {

    }
});

class Chat extends React.Component<IChatProps> {
    render() {
        return (
            <React.Fragment>
                <Drawer variant='permanent'>
                    <Toolbar />
                    <List>
                        {
                            [1, 2, 3, 4, 5, 6, 7, 8, 9].map(e => (
                                <ListItem>
                                    <Typography>{`${e} + ${e} = ${e + e}`}</Typography>
                                </ListItem>
                            ))
                        }
                    </List>
                </Drawer>
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(Chat);