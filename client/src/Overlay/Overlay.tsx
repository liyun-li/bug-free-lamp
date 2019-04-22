import * as React from 'react';
import { createStyles, withStyles, CircularProgress, Typography } from '@material-ui/core';
import { IStore } from 'src/store';
import { connect } from 'react-redux';
import { IOverlay } from 'src/store/overlay';

interface ISignInStyles {
    overlay: string;
    overlayChildren: string;
}

interface ISignInProps extends IOverlay {
    classes: ISignInStyles;
}

const styles = createStyles({
    overlay: {
        opacity: 0.7,
        backgroundColor: '#000',
        position: 'fixed',
        width: '100%',
        height: '100%',
        top: '0px',
        left: '0px',
        zIndex: 100000
    },
    overlayChildren: {
        position: 'relative',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'white',
        textAlign: 'center'
    }
});

const mapStateToProps = (state: IStore) => ({
    ...state.overlay
})

class SignIn extends React.Component<ISignInProps> {
    render() {
        const { classes, display } = this.props;

        return display && (
            <div className={classes.overlay}>
                <div className={classes.overlayChildren}>
                    <CircularProgress color='secondary' />
                    <Typography variant='subtitle2'>Loading...</Typography>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(connect(mapStateToProps)(SignIn));