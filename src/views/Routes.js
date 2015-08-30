import React from 'react';
import {Route, DefaultRoute} from 'react-router';
import Main from 'views/Main';

/**
* ## Routes
* The React Routes for both the server and the client.
* @constructor
*/
export default (
  <Route path="/">
    <DefaultRoute handler={Main} />
  </Route>
);
