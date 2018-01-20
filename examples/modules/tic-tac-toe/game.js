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
  if (G.playerGuess !== null && G.nnGuess === G.topic) {
    return true;
  }
  return false;
}

const TicTacToe = Game({
  name: 'tic-tac-toe',

  setup: () => ({
    pathinks: null,
    topic: TOPICS[Math.floor(Math.random() * TOPICS.length)],
    playerGuess: null,
    editedPathinks: null,
    nnGuess: null
  }),

  moves: {
    submitDraw(G, ctx, pathinks) {
      return { ...G, pathinks };
    },
    submitGuess(G, ctx, playerGuess) {
      return { ...G, playerGuess };
    },
    submitTraitor(G, ctx, [editedPathinks, nnGuess]) {
      return { ...G, editedPathinks, nnGuess };
    }  },

  flow: {
    movesPerTurn: 1,

    endGameIf: (G, ctx) => {
      if (IsVictory(G)) {
        return ctx.currentPlayer;
      }
    },

    phases: [
      {
        name: 'draw phase',
        allowedMoves: ['submitDraw'],
        endPhaseIf: G => G.pathinks !== null
      },
      {
        name: 'play phase',
        allowedMoves: ['submitGuess', 'submitTraitor'],
        endPhaseIf: G => G.playerGuess !== null && G.nnGuess !== null
      },
    ],
  },
});

export default TicTacToe;
