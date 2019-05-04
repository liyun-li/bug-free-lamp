import { Button, createStyles, Grid, Theme, Typography, withStyles } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import { globalDispatchProps, IStore } from 'src/store';
import { setOverlayDisplay } from 'src/store/overlay';
import { generateKeyPair } from 'src/store/user';
import { setKeyDownloadDisplay } from 'src/store/dialog';
import KeyDownloadDialog from 'src/KeyDownloadDialog';

// #region style props
interface ILandingStyleProps {
    root: string;
}

interface ILandingProps extends
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof globalDispatchProps> {
    classes: ILandingStyleProps;
}
// #endregion

// #region styles
const styles = (_theme: Theme) => createStyles({
    root: {
        flex: 1
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
            dispatch(setOverlayDisplay(true)), // FIXME: this doesn't work :(
            dispatch(generateKeyPair())
        ]).then(() => {
            dispatch(setKeyDownloadDisplay(true));
            dispatch(setOverlayDisplay(false)); // FIXME: this doesn't work :(
        });
    },
    recoverKeyPair: () => {
        dispatch(setKeyDownloadDisplay(true));
    }
});
// #endregion

class Landing extends React.Component<ILandingProps> {
    render() {
        const { signedIn, classes, generateKeyPair, recoverKeyPair } = this.props;

        return (
            <Grid container justify='center' alignItems='center'
                className={classes.root}>
                <KeyDownloadDialog />
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
                            <Grid container justify='center'>
                                <Button color='primary' variant='outlined'
                                    onClick={() => generateKeyPair()}>
                                    Generate Key Pair
                                </Button>
                                <span style={{ marginLeft: 8 }} />
                                <Button color='primary' variant='outlined'
                                    onClick={() => recoverKeyPair()}>
                                    Recover Key Pair
                                </Button>
                            </Grid>
                            <Grid container justify='center'>
                                <Typography color='secondary'>
                                    This will take time. You will see some sort of notification once the generation is complete.
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