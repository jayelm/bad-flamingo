/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Game } from 'boardgame.io/core';

function IsVictory(canvas) {
  return false;
}

const TicTacToe = Game({
  name: 'tic-tac-toe',

  setup: () => ({
    pathinks: null,
  }),

  moves: {
    submitDraw(G, ctx, pathinks) {
      return { ...G, pathinks };
    },
  },

  flow: {
    movesPerTurn: 5,

    endGameIf: (G, ctx) => {
      if (IsVictory(G.pathinks)) {
        return ctx.currentPlayer;
      }
    },
  },
});

export default TicTacToe;
