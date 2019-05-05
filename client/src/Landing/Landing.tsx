import { Button, createStyles, Grid, Theme, Typography, withStyles } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import KeyDownloadDialog from 'src/KeyDownloadDialog';
import KeyImportDialog from 'src/KeyImportDialog';
import { globalDispatchProps, IStore } from 'src/store';
import { setKeyDownloadDisplay, setKeyImportDisplay } from 'src/store/dialog';
import { generateKeyPair } from 'src/store/user';

// #region style props
interface ILandingProps extends
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof globalDispatchProps> {
    classes: {
        [code: string]: string;
    };
}
// #endregion

// #region styles
const styles = (_theme: Theme) => createStyles({
    root: {
        flex: 1
    },
    keyPairButton: {
        width: 240,
        margin: '4px 12px 4px 12px'
    },
    note: {
        margin: '4px 16px 4px 16px',
        textAlign: 'justify'
    }
});
// #endregion

// #region state props
const mapStateToProps = (state: IStore) => ({
    signedIn: state.user.signedIn
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
    generateKeyPair: () => {
        Promise.all([
            // dispatch(setOverlayDisplay(true)), // FIXME: this doesn't work :(
            dispatch(generateKeyPair())
        ]).then(() => {
            dispatch(setKeyDownloadDisplay(true));
            // dispatch(setOverlayDisplay(false)); // FIXME: this doesn't work :(
        });
    },
    recoverKeyPair: () => {
        dispatch(setKeyDownloadDisplay(true));
    },
    importKeyPair: () => {
        dispatch(setKeyImportDisplay(true));
    }
});
// #endregion

class Landing extends React.Component<ILandingProps> {
    render() {
        const { signedIn, classes, generateKeyPair, recoverKeyPair, importKeyPair } = this.props;

        return (
            <Grid container justify='center' alignItems='center'
                className={classes.root}>
                <KeyDownloadDialog />
                <KeyImportDialog />
                <Grid item xs={12}>
                    {
                        !signedIn &&
                        <Grid container justify='center'>
                            <Typography variant='h3' color='secondary'>
                                [Insert catchy elavator speech]
                            </Typography>
                        </Grid>
                    }
                    {
                        signedIn &&
                        <React.Fragment>
                            <Grid container alignItems='center' justify='center'>
                                <Button color='primary' variant='outlined'
                                    onClick={() => generateKeyPair()}
                                    className={classes.keyPairButton}>
                                    Generate Key Pair
                                </Button>
                                <Button color='primary' variant='outlined'
                                    onClick={() => recoverKeyPair()}
                                    className={classes.keyPairButton}>
                                    Download Key Pair
                                </Button>
                                <Button color='primary' variant='outlined'
                                    onClick={() => importKeyPair()}
                                    className={classes.keyPairButton}>
                                    Import Key Pair
                                </Button>
                            </Grid>
                            <Grid container alignItems='center' justify='center'>
                                <Typography color='secondary' className={classes.note}>
                                    Generating a key pair will take time. You will see a pop-up dialog once the generation is complete.
                                </Typography>
                            </Grid>
                        </React.Fragment>
                    }
                </Grid>
            </Grid>
        )
    }
}

export default connect(
    null,
    globalDispatchProps
)(connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(Landing)));