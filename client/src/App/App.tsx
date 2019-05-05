import { Toolbar, createMuiTheme, MuiThemeProvider } from '@material-ui/core';
import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import AlertBox from 'src/AlertBox';
import withAuthentication from 'src/Authentication';
import Chat from 'src/Chat';
import { routes } from 'src/constants';
import Landing from 'src/Landing';
import Navigation from 'src/Navigation';
import Overlay from 'src/Overlay';
import { IStore } from 'src/store/store';

const theme = createMuiTheme({
    palette: {
        type: 'dark',
        background: {
            default: '#202124',
            paper: '#202124'
        }
    },
    typography: { useNextVariants: true },
});

interface IAppProps extends ReturnType<typeof mapStateToProps> { }

const mapStateToProps = (state: IStore) => ({
    signedIn: state.user.signedIn
});

class App extends React.Component<IAppProps> {
    render() {
        return (
            <MuiThemeProvider theme={theme}>
                <BrowserRouter>
                    <Overlay />
                    <AlertBox />
                    <Navigation />
                    <Toolbar />
                    <Switch>
                        <Route path={routes.chat} component={Chat} />
                        <Route path={routes.landing} component={Landing} />
                    </Switch>
                </BrowserRouter>
            </MuiThemeProvider>
        );
    }
}

export default withAuthentication(App);