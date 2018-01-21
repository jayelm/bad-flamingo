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

const Multiplayer = props => {
  var playerid = props.match.params.playerid;
  var gameid = props.match.params.gameid;
  if (!(playerid === '0' || playerid === '1' || playerid === '2')) {
    return (
      <div>
        <p>Invalid playerID</p>
        <p>Must be 0 (drawer), 1 (traitor), or 2 (guesser)</p>
      </div>
    );
  }
  return (
    <section className="drawWrapper">
      <div className="headerSection">
        <h1 className="title">Bad Flamingo</h1>
      </div>
      <div className="gameContainer">
        <App
          gameID={props.match.params.gameid}
          playerID={props.match.params.playerid}
        />
      </div>
    </section>
  );
};

export default Multiplayer;
