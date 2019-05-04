import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import AppDialog from 'src/AppDialog';
import { setKeyDownloadDisplay } from 'src/store/dialog';
import { IStore } from 'src/store/store';

interface IKeyDownloadDialogProps extends
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> { }

const mapStateToProps = (state: IStore) => ({
    display: state.dialog.keyDownloadDisplay,
    publicKey: state.user.me.publicKey
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
    setDisplay: (display: boolean) => {
        dispatch(setKeyDownloadDisplay(display));
    }
});

class PrivateKeyDialog extends React.Component<IKeyDownloadDialogProps> {
    download = (content: string | null, filename: string) => {
        const a = document.createElement('a');
        a.setAttribute('href', 'data:application/octet-stream,'
            + encodeURIComponent(content || ''));
        a.setAttribute('download', filename);
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    render() {
        const { display, setDisplay } = this.props;

        return (
            <AppDialog title='Key Download'
                description='WARNING: It is VERY IMPORTANT to save the files to a secure place. In the event that browser cache is cleared, you have to import your public and private key files in order to recover your messages. If you have to generate a new key pair, note that all your previous messages cannot be recovered.'
                hideDisplay={() => setDisplay(false)}
                display={display}
                buttons={[
                    {
                        text: 'Save Public Key',
                        func: () => {
                            this.download(localStorage.getItem('Important'), 'rsa.public');
                        }
                    },
                    {
                        text: 'Save Private Key',
                        func: () => {
                            this.download(localStorage.getItem('Not Important'), 'rsa.private');
                        }
                    },
                    {
                        text: 'Close',
                        func: () => setDisplay(false)
                    }
                ]}
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PrivateKeyDialog);