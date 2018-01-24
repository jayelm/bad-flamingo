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
// import predict from './keras_model.js';
import { exportPathInks, importPathInks } from './utils.js';

class BoardTraitor extends React.Component {
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
    this.importThenRender()
  }

  componentDidUpdate() {
    this.paper = new paper.PaperScope();
    this.paper.setup(this.canvas); // Setup Paper #canvas
    this.importThenRender()
  }

  importThenRender() {
    if (this.props.G.pathinks !== null) {
      this.pathinks = importPathInks(
        this.props.G.editedPathinks || this.props.G.pathinks,
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
      this.paths[i].onClick = () => {
        this.paths[i].remove();
        delete this.clonepathinks[thispath];
      };
    });
  }

  getCanvasDimensions() {
    var w = this.canvas.offsetWidth;
    var h = this.canvas.offsetHeight;
    return { height: h, width: w };
  }

  // Clear Paper Drawing Canvas
  clearDrawing() {
    // Remove Paper Path Layer
    this.drawInk();
  }

  submitTraitor() {
    // this.pathinks = this.clonepathinks
    this.checkQuickDraw();
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
    Object.keys(headers).forEach(function(key) {
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
      exportPathInks(
        this.clonepathinks,
        this.canvas.offsetWidth,
        this.canvas.offsetHeight
      ),
      this.scores,
    ]);
    // Add New Guess Scores to Score History
    // updateScoresHistory();
    // Plot Guess Scores
  }

  render() {
    const guess_form = (
      <div className="buttonHolder">
        <button
          className="submitButton"
          onClick={() => this.submitTraitor()}
          ref={submitButton => {
            this.submitButton = submitButton;
          }}
          disabled={
            this.props.G.editedPathinks !== null ||
            this.props.ctx.phase === 'draw phase'
          }
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

export default BoardTraitor;
