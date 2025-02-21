import React, { useState, useEffect, useRef } from 'react';
import { auth, signInWithGoogle, signOutUser, saveScore, getTopScores } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const calculateBoardSize = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const padding = 32;
    const maxSize = 600;

    let size = Math.min(vw - padding, vh - 300, maxSize);
    return Math.max(size, 280);
};

export default function Game2048() {
    const [grid, setGrid] = useState([]);

    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [boardSize, setBoardSize] = useState(calculateBoardSize());
    const [isAIPlaying, setIsAIPlaying] = useState(false);
    const touchStart = useRef({ x: 0, y: 0 });
    const aiIntervalRef = useRef(null);
    const [user, setUser] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    useEffect(() => {
        initGame();
        const handleResize = () => setBoardSize(calculateBoardSize());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const initGame = () => {
        const newGrid = Array(4)
            .fill()
            .map(() => Array(4).fill(0));
        addNewTile(newGrid);
        addNewTile(newGrid);
        setGrid(newGrid);
        setScore(0);
        setGameOver(false);
    };

    const addNewTile = (currentGrid) => {
        const emptyTiles = [];
        currentGrid.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell === 0) emptyTiles.push([i, j]);
            });
        });

        if (emptyTiles.length) {
            const [i, j] = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            currentGrid[i][j] = Math.random() < 0.9 ? 2 : 4;
        }
    };

    const moveGrid = (direction) => {
        if (gameOver) return;

        const [newGrid, hasChanged, points] = calculateMove(direction);

        if (hasChanged) {
            addNewTile(newGrid);
            setGrid(newGrid);
            setScore((prev) => prev + points);

            if (isGameOver(newGrid)) {
                handleGameOver();
            }
        }
    };

    const calculateMove = (direction) => {
        const newGrid = JSON.parse(JSON.stringify(grid));
        let hasChanged = false;
        let points = 0;

        const move = (line) => {
            const nonZeros = line.filter((x) => x !== 0);
            const merged = [];

            for (let i = 0; i < nonZeros.length; i++) {
                if (i + 1 < nonZeros.length && nonZeros[i] === nonZeros[i + 1]) {
                    merged.push(nonZeros[i] * 2);
                    points += nonZeros[i] * 2;
                    i++;
                } else {
                    merged.push(nonZeros[i]);
                }
            }

            const result = [...merged, ...Array(line.length - merged.length).fill(0)];
            if (JSON.stringify(line) !== JSON.stringify(result)) hasChanged = true;
            return result;
        };

        if (direction === 'left' || direction === 'right') {
            for (let i = 0; i < 4; i++) {
                const row = newGrid[i];
                const movedRow = move(direction === 'left' ? row : row.reverse());
                newGrid[i] = direction === 'left' ? movedRow : movedRow.reverse();
            }
        } else {
            for (let j = 0; j < 4; j++) {
                const column = newGrid.map((row) => row[j]);
                const movedColumn = move(direction === 'up' ? column : column.reverse());
                for (let i = 0; i < 4; i++) {
                    newGrid[i][j] = direction === 'up' ? movedColumn[i] : movedColumn[3 - i];
                }
            }
        }

        return [newGrid, hasChanged, points];
    };

    const isGameOver = (currentGrid) => {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (currentGrid[i][j] === 0) return false;
            }
        }

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                if (currentGrid[i][j] === currentGrid[i][j + 1]) return false;
                if (currentGrid[j][i] === currentGrid[j + 1][i]) return false;
            }
        }

        return true;
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            const keyToDirection = {
                ArrowUp: 'up',
                ArrowDown: 'down',
                ArrowLeft: 'left',
                ArrowRight: 'right',
            };
            if (keyToDirection[e.key]) {
                e.preventDefault();
                moveGrid(keyToDirection[e.key]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [grid, gameOver]);

    const handleTouchStart = (e) => {
        touchStart.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
        };
    };

    const handleTouchEnd = (e) => {
        const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
        const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
        const minSwipeDistance = 30;

        if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
            return;
        }

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            moveGrid(deltaX > 0 ? 'right' : 'left');
        } else {
            moveGrid(deltaY > 0 ? 'down' : 'up');
        }
    };

    const getTileColor = (value) => {
        const colors = {
            0: 'bg-gray-200',
            2: 'bg-gray-100 text-gray-700',
            4: 'bg-yellow-100 text-gray-700',
            8: 'bg-orange-200 text-white',
            16: 'bg-orange-300 text-white',
            32: 'bg-orange-400 text-white',
            64: 'bg-orange-500 text-white',
            128: 'bg-yellow-300 text-white',
            256: 'bg-yellow-400 text-white',
            512: 'bg-yellow-500 text-white',
            1024: 'bg-yellow-600 text-white',
            2048: 'bg-yellow-700 text-white',
        };
        return colors[value] || 'bg-yellow-800 text-white';
    };

    const getTileStyle = (value) => {
        return {
            width: '100%',
            height: '100%',
            fontSize: `${boardSize / (value > 100 ? 18 : 14)}px`,
        };
    };

    const evaluatePosition = (currentGrid) => {
        let score = 0;
        const weights = [
            [4, 3, 2, 1],
            [3, 2, 1, 0],
            [2, 1, 0, -1],
            [1, 0, -1, -2],
        ];

        // Score based on position weights
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                score += currentGrid[i][j] * weights[i][j];
            }
        }

        // Bonus for keeping large values in corners
        const corners = [currentGrid[0][0], currentGrid[0][3], currentGrid[3][0], currentGrid[3][3]];
        score += Math.max(...corners) * 2;

        // Penalty for scattered tiles
        let emptyTiles = 0;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (currentGrid[i][j] === 0) emptyTiles++;
            }
        }
        score += emptyTiles * 10;

        return score;
    };

    const findBestMove = () => {
        const directions = ['up', 'right', 'down', 'left'];
        let bestScore = -Infinity;
        let bestMove = null;

        for (const direction of directions) {
            const [newGrid, hasChanged] = calculateMove(direction);
            if (hasChanged) {
                const score = evaluatePosition(newGrid);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = direction;
                }
            }
        }

        return bestMove;
    };

    const toggleAI = () => {
        setIsAIPlaying((prev) => !prev);
    };

    useEffect(() => {
        if (isAIPlaying && !gameOver) {
            aiIntervalRef.current = setInterval(() => {
                const bestMove = findBestMove();
                if (bestMove) {
                    moveGrid(bestMove);
                }
            }, 3);
        } else {
            if (aiIntervalRef.current) {
                clearInterval(aiIntervalRef.current);
            }
        }

        return () => {
            if (aiIntervalRef.current) {
                clearInterval(aiIntervalRef.current);
            }
        };
    }, [isAIPlaying, gameOver, grid]);

    const loadLeaderboard = async () => {
        const scores = await getTopScores();
        setLeaderboard(scores);
    };

    const handleGameOver = async () => {
        setGameOver(true);
        if (user && score > 0) {
            await saveScore(score, user.uid, user.displayName);
            await loadLeaderboard();
        }
    };

    const LeaderboardModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Leaderboard</h2>
                    <button onClick={() => setShowLeaderboard(false)} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                    {leaderboard.map((entry, index) => (
                        <div key={entry.id} className="flex justify-between items-center py-3 border-b">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full font-bold text-blue-600">
                                    {index + 1}
                                </span>
                                <span className="font-medium">{entry.userName}</span>
                            </div>
                            <span className="font-bold text-lg">{entry.score}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-xl">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="text-4xl font-bold text-gray-800">2048</div>
                    <div className="flex flex-wrap justify-center gap-2 items-center">
                        {user ? (
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm">
                                <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full" />
                                <span className="font-medium hidden sm:block">{user.displayName}</span>
                                <button
                                    onClick={signOutUser}
                                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={signInWithGoogle}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-50"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                Sign in
                            </button>
                        )}

                        <button
                            onClick={() => setShowLeaderboard(true)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600"
                        >
                            🏆 Leaderboard
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4 mb-6">
                    <div className="min-w-[120px] bg-white rounded-xl p-4 text-center shadow-sm">
                        <div className="text-sm text-gray-500 mb-1">SCORE</div>
                        <div className="text-2xl font-bold">{score}</div>
                    </div>

                    <button
                        onClick={toggleAI}
                        className={`px-6 py-3 ${
                            isAIPlaying ? 'bg-green-500 hover:bg-green-600' : 'bg-purple-500 hover:bg-purple-600'
                        } text-white rounded-xl shadow-sm font-bold`}
                    >
                        {isAIPlaying ? '🤖 Stop AI' : '🤖 Start AI'}
                    </button>

                    <button
                        onClick={initGame}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-sm font-bold"
                    >
                        🔄 New Game
                    </button>
                </div>

                <div
                    className="bg-gray-300 p-3 rounded-lg shadow-lg mx-auto"
                    style={{ width: boardSize, height: boardSize }}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="grid grid-cols-4 grid-rows-4 gap-3 h-full">
                        {grid.flat().map((value, index) => (
                            <div
                                key={`${index}-${value}`}
                                className={`flex items-center justify-center font-bold rounded shadow-inner ${getTileColor(
                                    value
                                )}`}
                                style={getTileStyle(value)}
                            >
                                {value !== 0 ? value : ''}
                            </div>
                        ))}
                    </div>
                </div>

                {showLeaderboard && <LeaderboardModal />}

                {gameOver && (
                    <div className="text-center mt-6">
                        <div className="text-2xl font-bold text-red-500 mb-2">Game Over!</div>
                        <div className="text-xl">Final Score: {score}</div>
                        {!user && <div className="text-sm text-gray-600 mt-2">Sign in to save your score!</div>}
                    </div>
                )}

                <div className="text-gray-600 text-center mt-6">
                    <div className="font-medium mb-2">How to play:</div>
                    <div className="text-sm">Use arrow keys or swipe to move tiles</div>
                </div>
            </div>
        </div>
    );
}
