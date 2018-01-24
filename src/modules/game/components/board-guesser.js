/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import paper from 'paper';
import PropTypes from 'prop-types';
import './board.css';
import TOPICS from '../topics';
import horsey from 'horsey';
import './horsey.css';
import { importPathInks } from './utils.js';

class BoardGuesser extends React.Component {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any.isRequired,
    playerID: PropTypes.string,
    isActive: PropTypes.bool,
  };

  componentDidMount() {
    paper.install(this);
    this.paper = new paper.PaperScope();
    this.paper.setup(this.canvas); // Setup Paper #canvas
    horsey(this.guess, {
      debounce: 10,
      limit: 4,
      source: [{ list: TOPICS }],
    });
    this.importThenRender();
  }

  componentDidUpdate() {
    this.paper = new paper.PaperScope();
    this.paper.setup(this.canvas); // Setup Paper #canvas
    this.importThenRender();
  }

  importThenRender() {
    if (this.props.G.pathinks !== null) {
      this.pathinks = importPathInks(
        this.props.G.pathinks,
        this.canvas.offsetWidth,
        this.canvas.offsetHeight
      );
      this.drawInk();
    }
  }

  drawInk() {
    this.clonepathinks = JSON.parse(JSON.stringify(this.pathinks));
    if (this.paths) {
      this.paths.forEach(path => path.remove());
    }
    this.paths = [];
    Object.keys(this.pathinks).forEach(thispath => {
      var i = this.paths.push(new this.paper.Path()) - 1;
      this.paths[i].importJSON(thispath);
    });
  }

  // Clear Paper Drawing Canvas
  clearDrawing() {
    // Remove Paper Path Layer
    if (this.paths) {
      this.paths.forEach(path => path.remove());
      this.paths = []
    }
  }

  submitGuess() {
    if (this.guess !== null) {
      if (this.guess === '') {
        alert('Enter a guess!');
      } else {
        this.props.moves.submitGuess(this.guess.value);
      }
    }
  }

  render() {
    const guess_form = (
      <div className="buttonHolder">
        <input
          ref={guess => {
            this.guess = guess;
          }}
          id="df"
          type="text"
          name="guess"
        />
        <button
          className="submitButton"
          id="guessSubmit"
          onClick={() => this.submitGuess()}
          ref={submitButton => {
            this.submitButton = submitButton;
          }}
          disabled={this.props.G.playerGuess !== null}
        >
          Guess
        </button>
      </div>
    );

    return (
      <div>
        <div id="wrapper">
          <canvas
            ref={canvas => {
              this.canvas = canvas;
            }}
          />
        </div>
        {guess_form}
      </div>
    );
  }
}

export default BoardGuesser;
