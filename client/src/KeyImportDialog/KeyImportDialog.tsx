import * as React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';
import AppDialog from 'src/AppDialog';
import { setKeyImportDisplay } from 'src/store/dialog';
import { IStore } from 'src/store/store';
import { Button, Grid } from '@material-ui/core';
import { postRequest } from 'src/httpRequest';
import { setAlertBox } from 'src/store/alertBox';
import { alertError, alertResponse } from 'src/utils';
import * as NodeRSA from 'node-rsa';

// #region interfaces
interface IKeyImportDialogProps extends
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> { }
// #endregion

// #region react-redux
const mapStateToProps = (state: IStore) => ({
    display: state.dialog.keyImportDisplay,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
    setDisplay: (display: boolean) => {
        dispatch(setKeyImportDisplay(display));
    },
    showResponse: (text: string) => {
        dispatch(setAlertBox({
            text,
            display: true
        }));
    }
});
// #endregion

class KeyImportDialog extends React.Component<IKeyImportDialogProps> {
    state = {
        publicKeyImported: true,
        privateKeyImported: false
    }

    openFileUpload = (id: string) => {
        document.getElementById(id)!.click();
    }

    readFile = (file: File, onload: any) => {
        const reader = new FileReader();
        reader.onload = onload;
        try {
            reader.readAsText(file);
        } catch (error) {
            this.props.showResponse(error);
        }
    }

    importPublicKey = ({ target }: any) => {
        const { showResponse } = this.props;

        this.readFile(target.files[0], ({ target }: any) => {
            this.setState({
                ...this.state,
                publicKeyImported: false
            }, () => {
                const publicKey = target.result!;
                const privateKey = new NodeRSA(localStorage.getItem('Not Important')!);
                const message = privateKey.encryptPrivate('I have a cat and she is very chubby');

                postRequest('/user/set_public_key', {
                    publicKey,
                    message
                }).then(response => {
                    localStorage.setItem('Important', publicKey);
                    this.setState({
                        ...this.state,
                        publicKeyImported: true
                    }, () => {
                        alertResponse(response, showResponse);
                    })
                }).catch(error => alertError(error, showResponse));
            });
        });
    }

    importPrivateKey = ({ target }: any) => {
        this.setState({
            ...this.state,
            privateKeyImported: false
        }, () => {
            this.readFile(target.files[0], ({ target }: any) => {
                try {
                    localStorage.setItem('Not Important', target.result);
                } finally {
                    this.props.showResponse('Success!');
                }
            });
        });
    }

    render() {
        const { display, setDisplay } = this.props;
        const { publicKeyImported, privateKeyImported } = this.state;

        return (
            <AppDialog title='Key Import'
                description='Please first import your private key, then your public key.'
                hideDisplay={() => {
                    setDisplay(false);
                    this.setState({
                        ...this.state,
                        publicKeyImported: true,
                        privateKeyImported: false
                    });
                }}
                display={display}
                buttons={[
                    {
                        text: 'Close',
                        func: () => setDisplay(false)
                    }
                ]}
            >
                <br />
                <input type='file' id='upload-public' hidden
                    onChange={this.importPublicKey} />
                <input type='file' id='upload-private' hidden
                    onChange={this.importPrivateKey} />
                <Grid container spacing={8}>
                    {
                        privateKeyImported &&
                        <Grid item xs={12}>
                            <Button variant='outlined' fullWidth color='secondary'
                                onClick={() => this.openFileUpload('upload-public')}>
                                Import Public Key
                            </Button>
                        </Grid>
                    }
                    {
                        publicKeyImported &&
                        <Grid item xs={12}>
                            <Button variant='outlined' fullWidth color='secondary'
                                onClick={() => this.openFileUpload('upload-private')}>
                                Import Private Key
                            </Button>
                        </Grid>
                    }
                </Grid>
            </AppDialog>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(KeyImportDialog);