// games/tictactoe.js

let tttBoard = Array(9).fill(null);

function checkWin(player) {
  const combos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return combos.some(combo => combo.every(i => tttBoard[i] === player));
}

function computerMove() {
  const bestMove = minimax(tttBoard, "O").index;
  if (bestMove !== undefined) {
    tttBoard[bestMove] = "O";
  }
}

function minimax(board, player) {
  const availSpots = board.map((v, i) => v === null ? i : null).filter(i => i !== null);
  if (checkWin("X")) return { score: -10 };
  if (checkWin("O")) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };
  const moves = [];
  for (let i of availSpots) {
    const move = { index: i };
    board[i] = player;
    const result = minimax(board, player === "O" ? "X" : "O");
    move.score = result.score;
    board[i] = null; // Undo
    moves.push(move);
  }
  let bestMove;
  if (player === "O") {
    let bestScore = -Infinity;
    for (let move of moves) {
      if (move.score > bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let move of moves) {
      if (move.score < bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  }
  return bestMove;
}


function renderBoard(output) {
  output.innerHTML = "";
  const layout = `
 ${tttBoard[0] || " "} | ${tttBoard[1] || " "} | ${tttBoard[2] || " "}
---+---+---
 ${tttBoard[3] || " "} | ${tttBoard[4] || " "} | ${tttBoard[5] || " "}
---+---+---
 ${tttBoard[6] || " "} | ${tttBoard[7] || " "} | ${tttBoard[8] || " "}
  `;
  const line = document.createElement("p");
  line.innerHTML = `<pre>${layout}</pre>`;
  output.appendChild(line);
}

let currentGameState = { active: null, status: "idle" };

export function tttHandle(commandParts, output, woprActive, setGameState) {
  const command = commandParts[0].toLowerCase();
  const arg = commandParts[1];
  const response = document.createElement("p");

  if (!woprActive) {
    response.textContent = "Unkown Command. Use Help or Logout.";
    output.appendChild(response);
    return;
  }

  switch (command) {
    case "ttt-start":
      tttBoard = Array(9).fill(null);
      currentGameState = { active: "ttt", status: "playing" };
      setGameState(currentGameState);
      response.textContent = "Tic Tac Toe started.";
      break;

    case "ttt":
      if (currentGameState.active !== "ttt" || currentGameState.status !== "playing") {
        response.textContent = "Use ttt-start'.";
        break;
      }
      const pos = parseInt(arg);
      if (isNaN(pos) || pos < 0 || pos > 8 || tttBoard[pos]) {
        response.textContent = "Ungültiger Zug.";
        break;
      }
      tttBoard[pos] = "X";
      if (checkWin("X")) {
        response.textContent = "You won!\nShall we play another game?";
        currentGameState = { active: null, status: "ended" };
        setGameState(currentGameState);
        renderBoard(output);
        break;
      }
      computerMove();
      if (checkWin("O")) {
        response.textContent = "Joshua won!\nWould you like to play again?";
        currentGameState = { active: null, status: "ended" };
        setGameState(currentGameState);
        renderBoard(output);
        break;
      }
      if (tttBoard.every(cell => cell)) {
        response.textContent = "Draw!";
        currentGameState = { active: null, status: "ended" };
        setGameState(currentGameState);
        renderBoard(output);
        break;
      }
      response.textContent = "Zug ausgeführt.";
      break;

    case "ttt-exit":
      tttBoard = Array(9).fill(null);
      currentGameState = { active: null, status: "ended" };
      setGameState(currentGameState);
      response.textContent = "Game Over!";
      break;

    case "ttt-help":
      response.innerHTML = "Tic Tac Toe Commands:<br>ttt-start – New Game<br>ttt [0-8] – Move<br>ttt-exit – Quit Game";
      output.appendChild(response);
      break;

    default:
      response.textContent = `Unkown Command: ${commandParts.join(" ")}`;
  }

  output.appendChild(response);
  if (currentGameState.active === "ttt" && currentGameState.status === "playing") {
    renderBoard(output);
  }
}
