/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

 var _ = require('lodash');

 const NN_TOP_GUESSES = 3;

 const TOPICS = [
   'bird',
   'circle',
 ]

import { Game, TurnOrder } from 'boardgame.io/core';

function nnWins(nnGuesses, topic) {
  for (var i = 0; i < Math.min(nnGuesses.length, NN_TOP_GUESSES); i++) {
    if (nnGuesses[i][0] === topic) {
      return true;
    }
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
    nnGuesses: null
  }),

  moves: {
    submitDraw(G, ctx, pathinks) {
      return { ...G, pathinks };
    },
    submitGuess(G, ctx, playerGuess) {
      return { ...G, playerGuess };
    },
    submitTraitor(G, ctx, [editedPathinks, nnGuesses]) {
      return { ...G, editedPathinks, nnGuesses};
    }  },

  flow: {
    movesPerTurn: 1,

    endGameIf: (G, ctx) => {
      console.log(G);
      // Need player guess and nn guess to be set
      if (G.playerGuess !== null && G.nnGuesses !== null) {
        console.log(G.nnGuesses);
        var win = null;
        var nnWin = nnWins(G.nnGuesses, G.topic);
        var playerWin = G.playerGuess === G.topic;
        if (playerWin && nnWin) {
          win = "both";
        } else if (playerWin) {
          win = "guesser";
        } else if (nnWin) {
          win = "ai";
        } else {
          win = "neither";
        }
        return {
          win: win,
          playerGuess: G.playerGuess,
          nnGuesses: G.nnGuesses,
          nnTopN: NN_TOP_GUESSES,
        }
      }
    },

    phases: [
      {
        name: 'draw phase',
        allowedMoves: ['submitDraw'],
        endPhaseIf: G => G.pathinks !== null,
        turnOrder: TurnOrder.ANY
      },
      {
        name: 'play phase',
        allowedMoves: ['submitGuess', 'submitTraitor'],
        endPhaseIf: G => G.playerGuess !== null && G.nnGuesses !== null,
        turnOrder: TurnOrder.ANY
      },
    ],
  },
});

export default TicTacToe;
