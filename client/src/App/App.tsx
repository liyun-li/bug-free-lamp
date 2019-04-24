import { Toolbar } from '@material-ui/core';
import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import AlertBox from 'src/AlertBox';
import withAuthentication from 'src/Authentication';
import Chat from 'src/Chat';
import { routes } from 'src/constants';
import Group from 'src/Group';
import Landing from 'src/Landing';
import Navigation from 'src/Navigation';
import Overlay from 'src/Overlay';
import Post from 'src/Post';
import Profile from 'src/Profile';

class App extends React.Component {
    public render() {
        return (
            <BrowserRouter>
                <Overlay />
                <AlertBox />
                <Navigation />
                <Toolbar />
                <Switch>
                    <Route path={routes.landing} component={Landing} />
                    <Route path={routes.chat} component={Chat} />
                    <Route path={routes.group} component={Group} />
                    <Route path={routes.profile} component={Profile} />
                    <Route path={routes.post} component={Post} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default withAuthentication(App);