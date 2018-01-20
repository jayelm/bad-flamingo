/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from 'boardgame.io/client';
import TicTacToe from '../game';
import Board from './board';

const App = Client({
  game: TicTacToe,
  board: Board,
  debug: false,
  multiplayer: true,
});

const Multiplayer = () => (
  <div style={{ padding: 0 }}>
    <div className="run">
      <App gameID="multi" playerID="0" />
    </div>
    <div className="run">
      <App gameID="multi" playerID="1" />
    </div>
  </div>
);

export default Multiplayer;
