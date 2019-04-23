import * as React from 'react';
import { Typography } from '@material-ui/core';
import { IStore } from 'src/store';
import { connect } from 'react-redux';
import Chat from 'src/Chat';

interface ILandingProps extends ReturnType<typeof mapStateToProps> { }

const mapStateToProps = (state: IStore) => ({
    signedIn: state.profile.signedIn
});

class Landing extends React.Component<ILandingProps> {
    render() {
        const { signedIn } = this.props;

        return !signedIn
            && (
                <React.Fragment>
                    <Typography variant='h3'>
                        Catchy line about how we are changing the world.
                    </Typography>
                </React.Fragment>
            )
            || (
                <Chat />
            );
    }
}

export default connect(mapStateToProps)(Landing);