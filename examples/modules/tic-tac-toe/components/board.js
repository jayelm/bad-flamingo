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
import './w3.css';

const REAL_PLAYER_NAMES = [
  'drawer',
  'traitor',
  'guesser'
]

class Board extends React.Component {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any.isRequired,
    playerID: PropTypes.string,
    isActive: PropTypes.bool,
  };

  componentDidMount() {
    if (this.props.playerID == 0) {
      this.mountDrawer();
    } else if (this.props.playerID == 1) {
      this.mountTraitor();
    }
  }

  componentDidUpdate() {
    if (this.props.playerID == 0) {
      // this.mountDrawer();
    } else if (this.props.playerID == 1) {
      this.updateTraitor();
    }
  }
  importPathInks(pathinks) {
    var pathsexport = Object.keys(pathinks);

    pathsexport = pathsexport.map(path => {
      var simplepath = JSON.parse(path);
      simplepath[1]['segments'] = simplepath[1]['segments'].map(segment => {
        return [
          segment[0] * this.canvas.offsetWidth,
          segment[1] * this.canvas.offsetHeight,
        ];
      });
      return JSON.stringify(simplepath);
    });
    var inks = Object.values(pathinks);
    inks = inks.map(ink => {
      ink[0] = ink[0].map(x => {
        return x * this.canvas.offsetWidth;
      });
      ink[1] = ink[1].map(y => {
        return y * this.canvas.offsetHeight;
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

    pathsexport = pathsexport.map(path => {
      var simplepath = JSON.parse(path);
      simplepath[1]['segments'] = simplepath[1]['segments'].map(segment => {
        return [
          segment[0] / this.canvas.offsetWidth,
          segment[1] / this.canvas.offsetHeight,
        ];
      });
      return JSON.stringify(simplepath);
    });
    var inks = Object.values(pathinks);
    inks = inks.map(ink => {
      ink[0] = ink[0].map(x => {
        return x / this.canvas.offsetWidth;
      });
      ink[1] = ink[1].map(y => {
        return y / this.canvas.offsetHeight;
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
      this.paths.forEach(path => path.remove())
    }
    this.paths = [];
    Object.keys(this.pathinks).forEach(thispath => {
      var i = this.paths.push(new this.paper.Path()) - 1;
      this.paths[i].importJSON(thispath);
      this.paths[i].onClick = event => {
        this.paths[i].remove();
        delete this.clonepathinks[thispath];
      };
    });
  }

  mountTraitor() {
    paper.install(this);
    this.paper = new paper.PaperScope();
    this.paper.setup(this.canvas); // Setup Paper #canvas
  }

  updateTraitor() {
    this.paper = new paper.PaperScope();
    this.paper.setup(this.canvas); // Setup Paper #canvas
    if (this.pathinks) {
      this.drawInk();
    }
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
      this.path.strokeColor = 'black';
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
    this.paths.forEach(path => path.remove())

    // Init Ink Array
    this.initInk();
    if (this.props.playerID == 1) {
      this.drawInk();
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
    }
  }

  submitTraitor() {
    // this.pathinks = this.clonepathinks
    console.log('clone')
    console.log(this.clonepathinks)
    console.log('real')
    console.log(this.pathinks)
    this.checkQuickDraw()

  }

  getCanvasDimensions(){
    var w = this.canvas.offsetWidth;
    var h = this.canvas.offsetHeight;
    return {height: h, width: w};
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
    xhr.open('POST', url,false);
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
    var p_title = 'BEST GUESS: ' + this.scores[0][0] + ' (' + this.Scores[0][1] + ')';
    console.log(p_title)
    console.log('exporting')
    this.props.moves.submitTraitor([this.exportPathInks(this.clonepathinks), this.scores[0][0]])
    // Add New Guess Scores to Score History
    // updateScoresHistory();
    // Plot Guess Scores
  }

  submitGuess() {
    console.log(this.guess.value);
    if (this.guess !== null) {
      this.props.moves.submitGuess(this.guess.value);
    }
  }

  submitDrawer() {
    this.newInk();
    var pathsexport = this.paths.map(path => path.exportJSON());

    pathsexport = pathsexport.map(path => {
      var simplepath = JSON.parse(path);
      simplepath[1]['segments'] = simplepath[1]['segments'].map(segment => {
        return [
          segment[0] / this.canvas.offsetWidth,
          segment[1] / this.canvas.offsetHeight,
        ];
      });
      return JSON.stringify(simplepath);
    });
    this.inks = this.inks.map(ink => {
      ink[0] = ink[0].map(x => {
        return x / this.canvas.offsetWidth;
      });
      ink[1] = ink[1].map(y => {
        return y / this.canvas.offsetHeight;
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
      winner = <div id="winner">Winner: {this.props.ctx.gameover}</div>;
    }
    if (this.props.G.editedPathinks !== null) {
      console.log(this.props.G.editedPathinks)
      console.log(this.props.G.pathinks)
      this.pathinks = this.importPathInks(this.props.G.editedPathinks);
    } else if (this.props.G.pathinks !== null) {
      this.pathinks = this.importPathInks(this.props.G.pathinks);
    }

    let phase = <div id="phase">Phase: {this.props.ctx.phase}</div>

    let player = null;
    if (this.props.playerID !== null) {
      player = <div id="player">You are the <strong>{REAL_PLAYER_NAMES[this.props.playerID]}</strong>
        </div>;
    }
    let game = null;
    if (this.props.gameID !== null) {
      game = <div id="game">Game: {this.props.gameID}</div>;
    }
    let topic = null;

    // Player 0 (drawer) logic
    if (this.props.playerID !== null && this.props.playerID === "0") {
      topic = <div id="topic">Draw a <strong>{this.props.G.topic}</strong></div>;
    }

    let guess_form = null;
    // Player 1 (guesser) logic (TODO: don't forget about traitor)
    if (this.props.playerID !== null && this.props.playerID === "2") {
      guess_form = (
        <div id="guessform">
        <p>Your guess:</p><br></br>
        <input ref={guess => {this.guess = guess;}}
          id="df" type="text" name="guess"></input>
        <button className="w3-btn w3-ripple w3-red" id="guessSubmit"
         onClick={() => this.submitGuess()}>Submit Guess</button>
         </div>
      )
    }

    return (
      <div>
        <button
          className="w3-btn w3-ripple w3-red"
          id="btnClear"
          onClick={() => this.clearDrawing()}
        >
          Reset
        </button>
        {topic}
        <div id="wrapper">
          <canvas
            ref={canvas => {
              this.canvas = canvas;
            }}
          />
          <br />
        </div>
        <button
          className="w3-btn w3-ripple w3-green"
          onClick={() => this.submit()}
          ref={submitButton => {
              this.submitButton = submitButton;
            }}
        >
          Submit
        </button>

        {player}
        {game}
        {phase}
        {winner}
        {guess_form}
      </div>
    );
  }
}

export default Board;
