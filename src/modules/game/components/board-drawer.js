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
import { exportPathInks, importPathInks } from './utils.js';

// const REAL_PLAYER_NAMES = ['drawer', 'traitor', 'guesser'];

class BoardDrawer extends React.Component {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any.isRequired,
    playerID: PropTypes.string,
    isActive: PropTypes.bool,
  };

  componentDidMount() {
    this.mountDrawer();
    this.importThenRender()
  }

  componentDidUpdate() {
    this.importThenRender()
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
      var time;
      if (this.timer === 0) {
        this.timer = 1;
        time = 0;
      } else {
        var timeDelta = thisTimestamp - this.lastTimestamp;
        time = this.ink[2][this.ink[2].length - 1] + timeDelta;
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

    this.pathinks = {};

    // Resert Variables
    this.timer = 0;
  }

  // Update Ink Array w/ XY Point + Time
  updateInk(point, time) {
    this.ink[0].push(point.x);
    this.ink[1].push(point.y);
    this.ink[2].push(time);
  }

  submitDrawer() {
    this.newInk();
    var pathsexport = this.paths.map(path => path.exportJSON());
    var pathinks = ((o, a, b) => a.forEach((c, i) => (o[c] = b[i])) || o)(
      {},
      pathsexport,
      this.inks
    );
    this.props.moves.submitDraw(
      exportPathInks(
        pathinks,
        this.canvas.offsetWidth,
        this.canvas.offsetHeight
      )
    );
    // this.props.events.endTurn();
  }

  render() {
    const guess_form = (
      <div className="buttonHolder">
        <button
          className="submitButton"
          onClick={() => this.submitDrawer()}
          ref={submitButton => {
            this.submitButton = submitButton;
          }}
          disabled={this.props.G.pathinks !== null}
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

export default BoardDrawer;
