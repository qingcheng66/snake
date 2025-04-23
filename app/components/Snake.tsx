'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 }
];

const Snake: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  const generateFood = () => {
    const newFood = {
      x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
      y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
    };
    setFood(newFood);
  };

  const moveSnake = () => {
    if (gameOver) return;

    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (direction) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }

    // Check wall collision
    if (
      head.x < 0 ||
      head.x >= CANVAS_SIZE / GRID_SIZE ||
      head.y < 0 ||
      head.y >= CANVAS_SIZE / GRID_SIZE
    ) {
      setGameOver(true);
      return;
    }

    // Check self collision
    if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      return;
    }

    newSnake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
      setScore(score => score + 1);
      generateFood();
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        if (direction !== 'DOWN') setDirection('UP');
        break;
      case 'ArrowDown':
        if (direction !== 'UP') setDirection('DOWN');
        break;
      case 'ArrowLeft':
        if (direction !== 'RIGHT') setDirection('LEFT');
        break;
      case 'ArrowRight':
        if (direction !== 'LEFT') setDirection('RIGHT');
        break;
    }
  };

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw snake
    ctx.fillStyle = '#00ff00';
    snake.forEach(segment => {
      ctx.fillRect(
        segment.x * GRID_SIZE,
        segment.y * GRID_SIZE,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );
    });

    // Draw food
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(
      food.x * GRID_SIZE,
      food.y * GRID_SIZE,
      GRID_SIZE - 2,
      GRID_SIZE - 2
    );
  };

  useEffect(() => {
    if (gameStarted) {
      const gameLoop = setInterval(moveSnake, 100);
      window.addEventListener('keydown', handleKeyPress);

      return () => {
        clearInterval(gameLoop);
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [snake, direction, gameOver, gameStarted]);

  useEffect(() => {
    if (gameOver) {
      saveScore();
    }
  }, [gameOver]);

  useEffect(() => {
    drawGame();
  }, [snake, food]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    generateFood();
    setGameStarted(false);
    setPlayerName('');
    setSaveStatus('idle');
  };

  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const saveScore = async () => {
    try {
      setSaveStatus('idle');
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: playerName, score }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save score');
      setSaveStatus('success');
      console.log('Score saved successfully:', data);
    } catch (error) {
      console.error('Error saving score:', error);
      setSaveStatus('error');
    }
  };

  const startGame = () => {
    if (playerName.trim()) {
      setGameStarted(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      {!gameStarted ? (
        <div className="flex flex-col items-center gap-4">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="px-4 py-2 rounded text-black"
          />
          <button
            onClick={startGame}
            disabled={!playerName.trim()}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="text-white text-2xl mb-4">Score: {score}</div>
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="border-2 border-white rounded"
          />
          {gameOver && (
            <div className="mt-4 flex flex-col items-center gap-4">
              {saveStatus === 'success' && (
                <div className="text-green-500">分数保存成功！</div>
              )}
              {saveStatus === 'error' && (
                <div className="text-red-500">分数保存失败，请重试</div>
              )}
              <button
                onClick={resetGame}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Play Again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Snake;