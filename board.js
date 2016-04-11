var Board = function(){
  this.board = new Array(9);
};

Board.prototype.isValid = function(space){
  return this.board[space] == undefined;
}

Board.prototype.makeMove = function(space, symbol){
  this.board[space] = symbol;
}
Board.prototype.checkWin = function(){
  //Iterate through each 3 consecutive spaces
  
  //Check for vertical
  for (var i = 0; i <7; i+=3){
    //Check if 3 consecutive horizontal spaces are equal
    if (this.board[i]!=undefined && this.board[i]==this.board[i+1] && this.board[i+1]==this.board[i+2]){
      //Player at i won with horizontal 
      return this.board[i]; 
    }
  }
  //Check for vertical
  for (var i = 0; i < 3; i++ ){
    //Check if 3 consecutive vertical spaces are equal
    if (this.board[i]!=undefined && this.board[i]==this.board[i + 3] && this.board[i + 3]==this.board[i+6]){
      //Player at i won with vertical 
      return this.board[i]; 
    }
  }
  
  //  \__
  //  _\_
  //  __\
  //Check if 3 diagonal spaces are equal
  if (this.board[0]!=undefined && this.board[0]==this.board[4] && this.board[4]==this.board[8]){
     //Player at i won with diagonal 
      return this.board[0]; 
  }
  
  //  __/
  //  _/_
  //  /__
  //Check if 3 diagonal spaces are equal
  if (this.board[6]!=undefined && this.board[6]==this.board[4] && this.board[4]==this.board[2]){
     //Player at i won with diagonal 
      return this.board[6]; 
  }
  return undefined;
}
module.exports = Board;
