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
import predict from './keras_model.js';
import TOPICS from '../topics';
import horsey from 'horsey';
import './horsey.css';

const REAL_PLAYER_NAMES = ['drawer', 'traitor', 'guesser'];
console.log(TOPICS);

class Board extends React.Component {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any.isRequired,
    playerID: PropTypes.string,
    isActive: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      displayResults: false,
      round: 0,
    };
  }

  componentDidMount() {
    if (this.pathinks) {
      this.drawInk();
    }
    if (this.props.playerID == 0) {
      this.mountDrawer();
    } else if (this.props.playerID == 1) {
      this.mountTraitor();
    } else if (this.props.playerID == 2) {
      this.mountGuesser();
    }
  }

  displayLastRound() {
    this.overlay.style.display = 'block';
    // this.canvas.style.display = 'none';
    // TODO: Make this a bit more exciting - if possible, keep the image displayed
    setTimeout(() => {
      console.log('setting back to none');
      this.overlay.style.display = 'none';
      // this.canvas.style.display = 'block';
    }, 6000);
  }

  componentDidUpdate() {
    console.log('updating components');
    if (this.state.displayResults) {
      this.displayLastRound();
      this.state.displayResults = false;
    }
    if (this.props.playerID == 0) {
      // this.mountDrawer();
    } else if (this.props.playerID == 1) {
      this.updateTraitor();
    } else if (this.props.playerID == 2) {
      this.updateTraitor(); // Same action
    }
    if (this.pathinks) {
      this.drawInk();
    }
  }
  importPathInks(pathinks) {
    var pathsexport = Object.keys(pathinks);
    var d = Math.min(this.canvas.offsetWidth,this.canvas.offsetHeight)
    pathsexport = pathsexport.map(path => {
      var simplepath = JSON.parse(path);
      simplepath[1]['segments'] = simplepath[1]['segments'].map(segment => {
        return [
          segment[0] * d,
          segment[1] * d,
        ];
      });
      return JSON.stringify(simplepath);
    });
    var inks = Object.values(pathinks);
    inks = inks.map(ink => {
      ink[0] = ink[0].map(x => {
        return x * d;
      });
      ink[1] = ink[1].map(y => {
        return y * d;
      });
      return ink;
    });
    pathinks = ((o, a, b) => a.forEach((c, i) => (o[c] = b[i])) || o)(
      {},
      pathsexport,
      inks
    );
    return pathinks;
  }

  exportPathInks(pathinks) {
    var pathsexport = Object.keys(pathinks);
    var d = Math.min(this.canvas.offsetWidth,this.canvas.offsetHeight)
    pathsexport = pathsexport.map(path => {
      var simplepath = JSON.parse(path);
      simplepath[1]['segments'] = simplepath[1]['segments'].map(segment => {
        return [
          segment[0] / d,
          segment[1] / d,
        ];
      });
      return JSON.stringify(simplepath);
    });
    var inks = Object.values(pathinks);
    inks = inks.map(ink => {
      ink[0] = ink[0].map(x => {
        return x / d;
      });
      ink[1] = ink[1].map(y => {
        return y / d;
      });
      return ink;
    });
    return ((o, a, b) => a.forEach((c, i) => (o[c] = b[i])) || o)(
      {},
      pathsexport,
      inks
    );
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
      if (this.props.playerID == '1') {
        console.log('onclick register');
        this.paths[i].onClick = event => {
          console.log('onclick');
          this.paths[i].remove();
          delete this.clonepathinks[thispath];
        };
      }
    });
  }

  mountTraitor() {
    paper.install(this);
    this.paper = new paper.PaperScope();
    this.paper.setup(this.canvas); // Setup Paper #canvas
  }

  mountGuesser() {
    paper.install(this);
    this.paper = new paper.PaperScope();
    this.paper.setup(this.canvas); // Setup Paper #canvas
    horsey(this.guess, {
      debounce: 10,
      limit: 4,
      source: [{ list: TOPICS }],
    });
  }

  updateTraitor() {
    this.paper = new paper.PaperScope();
    this.paper.setup(this.canvas); // Setup Paper #canvas
    // if (this.pathinks) {
    //   this.drawInk();
    // }
  }

  mountDrawer() {
    this.guess = null;
    this.timer = 0;
    paper.install(this);
    this.initInk(); // Initialize Ink array ()
    this.paper = new paper.PaperScope();

    this.paper.setup(this.canvas); // Setup Paper #canvas

    var tool = new this.paper.Tool(); // Inititalize Paper Tool

    // Paper Tool Mouse Down Event
    tool.onMouseDown = event => {
      // New Paper Path and Settings

      this.path = new this.paper.Path();
      this.path.strokeColor = '#5C604D';
      this.path.strokeWidth = 7;
      this.paths.push(this.path);
      // Get Time [ms] for each Guess (needed for accurate Google AI Guessing)
      var thisTimestamp = event.event.timeStamp;
      if (this.timer === 0) {
        this.timer = 1;
        var time = 0;
      } else {
        var timeDelta = thisTimestamp - this.lastTimestamp;
        var time = this.ink[2][this.ink[2].length - 1] + timeDelta;
      }

      // Get XY point from event w/ time [ms] to update Ink Array
      this.newInk();
      this.updateInk(event.point, time);
      // Draw XY point to Paper Path
      this.path.add(event.point);

      // Reset Timestamps
      this.lastTimestamp = thisTimestamp;
    };

    // Paper Tool Mouse Drag Event
    tool.onMouseDrag = event => {
      // Get Event Timestamp and Timestamp Delta
      var thisTimestamp = event.event.timeStamp;
      var timeDelta = thisTimestamp - this.lastTimestamp;
      // Get new Time for Ink Array
      var time = this.ink[2][this.ink[2].length - 1] + timeDelta;

      // Get XY point from event w/ time [ms] to update Ink Array
      this.updateInk(event.point, time);
      // Draw XY point to Paper Path
      this.path.add(event.point);

      // Reset Timestamps
      this.lastTimestamp = thisTimestamp;

      // Check Google AI Quickdraw every 250 m/s
      // if(thisTimestamp - lastTimestamp_check > 250){
      //   checkQuickDraw();
      //   lastTimestamp_check = thisTimestamp;
      // }
    };
  }

  newInk() {
    if (
      this.ink &&
      this.ink[0] &&
      this.ink[0].length &&
      this.ink[0].length > 0
    ) {
      this.inks.push(this.ink);
    }
    this.ink = [[], [], []];
  }
  // Initialize Ink Array
  initInk() {
    this.paths = [];
    // ink = [[],[],[]];
    this.inks = [];
  }

  // Clear Paper Drawing Canvas
  clearDrawing() {
    // Remove Paper Path Layer
    this.paths.forEach(path => path.remove());
    // Init Ink Array
    this.initInk();
    if (this.props.playerID === "1") {
      this.drawInk();
    } else if (this.props.playerID === "0") {
      this.pathinks = {}
    }

    // Resert Variables
    this.timer = 0;

    // Destroy Guess Chart
    // chart.destroy();
  }

  // Update Ink Array w/ XY Point + Time
  updateInk(point, time) {
    this.ink[0].push(point.x);
    this.ink[1].push(point.y);
    this.ink[2].push(time);
  }

  isActive(id) {
    if (!this.props.isActive) return false;
    if (this.props.canvas !== null) return false;
    return true;
  }

  submit() {
    this.submitButton.disabled = true;
    if (this.props.playerID == 0) {
      this.submitDrawer();
    } else if (this.props.playerID == 1) {
      this.submitTraitor();
    } else if (this.props.playerID == 2) {
      this.submitGuess();
    }
  }

  submitTraitor() {
    // this.pathinks = this.clonepathinks

    this.checkQuickDraw();
  }

  getCanvasDimensions() {
    var w = this.canvas.offsetWidth;
    var h = this.canvas.offsetHeight;
    return { height: h, width: w };
  }

  checkQuickDraw() {
    // Get Paper Canvas Weight/Height
    var c_dims = this.getCanvasDimensions();

    // Set Base URL for Quickdraw Google AI API
    var url =
      'https://inputtools.google.com/request?ime=handwriting&app=quickdraw&dbg=1&cs=1&oe=UTF-8';

    // Set HTTP Headers
    var headers = {
      Accept: '*/*',
      'Content-Type': 'application/json',
    };

    // Init HTTP Request
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    Object.keys(headers).forEach(function(key, index) {
      xhr.setRequestHeader(key, headers[key]);
    });

    // HTTP Request On Load
    xhr.onload = () => {
      if (xhr.status === 200) {
        var res = xhr.responseText; // HTTP Response Text
        this.parseResponse(res); // Parse Response
      } else if (xhr.status !== 200) {
        console.log('Request failed.  Returned status of ' + xhr.status);
      }
    };

    // Create New Data Payload for Quickdraw Google AI API
    var data = {
      input_type: 0,
      requests: [
        {
          language: 'quickdraw',
          writing_guide: { width: c_dims.width, height: c_dims.height },
          ink: Object.values(this.clonepathinks),
        },
      ],
    };

    // Convert Data Payload to JSON String
    var request_data = JSON.stringify(data);

    // Send HTTP Request w/ Data Payload
    xhr.send(request_data);
  }

  // Parse Quickdraw Google AI API Response
  parseResponse(res) {
    // Convert Response String to JSON
    var res_j = JSON.parse(res);
    // Extract Guess Score String from Response and Convert to JSON
    this.scores = JSON.parse(
      res_j[1][0][3].debug_info.match(/SCORESINKS: (.+) Combiner:/)[1]
    );
    var p_title =
      'BEST GUESS: ' + this.scores[0][0] + ' (' + this.scores[0][1] + ')';
    console.log(p_title);
    this.props.moves.submitTraitor([
      this.exportPathInks(this.clonepathinks),
      this.scores,
    ]);
    // Add New Guess Scores to Score History
    // updateScoresHistory();
    // Plot Guess Scores
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

  submitDrawer() {
    this.newInk();
    var pathsexport = this.paths.map(path => path.exportJSON());
    var d = Math.min(this.canvas.offsetWidth,this.canvas.offsetHeight)
    pathsexport = pathsexport.map(path => {
      var simplepath = JSON.parse(path);
      simplepath[1]['segments'] = simplepath[1]['segments'].map(segment => {
        return [
          segment[0] / d,
          segment[1] / d,
        ];
      });
      return JSON.stringify(simplepath);
    });
    this.inks = this.inks.map(ink => {
      ink[0] = ink[0].map(x => {
        return x / d;
      });
      ink[1] = ink[1].map(y => {
        return y / d;
      });
      return ink;
    });
    var pathinks = ((o, a, b) => a.forEach((c, i) => (o[c] = b[i])) || o)(
      {},
      pathsexport,
      this.inks
    );
    this.props.moves.submitDraw(pathinks);
    // this.props.events.endTurn();
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

    var lastResult = (
      <div id="lastResult">
        <div id="playerGuess">
          Last Round Player Guess: {this.props.G.lastPlayerGuess}
        </div>
        <div id="nnGuess">
          Last Round AI Guess: {JSON.stringify(this.props.G.lastNNGuesses)}
        </div>
      </div>
    );
    if (this.props.G.round !== this.state.round) {
      console.log('new round!');
      // New game
      this.state.round = this.props.G.round;
      this.submitButton.disabled = false;
      // Clear canvas for drawer only (other players can continue viewing)
      if (this.props.playerID === '0') {
        console.log('clear drawer');
        this.clearDrawing();
      }
      this.state.displayResults = true;
    }

    var scores = (
      <div id="scores">
        <div id="playerScore">Player Score: {this.props.G.playerScore}</div>
        <div id="nnScore">AI Score: {this.props.G.aiScore}</div>
      </div>
    );

    if (this.props.G.editedPathinks !== null && this.props.playerID == '1') {
      // Traitor only messes around with editedPathInks
      this.pathinks = this.importPathInks(this.props.G.editedPathinks);
    } else if (this.props.G.pathinks !== null) {
      this.pathinks = this.importPathInks(this.props.G.pathinks);
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
      <div id="humanScore" className="scoreContainer"><h2>You</h2><p className="score">{this.props.G.playerScore}</p></div>
      <div id="AIScore" className="scoreContainer"><h2>AI</h2><p className="score">{this.props.G.aiScore}</p></div>
      </div>
    )

    let game_code = (<div id="gameCode"><p className="codeName">Code</p><p className="code">{this.props.gameID}</p></div>)

    let guess_form = null;
    // Player 2 (guesser) logic (TODO: don't forget about traitor)
    if (this.props.playerID !== null && this.props.playerID === '2') {
      guess_form = (
        <div id="buttonHolder">
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
            onClick={() => this.submit()}
            ref={submitButton => {
              this.submitButton = submitButton;
            }}
          >
            Guess
          </button>
        </div>
      );
    } else {
      guess_form = (
        <div className="buttonHolder">
          <button
            className="submitButton"
            onClick={() => this.submit()}
            ref={submitButton => {
              this.submitButton = submitButton;
            }}
          >
            Submit
          </button>
          <button
            className="resetButton"
            id="btnClear"
            onClick={() => this.clearDrawing()}
          >
            Reset
          </button>
        </div>
      );
    }

    return (
      <div>
        {playerPrompt}
                        <div
          id="overlay"
          ref={overlay => {
            this.overlay = overlay;
          }}
        >
          <p>
            The drawing was <strong>{
              this.props.G.previousTopics[
                this.props.G.previousTopics.length - 1
              ]
            }</strong>
          </p>
          <p>The player guessed <strong>{this.props.G.lastPlayerGuess}</strong></p>
          <p>
            The AI guessed <strong>{this.props.G.lastNNGuesses &&
              this.props.G.lastNNGuesses[0][0]}</strong></p>
        </div>
        <div id="wrapper">
          <canvas
            ref={canvas => {
              this.canvas = canvas;
            }}
          />
        </div>
        {guess_form}
        {score_display}
        {game_code}
        {winner}

      </div>
    );
  }
}

export default Board;
