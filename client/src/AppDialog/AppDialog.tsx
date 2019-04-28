import { Dialog, DialogContent, DialogContentText, DialogTitle, DialogActions, Button } from '@material-ui/core';
import * as React from 'react';

interface IDialogProps {
    title: string;
    description?: string;
    buttons?: {
        text: string;
        func: () => void;
    }[];
    display: boolean;
    hideDisplay: () => void;
}

class AppDialog extends React.Component<IDialogProps> {
    constructor(props: IDialogProps) {
        super(props);
    }

    render() {
        const { title, description, display, hideDisplay } = this.props;

        const dialogButtons = (this.props.buttons || []).map(button => (
            <Button key={`button-${button.text}`}
                onClick={button.func}>
                {button.text}
            </Button>
        ));

        return (
            <Dialog open={display} onClose={hideDisplay}>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    {
                        description &&
                        <DialogContentText>{description}</DialogContentText>
                    }
                    {this.props.children}
                </DialogContent>
                <DialogActions>
                    {dialogButtons}
                </DialogActions>
            </Dialog>
        );
    }
}

export default AppDialog;