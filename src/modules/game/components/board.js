/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import './board.css';
import BoardDrawer from './board-drawer.js';
import BoardTraitor from './board-traitor.js';
import BoardGuesser from './board-guesser.js';

class Board extends React.Component {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any.isRequired,
    playerID: PropTypes.string,
    isActive: PropTypes.bool,
    gameID: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      displayResults: false,
      round: 0,
    };
  }

  componentWillUpdate(nextProps) {
    if (nextProps.G.round !== this.props.G.round) {
      this.setState({ displayResults: true });
      setTimeout(() => {
        this.setState({ displayResults: false });
        // this.canvas.style.display = 'block';
      }, 3000);
    }
  }

  renderSwitch() {
    switch (this.props.playerID) {
      case '0':
        return <BoardDrawer {...this.props} />;
      case '1':
        return <BoardTraitor {...this.props} />;
      case '2':
        return <BoardGuesser {...this.props} />;
      default:
        return <div>Well, this is embarassing.</div>;
    }
  }

  render() {
    let winner = null;
    if (this.props.ctx.gameover !== undefined) {
      winner = (
        <div id="results">
          <div id="winner">Winner: {this.props.ctx.gameover.win}</div>
          <div id="playerGuess">
            Player Guess: {this.props.ctx.gameover.playerGuess}
          </div>
          <div id="nnGuess">
            AI Guess: {JSON.stringify(this.props.ctx.gameover.nnGuesses)}
          </div>
        </div>
      );
    }

    let playerPrompt = null;
    if (this.props.playerID !== null) {
      if (this.props.playerID == '0') {
        if (this.props.ctx.phase === 'draw phase') {
          playerPrompt = (
            <div id="player">
              <p>
                You are the <strong>drawer</strong>.
                <br />Draw a <strong>{this.props.G.topic}</strong>.
              </p>
            </div>
          );
        } else {
          playerPrompt = (
            <div id="player">
              <p>
                You are the <strong>drawer</strong>.
                <br />Wait for the other players to submit.
              </p>
            </div>
          );
        }
      } else if (this.props.playerID == '1') {
        if (this.props.ctx.phase === 'draw phase') {
          playerPrompt = (
            <div id="player">
              <p>
                You are the <strong>traitor</strong>.
                <br />Wait for the drawer.
              </p>
            </div>
          );
        } else {
          playerPrompt = (
            <div id="player">
              <p>
                You are the <strong>traitor</strong>.
                <br />Help the AI understand the drawing.
              </p>
            </div>
          );
        }
      } else if (this.props.playerID == '2') {
        if (this.props.ctx.phase === 'draw phase') {
          playerPrompt = (
            <div id="player">
              <p>
                You are the <strong>guesser</strong>.
                <br />Wait for the drawer.
              </p>
            </div>
          );
        } else {
          playerPrompt = (
            <div id="player">
              <p>
                You are the <strong>guesser</strong>.
                <br />Guess the image!
              </p>
            </div>
          );
        }
      } else {
        playerPrompt = <div id="player">UNKNOWN PLAYER</div>;
      }
    }

    let score_display = null;
    score_display = (
      <div id="scoreDisplay">
        <div id="humanScore" className="scoreContainer">
          <h2>Humans</h2>
          <p className="score">{this.props.G.playerScore}</p>
        </div>
        <div id="AIScore" className="scoreContainer">
          <h2>AI</h2>
          <p className="score">{this.props.G.aiScore}</p>
        </div>
      </div>
    );

    let game_code = (
      <div id="gameCode">
        <p className="codeName">Code</p>
        <p className="code">{this.props.gameID}</p>
      </div>
    );

    return (
      <div>
        {playerPrompt}
        <div
          id="overlay"
          ref={overlay => {
            this.overlay = overlay;
          }}
          style={{display: this.state.displayResults ? 'block' : 'none'}}
        >
          <p>
            The drawing was{' '}
            <strong>
              {
                this.props.G.previousTopics[
                  this.props.G.previousTopics.length - 1
                ]
              }
            </strong>
          </p>
          <p>
            The player guessed <strong>{this.props.G.lastPlayerGuess}</strong>
          </p>
          <p>
            The AI guessed{' '}
            <strong>
              {this.props.G.lastNNGuesses &&
                ((this.props.G.lastNNGuesses.find(entry => {
                  return (
                    entry[0] ==
                    this.props.G.previousTopics[
                      this.props.G.previousTopics.length - 1
                    ]
                  );
                }) || [])[0] ||
                  this.props.G.lastNNGuesses[0][0])}
            </strong>
          </p>
        </div>
        {this.renderSwitch()}
        {score_display}
        {game_code}
        {winner}
      </div>
    );
  }
}

export default Board;
