import * as React from 'react';
import { Typography, Button, Theme, createStyles, withStyles, Grid } from '@material-ui/core';
import { IStore } from 'src/store';
import { connect } from 'react-redux';


// #region style props
interface ILandingStyleProps {
    root: string;
}

interface ILandingProps extends ReturnType<typeof mapStateToProps> {
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
// #endregion

class Landing extends React.Component<ILandingProps> {
    render() {
        const { signedIn, classes } = this.props;

        return (
            <Grid container justify='center' alignItems='center'
                className={classes.root}>
                <Grid item xs={12}>
                    <Grid container justify='center'>
                        {
                            !signedIn && (
                                <Typography variant='h3'>
                                    [Insert catchy elavator speech]
                                </Typography>
                            ) || (
                                <Button color='primary' variant='outlined'
                                    onClick={() => {
                                        alert('cool');
                                    }}>
                                    Generate Key Pair
                                </Button>
                            )
                        }
                    </Grid>
                </Grid>
            </Grid>
        )
    }
}

export default connect(mapStateToProps)(withStyles(styles)(Landing));