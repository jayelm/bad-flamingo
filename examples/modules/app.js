/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import _ from 'lodash';
import LiNavLink from './li-navlink';

import routes from './routes';
import './app.css';

// CSS for the sidebar is taken from vue.css
const App = () => (
  <Router>
    <main>
      <section className="drawWrapper">
        {_.flattenDeep(routes.map(route => route.routes)).map((route, idx) => (
          <Route
            key={idx}
            exact
            path={route.path}
            component={route.component}
          />
        ))}
      </section>
    </main>
  </Router>
);

export default App;
