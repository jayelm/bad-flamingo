import path from 'path';
import KoaStatic from 'koa-static';
import KoaHelmet from 'koa-helmet';
import { Server } from 'boardgame.io/server';
import BadFlamingo from './modules/game/game';

const PORT = process.env.PORT || 8000;
const DEV = process.env.NODE_ENV === 'development';
const PROD = !DEV;

const server = Server({ games: [BadFlamingo], lobbyConfig: {} });
server.app.use(KoaStatic('build'));
server.app.use(KoaHelmet());

server.run({ port: PORT, lobbyConfig: {} }, () => {
  console.log(`Serving at: http://localhost:${PORT}/`);
});
