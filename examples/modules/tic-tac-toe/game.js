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
    canvas: null
  }),

  moves: {
    clickCell(G, ctx, id) {
        var canvas = 3;
        return { ...G, canvas };
    },
  },

  flow: {
    movesPerTurn: 1,

    endGameIf: (G, ctx) => {
      if (IsVictory(G.canvas)) {
        return ctx.currentPlayer;
      }
    },
  },
});

export default TicTacToe;
