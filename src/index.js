import React from "react";
import ReactDom from "react-dom";
import "./index.css";

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        key={i}
        winnerSquare={this.props.winnerLine?.includes(i) ? true : false}
      />
    );
  }
  render() {
    return (
      <div>
        {[...Array(3)].map((x, i) => (
          <div key={i} className="board-row">
            {[...Array(3)].map((x, j) => this.renderSquare(i * 3 + j))}
          </div>
        ))}
      </div>
    );
  }
}

function Square(props) {
  return (
    <button className={`square ${props.winnerSquare ? "winner-square" : ""}`} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          lastChange: null,
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      ascIsNext: false,
      lines: [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ],
      winnerLine: null,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const lines = this.state.lines;
    const winnerLine = calculateWinner(squares, lines);
    const draw = calculateDraw(current.squares, lines);
    if (squares[i] || winnerLine !== null || draw) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          lastChange: i,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  sortMoves() {
    this.setState({
      ascIsNext: !this.state.ascIsNext,
    });
  }

  getMoves() {
    const history = this.state.history;
    const moves = history.map((step, move) => {
      const [col, row] = [
        (step.lastChange % 3) + 1,
        Math.floor(step.lastChange / 3) + 1,
      ];
      const desc = move
        ? "Go to move (" + col + "," + row + ")"
        : "Go to game start";
      return (
        <li
          key={move}
          className={` ${
            move === this.state.stepNumber ? "selected-item" : ""
          }`}
        >
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });
    return this.state.ascIsNext ? moves.reverse() : moves;
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const lines = this.state.lines;
    const winner = calculateWinner(current.squares, lines);
    const ascIsNext = this.state.ascIsNext;
    const winnerLine = winner!==null ? lines[winner] : null;
    const draw = calculateDraw(current.squares, lines);
    const moves = this.getMoves();

    let status;
    if (winner) {
      status = "Winner: " + current.squares[lines[winner][0]];
    } else if (draw) {
      status = "Draw";
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winnerLine={winnerLine}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ToggleButton
            ascIsNext={ascIsNext}
            onClick={() => this.sortMoves()}
          ></ToggleButton>
          <ol reversed={ascIsNext}>{moves}</ol>
        </div>
      </div>
    );
  }
}

class ToggleButton extends React.Component {
  render() {
    return (
      <button onClick={() => this.props.onClick()}>
        {this.props.ascIsNext ? "Sort ascending" : "Sort descending"}
      </button>
    );
  }
}

ReactDom.render(<Game />, document.getElementById("root"));

function calculateWinner(squares, lines) {
  for (let i = 0; i < lines?.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return i;
    }
  }
  return null;
}

function calculateDraw(squares, lines) {
  let drawLinesCount = 0;
  for (let i = 0; i < lines?.length; i++) {
    const lineCells = lines[i];
    const lineValues = [];
    for (const cell of lineCells) {
      if (squares[cell] !== null) {
        lineValues.push(squares[cell]);
      }
    }
    if (lineValues.includes("X") && lineValues.includes("O")) {
      drawLinesCount += 1;
    }
  }
  if (drawLinesCount === lines.length) {
    return true
  }
  return false;
}
