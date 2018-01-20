/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

 const TOPICS = [
   'bird',
   'dolphin',
   'tomato'
 ]

import { Game } from 'boardgame.io/core';

function IsVictory(G) {
  if (G.guess !== null && G.guess === G.topic) {
    return true;
  }
  return false;
}

const TicTacToe = Game({
  name: 'tic-tac-toe',

  setup: () => ({
    pathinks: null,
    topic: TOPICS[Math.floor(Math.random() * TOPICS.length)],
    guess: null,
    editedGuess: null,
    googleWord: null
  }),

  moves: {
    submitDraw(G, ctx, pathinks) {
      return { ...G, pathinks };
    },
    submitGuess(G, ctx, guess) {
      return { ...G, guess };
    },
    submitTraitor(G, ctx, [editedGuess, googleWord]) {
      return { ...G, editedGuess, googleWord };
    }
  },

  flow: {
    movesPerTurn: 1,

    endGameIf: (G, ctx) => {
      if (IsVictory(G)) {
        return ctx.currentPlayer;
      }
    },
  },
});

export default TicTacToe;
