import * as React from 'react';
import { Snackbar } from '@material-ui/core';
import { IStore } from 'src/store';
import { connect } from 'react-redux';
import { setAlertBox } from 'src/store/alertBox';
import { Action, Dispatch } from 'redux';

interface IAlertBoxProps extends
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> { }

const mapStateToProps = (state: IStore) => ({
    ...state.alertBox
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
    close: () => {
        dispatch(setAlertBox({
            display: false,
            text: ''
        }));
    }
})

class AlertBox extends React.Component<IAlertBoxProps> {
    render() {
        const { display, text, close } = this.props;

        return (
            <Snackbar open={display} autoHideDuration={5000}
                onClose={close} message={text}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                }}
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AlertBox);