import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Chat from 'src/Chat/Chat';
import { routes } from 'src/constants';
import Group from 'src/Group';
import Landing from 'src/Landing';
import Post from 'src/Post';
import Profile from 'src/Profile';
import SignIn from 'src/SignIn';
import SignUp from 'src/SignUp';

class App extends React.Component {
    public render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route path={routes.landing} component={Landing} />
                    <Route path={routes.chat} component={Chat} />
                    <Route path={routes.group} component={Group} />
                    <Route path={routes.profile} component={Profile} />
                    <Route path={routes.signIn} component={SignIn} />
                    <Route path={routes.signUp} component={SignUp} />
                    <Route path={routes.post} component={Post} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;
