import { Dialog, DialogContent, DialogContentText, DialogTitle, DialogActions, Button } from '@material-ui/core';
import * as React from 'react';

interface IDialogProps {
    title: string;
    description: string;
    buttons?: {
        text: string;
        func: () => void;
    }[];
    display: boolean;
    setDisplay: (display: boolean) => void;
}

class AppDialog extends React.Component<IDialogProps> {
    constructor(props: IDialogProps) {
        super(props);
    }

    render() {
        const { title, description, display, setDisplay } = this.props;

        const dialogButtons = (this.props.buttons || []).map(button => (
            <Button key={`button-${button.text}`}
                onClick={button.func}>
                {button.text}
            </Button>
        ));

        return (
            <Dialog open={display} onClose={() => setDisplay(false)}>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{description}</DialogContentText>
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