import { Dialog, DialogContent, DialogContentText, DialogTitle, DialogActions, Button } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { IStore } from 'src/store';
import { setDialogDisplay } from 'src/store/dialog';
import { Action } from 'redux';

interface IDialogProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    title: string;
    description: string;
    buttons: {
        text: string;
        func: () => void;
    }[];
}

const mapStateToProps = (state: IStore) => ({
    ...state.dialog
});

const mapDispatchToProps = (dispatch: React.Dispatch<Action>) => ({
    setDialogDisplay: (display: boolean) => {
        dispatch(setDialogDisplay(display));
    }
});

class AppDialog extends React.Component<IDialogProps> {
    private dialogButtons = () => this.props.buttons.map(button => (
        <Button onClick={button.func}>{button.text}</Button>
    ))

    render() {
        const { title, description, display, setDialogDisplay } = this.props;

        return (
            <Dialog open={display} onClose={() => setDialogDisplay(false)}>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{description}</DialogContentText>
                    {this.props.children}
                </DialogContent>
                <DialogActions>
                    {this.dialogButtons()}
                </DialogActions>
            </Dialog>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppDialog);