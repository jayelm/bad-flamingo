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
      this.mountDrawer();
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
    console.log(pathsexport);

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
    console.log(inks);
    pathinks = ((o, a, b) => a.forEach((c, i) => (o[c] = b[i])) || o)(
      {},
      pathsexport,
      inks
    );
    return pathinks;
  }

  drawInk() {
    console.log('drawInk: ' + this.props.playerID)
    var clonepathinks = JSON.parse(JSON.stringify(this.pathinks));
    var paths = [];
    Object.keys(clonepathinks).forEach(thispath => {
      console.log(thispath);
      var i = paths.push(new this.paper.Path()) - 1;
      paths[i].importJSON(thispath);
      paths[i].onClick = event => {
        this.opacity = 0;
        delete this.pathinks[thispath];
      };
      console.log(this.paper)
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
    if (this.pathinks ){
      this.drawInk()
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
      console.log(this.paths);
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
    this.paper.project.activeLayer.removeChildren();
    this.paper.view.draw();

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

  submitGuess() {
    console.log(this.guess.value);
    if (this.guess !== null) {
      this.props.moves.submitGuess(this.guess.value);
    }
  }

  exportPathInks() {
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
    console.log(JSON.stringify(pathinks));
    this.props.moves.submitDraw(pathinks);
    // this.props.events.endTurn();
  }

  render() {
    let winner = null;
    if (this.props.ctx.gameover !== undefined) {
      winner = <div id="winner">Winner: {this.props.ctx.gameover}</div>;
    }
    if (this.props.G.pathinks !== null) {
      this.pathinks = this.importPathInks(this.props.G.pathinks);
    }

    let player = null;
    if (this.props.playerID !== null) {
      player = <div id="player">Player: {this.props.playerID}</div>;
    }
    let game = null;
    if (this.props.gameID !== null) {
      game = <div id="game">Game: {this.props.gameID}</div>;
    }
    let topic = null;

    // Player 0 (drawer) logic
    if (this.props.playerID !== null && this.props.playerID === "0") {
      topic = <div id="topic">Please draw a {this.props.G.topic}.</div>;
    }

    let guess_form = null;
    // Player 1 (guesser) logic (TODO: don't forget about traitor)
    if (this.props.playerID !== null && this.props.playerID === "1") {
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
          clear
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
          onClick={() => this.exportPathInks()}
        >
          Submit
        </button>

        {player}
        {game}
        {winner}
        {guess_form}
      </div>
    );
  }
}

export default Board;
