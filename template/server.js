const http = require('http');
const app = require('./app');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, (err) => {
    if (err) {
      return console.log("ERROR", err);
    }
    console.log(`Node API App is running on port ${PORT}`);
});
