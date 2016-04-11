var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Board = require('./board.js');

server.listen(8080);

app.get('/', function (req, res) {
  res.sendFile('/home/k/kmdice/tic-tac-toe' + '/index.html');
});

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
  io.to(gid).emit('start_game', { asdf: 'hi'});
  console.log('Start Game');
  // create a board object
  // Create eventlistening for the incoming connections from p1 and p2
  // We recieved a message from the play channel
  // Handle on disconnect

  var p1Turn = true;
  var board = new Board();
  p1.on('play', function(msg){
    var id = msg.squareId;
    var p1Symbol = "X";
    if(p1Turn && board.isValid(id)) {
      board.makeMove(id, p1Symbol);

      var win = board.checkWin();
      if(win == p1Symbol){
        p1.emit('you_win');
        p2.emit('you_lose');
      }


      p1Turn = false;
    }
  });
  p2.on('play', function(){
    var id = msg.squareId;
    var p2Symbol = "O";
    if(!p1Turn && board.isValid(id)){
      board.makeMove(id, p2Symbol);

      var win = board.checkWin();
      if(win == p2Symbol){
        p2.emit('you_win');
        p1.emit('you_lose');
      }

      p1Turn = true;
      
    }
  });
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

  socket.on('display_hello', function(){
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

    socket.on('play', function(data) {
      console.log(uid + " " + data.squareId);
    });
  });


});
