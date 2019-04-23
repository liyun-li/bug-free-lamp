import * as React from 'react';
import { Snackbar } from '@material-ui/core';
import { IStore } from 'src/store';

interface IAlertBoxProps extends ReturnType<typeof mapStateToProps> { }

const mapStateToProps = (state: IStore) => ({
    ...state.alertBox
});

class AlertBox extends React.Component<IAlertBoxProps> {
    render() {
        const { display, text } = this.props;

        return (
            <Snackbar open={display}
                autoHideDuration={5000}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                }}>
                {text}
            </Snackbar>
        );
    }
}

export default AlertBox;