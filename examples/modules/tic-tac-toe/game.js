/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

 const TOPICS = [
   'bird',
   'circle',
 ]

import { Game, TurnOrder } from 'boardgame.io/core';

function IsVictory(G) {

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
      console.log('submit guess move played!');
      console.log({ ...G, playerGuess });
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
      if (G.playerGuess !== null && G.nnGuess !== null) {
        var win = null;
        if (G.playerGuess === G.topic && G.nnGuess === G.topic) {
          win = "both";
        } else if (G.playerGuess === G.topic) {
          win = "guesser";
        } else if (G.nnGuess === G.topic) {
          win = "ai";
        } else {
          win = "neither";
        }
        return {
          win: win,
          playerGuess: G.playerGuess,
          nnGuess: G.nnGuess
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
        endPhaseIf: G => G.playerGuess !== null && G.nnGuess !== null,
        turnOrder: TurnOrder.ANY
      },
    ],
  },
});

export default TicTacToe;
