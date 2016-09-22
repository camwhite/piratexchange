const app = require('./app');
const http = require('http');
const sockets = require('./sockets');

let port = process.env.PORT || 1337;
let httpServer = http.createServer(app);

app.set('port', port);

if(process.env.NODE_ENV !== 'production') {
  require('../webpack').bindTo(app);
}

httpServer.on('error', (err) => {
  console.log(err)
});

httpServer.on('listening',  () => {
  console.log('Express server is listening on ' + httpServer.address().port);
});

httpServer.listen(port, () => {
  sockets.connectTo(httpServer);
});
