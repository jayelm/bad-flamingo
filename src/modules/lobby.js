import { Lobby } from 'boardgame.io/react';
import BadFlamingo from './game/game';
import React from "react";
import Board from './game/components/board.js';

const importedGames = [{game: BadFlamingo, board: Board}];

class LobbyScreen extends React.Component {
    render() {
        return <Lobby
        gameServer={`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}
        lobbyServer={`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}
        gameComponents={importedGames}
      />
    }
}

export default LobbyScreen;