/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from 'boardgame.io/react';
import BadFlamingo from '../game';
import Board from './board';
import { SocketIO } from 'boardgame.io/multiplayer';
import logger from 'redux-logger';
import { applyMiddleware } from 'redux';


const App = Client({
  game: BadFlamingo,
  enhancer: applyMiddleware(logger),
  board: Board,
  debug: false,
  numPlayers: 3,
  multiplayer: SocketIO({ server: `${window.location.protocol}//${window.location.hostname}:${window.location.port}`}),
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
