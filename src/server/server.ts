import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import router from './routes/routes';

const publicPath = path.resolve(__dirname, './public');

const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
  req.publicPath = publicPath;
  next();
});
app.use(express.static(publicPath));
app.use(router);

const server = app.listen(3000);

server.on('listening', () => {
  const address = server.address();
  const addressStr = typeof address === 'string' ?
                     `pipe${address}` : `${address.address}:${address.port}`;
  console.debug(`listening at ${addressStr}`);
});

server.on('error', err => {
  
});
