/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import TOPICS from "./topics";

import { TurnOrder, ActivePlayers } from 'boardgame.io/core';

const NN_TOP_GUESSES = 10;
const FIRST_TO_N = 10000;

function randomTopic(veto) {
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  if (veto !== undefined) {
    if (!Array.isArray(veto)) {
      veto = [veto];
    }
    if (veto.includes(topic) && veto.length < TOPICS.length) {
      return randomTopic(veto);
    }
  }
  return topic;
}

function nnWins(nnGuesses, topic) {
  for (var i = 0; i < Math.min(nnGuesses.length, NN_TOP_GUESSES); i++) {
    if (nnGuesses[i][0] === topic) {
      return true;
    }
  }
  return false;
}

function getWinResult(G, ctx) {
  // Need player guess and nn guess to be set
  if (G.playerGuess !== null && G.nnGuesses !== null) {
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
      nnTopN: NN_TOP_GUESSES
    };
  }
}

const moves = {
  submitDraw(G, ctx, pathinks) {
    console.log("submitDraw");
    return {
      ...G,
      pathinks: pathinks
      // TODO: Do we need this copy? (No - Jack)
      // editedPathinks: JSON.parse(JSON.stringify(pathinks)),
    };
  },
  submitGuess(G, ctx, playerGuess) {
    console.log("submitGuess");
    return { ...G, playerGuess };
  },
  // TODO: Add option where traitor just affirms everything
  // (that's called playing w/o traitor)
  submitTraitor(G, ctx, [editedPathinks, nnGuesses]) {
    console.log("submitTraitor");
    return { ...G, editedPathinks, nnGuesses };
  }
}

const BadFlamingo = {
  name: "bad-flamingo",

  minPlayers: 3,
  maxPlayers: 3,
  setup: () => ({
    round: 0,
    pathinks: null,
    topic: randomTopic(),
    previousTopics: [],
    playerGuess: null,
    editedPathinks: null,
    nnGuesses: null,
    playerScore: 0,
    aiScore: 0,
    lastPlayerGuess: null,
    lastNNGuesses: null,
    winResult: null,
    newRound: false
  }),

  endIf: (G, ctx) => {
    if (G.playerScore === FIRST_TO_N) {
      return "player";
    }
    if (G.aiScore == FIRST_TO_N) {
      return "AI";
    }
  },
  
    phases: {
      draw: {
        moves: {submitDraw: moves.submitDraw},
        endIf: G => G.pathinks !== null,
        next: 'traitor',
        start: true
      },
      traitor: {
        moves: {submitTraitor: moves.submitTraitor},
        endIf: G => G.editedPathinks !== null,
        next: 'guess'
      },
      guess: {
        moves: {submitGuess: moves.submitGuess},
        next: 'draw',
        endIf: G => getWinResult(G, undefined) !== undefined,
        onEnd: (G, ctx) => {
          var winResult = getWinResult(G, undefined);
          // Reset guesses, etc for next round
          return {
            ...G,
            playerScore:
              winResult.win === "guesser" ? G.playerScore + 1 : G.playerScore,
            aiScore:
              winResult.win === "ai" || winResult.win == "both"
                ? G.aiScore + 1
                : G.aiScore,
            topic: randomTopic(),
            previousTopics: [...G.previousTopics, G.topic],
            round: G.round + 1,
            pathinks: null,
            playerGuess: null,
            nnGuesses: null,
            editedPathinks: null,
            lastPlayerGuess: winResult.playerGuess,
            lastNNGuesses: winResult.nnGuesses,
            winResult: winResult,
            newRound: true
          };
        }
      }
    }
};

export default BadFlamingo;
