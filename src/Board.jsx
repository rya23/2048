import React, { useState, useEffect } from "react"

const SIZE = 4 // 4x4 grid

function GameBoard() {
    const [grid, setGrid] = useState([])
    const [score, setScore] = useState(0)
    const [gameOver, setGameOver] = useState(false)

    // Initialize the grid with zeros and two random tiles
    useEffect(() => {
        initializeGame()
    }, [])

    const initializeGame = () => {
        const newGrid = Array(SIZE)
            .fill()
            .map(() => Array(SIZE).fill(0))
        addRandomTile(newGrid)
        addRandomTile(newGrid)
        setGrid(newGrid)
        setScore(0)
        setGameOver(false)
    }

    const addRandomTile = (currentGrid) => {
        const emptyCells = []
        currentGrid.forEach((row, r) =>
            row.forEach((cell, c) => {
                if (cell === 0) emptyCells.push({ r, c })
            })
        )

        if (emptyCells.length) {
            const { r, c } =
                emptyCells[Math.floor(Math.random() * emptyCells.length)]
            currentGrid[r][c] = Math.random() > 0.1 ? 2 : 4
        }
    }

    const checkGameOver = (currentGrid) => {
        // Check for any empty cells
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (currentGrid[i][j] === 0) return false
            }
        }

        // Check for possible merges horizontally and vertically
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE - 1; j++) {
                if (currentGrid[i][j] === currentGrid[i][j + 1]) return false
                if (currentGrid[j][i] === currentGrid[j + 1][i]) return false
            }
        }

        return true
    }

    const handleKeyDown = (e) => {
        if (gameOver) return

        let moved = false
        const newGrid = JSON.parse(JSON.stringify(grid)) // Deep copy

        switch (e.key) {
            case "ArrowUp":
                moved = moveTiles("up", newGrid)
                break
            case "ArrowDown":
                moved = moveTiles("down", newGrid)
                break
            case "ArrowLeft":
                moved = moveTiles("left", newGrid)
                break
            case "ArrowRight":
                moved = moveTiles("right", newGrid)
                break
            default:
                return
        }

        if (moved) {
            addRandomTile(newGrid)
            setGrid(newGrid)

            if (checkGameOver(newGrid)) {
                setGameOver(true)
            }
        }
    }

    const mergeTiles = (row) => {
        let newScore = 0
        const newRow = row.filter((val) => val !== 0)

        for (let i = 0; i < newRow.length - 1; i++) {
            if (newRow[i] === newRow[i + 1]) {
                newRow[i] *= 2
                newScore += newRow[i]
                newRow[i + 1] = 0
            }
        }

        const filteredRow = newRow.filter((val) => val !== 0)
        const paddedRow = [
            ...filteredRow,
            ...Array(SIZE - filteredRow.length).fill(0),
        ]

        return { row: paddedRow, score: newScore }
    }

    const moveTiles = (direction, currentGrid) => {
        let moved = false
        let additionalScore = 0

        const processSingleRow = (row) => {
            const { row: newRow, score } = mergeTiles(row)
            additionalScore += score

            if (JSON.stringify(row) !== JSON.stringify(newRow)) {
                moved = true
            }
            return newRow
        }

        if (direction === "left") {
            for (let i = 0; i < SIZE; i++) {
                currentGrid[i] = processSingleRow(currentGrid[i])
            }
        } else if (direction === "right") {
            for (let i = 0; i < SIZE; i++) {
                currentGrid[i] = processSingleRow(
                    [...currentGrid[i]].reverse()
                ).reverse()
            }
        } else if (direction === "up") {
            for (let j = 0; j < SIZE; j++) {
                const column = currentGrid.map((row) => row[j])
                const newColumn = processSingleRow(column)
                for (let i = 0; i < SIZE; i++) {
                    currentGrid[i][j] = newColumn[i]
                }
            }
        } else if (direction === "down") {
            for (let j = 0; j < SIZE; j++) {
                const column = currentGrid.map((row) => row[j]).reverse()
                const newColumn = processSingleRow(column).reverse()
                for (let i = 0; i < SIZE; i++) {
                    currentGrid[i][j] = newColumn[i]
                }
            }
        }

        if (moved) {
            setScore((prevScore) => prevScore + additionalScore)
        }

        return moved
    }

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [grid, gameOver])

    const getTileColor = (value) => {
        const colors = {
            0: "bg-gray-200",
            2: "bg-gray-100 text-gray-700",
            4: "bg-yellow-100 text-gray-700",
            8: "bg-orange-200 text-white",
            16: "bg-orange-300 text-white",
            32: "bg-orange-400 text-white",
            64: "bg-orange-500 text-white",
            128: "bg-yellow-300 text-white",
            256: "bg-yellow-400 text-white",
            512: "bg-yellow-500 text-white",
            1024: "bg-yellow-600 text-white",
            2048: "bg-yellow-700 text-white",
        }
        return colors[value] || "bg-yellow-800 text-white"
    }

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <div className="flex justify-between w-full max-w-md mb-4">
                <div className="text-2xl font-bold">Score: {score}</div>
                <button
                    onClick={initializeGame}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    New Game
                </button>
            </div>

            <div className="bg-gray-300 p-4 rounded-lg w-[400px] h-[400px]">
                <div className="grid grid-rows-4 grid-cols-4 gap-2 h-full">
                    {grid.map((row, i) =>
                        row.map((value, j) => (
                            <div
                                key={`${i}-${j}`}
                                className={`flex items-center justify-center font-bold text-2xl rounded transition-colors duration-100 ${getTileColor(
                                    value
                                )}`}
                            >
                                {value !== 0 ? value : ""}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {gameOver && (
                <div className="text-xl font-bold text-red-500 mt-4">
                    Game Over! Final Score: {score}
                </div>
            )}
        </div>
    )
}

export default GameBoard
