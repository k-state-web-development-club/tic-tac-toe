var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Board = require('./board.js');

server.listen(3001);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/tv', function (req, res) {
  res.sendFile(__dirname + '/tv.html');
});

app.use(express.static('assets'));

var player_num = 0;
var game_num = 0;
var playerQueue = [];
var freeDisplayBoards = [];

var canStartGame = function(){
  return freeDisplayBoards.length > 0 && playerQueue.length > 1;
}

var startGame = function(){
  var gid = String(game_num);
  game_num++;
  var p1 = playerQueue.shift();
  var p2 = playerQueue.shift();
  var db = freeDisplayBoards.shift();
  p1.join(gid);
  p2.join(gid);
  db.join(gid);
  io.to(gid).emit('game_board', db.boardId);


  var handleDisconnect = function(){
    console.log("Game " + gid + " has been disconnected");
    io.to(gid).emit('disconnected', ':(');
  }

  p1.on('disconnect', handleDisconnect);
  p2.on('disconnect', handleDisconnect);
  db.on('disconnect', handleDisconnect);


  io.to(gid).emit('start_game', { asdf: 'hi'});
  console.log('Start Game');
  // create a board object
  // Create eventlistening for the incoming connections from p1 and p2
  // We recieved a message from the play channel
  // Handle on disconnect


  p1.symbol = "X";
  p2.symbol = "O";
  p1.turn = true;
  p2.turn = false;

  var turn = true;
  var board = new Board();

  function genHandler(current, other){
    return function(msg){
      var id = msg.squareId;
      var symbol = current.symbol;
      if(turn === current.turn && board.isValid(id)) {
        board.makeMove(id, symbol);
        io.to(gid).emit('move_made', {squareId: id, symbol: symbol});

        var win = board.checkWin();
        if(win === symbol){
          current.emit('you_win', 'asdfasdfasdf');
          other.emit('you_lose');
          console.log('player ' + symbol + ' won!');
        }

        turn = !turn;
      }
    }
  }



  p1.on('play', genHandler(p1, p2));
  p2.on('play', genHandler(p2, p1));


  p1.on('disconnect', function(){
    console.log("disconnected");
    p2.emit('disconnect');
  });
  p2.on('disconnect', function(){
    console.log("disconnected");
    p1.emit('disconnect');
  });
  //
}

io.on('connection', function(socket) {

  socket.on('display_hello', function(msg){
    socket.boardId = msg;
    freeDisplayBoards.push(socket);

    if(canStartGame()){
      startGame();
    }

    console.log('display hello');
  });

  socket.on('client_hello', function(){
    var uid = player_num;
    player_num = player_num + 1;
    playerQueue.push(socket);
    
    console.log('client_hello');

    if(canStartGame()){
      startGame();
    } else {
      socket.emit('position');
    }

  });


});
