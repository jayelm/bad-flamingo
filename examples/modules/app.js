/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { HashRouter as Router, Route, browserHistory } from 'react-router-dom';
import _ from 'lodash';
import LiNavLink from './li-navlink';

import Multiplayer from './tic-tac-toe/components/multiplayer.js';
import './app.css';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imgSrc: 'http://colinmorris.github.io/assets/quickdraw/svgs/bottom/awful/0.svg'
    }
    this.images = [
      "http://colinmorris.github.io/assets/quickdraw/svgs/bottom/awful/1.svg",
      "http://colinmorris.github.io/assets/quickdraw/svgs/bottom/awful/2.svg",
      "http://colinmorris.github.io/assets/quickdraw/svgs/bottom/awful/3.svg",
      "http://colinmorris.github.io/assets/quickdraw/svgs/bottom/awful/4.svg",
      "http://colinmorris.github.io/assets/quickdraw/svgs/bottom/awful/5.svg",
      "http://colinmorris.github.io/assets/quickdraw/svgs/bottom/awful/0.svg",

    ]
    this.idx = 0
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({
        imgSrc: this.images[this.idx]
      })
        this.idx = this.idx + 1
    }
, 5000);
    var images = [], x = -1;
  }

    render() {
      return (
        <div className="parentWrapper">
        <a href="https://github.com/jayelm/bad-flamingo-2" className="github-corner" aria-label="View source on Github">
          <svg width="80" height="80" viewBox="0 0 250 250" style={{fill:"#FFBAD2", color: "#FFFFFF", position: "absolute", top: "0", border: "0", right: "0"}} aria-hidden="true">
            <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
            <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="#FFFFFF" style={{transformOrigin: "130px 106px",}} className="octo-arm"></path>
            <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="#FFFFFF" className="octo-body"></path>
          </svg>
        </a>
        <div className="table-outer">
          <div className="table-inner">
            <div className="hero">
              <img src={this.state.imgSrc} id="bflogo" ref={bflogo => {this.bflogo = bflogo;}}></img>
              <h1 className="heroname">Bad Flamingo</h1>
              <p>Draw with your friends and fool the computer!</p>
              <button>New</button><br></br><br></br>
              <input id="gameCode" type="text" name="gameCode" placeholder="game code"></input><br></br>
              <button>Join</button>
            </div>
          </div>
        </div>
        <div className="footer">
          <div className="footer-inner">
          <div className="hcinfo">
            <a href="https://hackcambridge.com"><img className="hclogo" src="https://hackcambridge.com/assets/images/logo.656e63b3.svg"></img></a>
            <p>A <a href="https://hackcambridge.com/">Hack Cambridge Ternary</a> Project in memory of <a href="http://colinmorris.github.io/blog/bad_flamingos">bad flamingos</a> worldwide</p>
          </div>
          </div>
        </div>

        </div>
      );
    }

}

const App = () => (
  <Router history={browserHistory}>
  <main>
  <Route
    key="1"
    exact
    path="/:gameid/:playerid"
    component={Multiplayer}
  />
      <Route
        key="2"
        exact
        path="/"
        component={Main}
      />
  </main>
  </Router>
);

export default App;
