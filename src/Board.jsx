import React, { useState, useEffect, useRef } from "react"

const calculateBoardSize = () => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const padding = 32
    const maxSize = 600

    let size = Math.min(vw - padding, vh - 200, maxSize)
    return Math.max(size, 280)
}

export default function Game2048() {
    const [grid, setGrid] = useState([])
    const [score, setScore] = useState(0)
    const [gameOver, setGameOver] = useState(false)
    const [boardSize, setBoardSize] = useState(calculateBoardSize())
    const touchStart = useRef({ x: 0, y: 0 })

    useEffect(() => {
        initGame()
        const handleResize = () => setBoardSize(calculateBoardSize())
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const initGame = () => {
        const newGrid = Array(4)
            .fill()
            .map(() => Array(4).fill(0))
        addNewTile(newGrid)
        addNewTile(newGrid)
        setGrid(newGrid)
        setScore(0)
        setGameOver(false)
    }

    const addNewTile = (currentGrid) => {
        const emptyTiles = []
        currentGrid.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell === 0) emptyTiles.push([i, j])
            })
        })

        if (emptyTiles.length) {
            const [i, j] =
                emptyTiles[Math.floor(Math.random() * emptyTiles.length)]
            currentGrid[i][j] = Math.random() < 0.9 ? 2 : 4
        }
    }

    const moveGrid = (direction) => {
        if (gameOver) return

        const [newGrid, hasChanged, points] = calculateMove(direction)

        if (hasChanged) {
            addNewTile(newGrid)
            setGrid(newGrid)
            setScore((prev) => prev + points)

            if (isGameOver(newGrid)) {
                setGameOver(true)
            }
        }
    }

    const calculateMove = (direction) => {
        const newGrid = JSON.parse(JSON.stringify(grid))
        let hasChanged = false
        let points = 0

        const move = (line) => {
            const nonZeros = line.filter((x) => x !== 0)
            const merged = []

            for (let i = 0; i < nonZeros.length; i++) {
                if (
                    i + 1 < nonZeros.length &&
                    nonZeros[i] === nonZeros[i + 1]
                ) {
                    merged.push(nonZeros[i] * 2)
                    points += nonZeros[i] * 2
                    i++
                } else {
                    merged.push(nonZeros[i])
                }
            }

            const result = [
                ...merged,
                ...Array(line.length - merged.length).fill(0),
            ]
            if (JSON.stringify(line) !== JSON.stringify(result))
                hasChanged = true
            return result
        }

        if (direction === "left" || direction === "right") {
            for (let i = 0; i < 4; i++) {
                const row = newGrid[i]
                const movedRow = move(
                    direction === "left" ? row : row.reverse()
                )
                newGrid[i] =
                    direction === "left" ? movedRow : movedRow.reverse()
            }
        } else {
            for (let j = 0; j < 4; j++) {
                const column = newGrid.map((row) => row[j])
                const movedColumn = move(
                    direction === "up" ? column : column.reverse()
                )
                for (let i = 0; i < 4; i++) {
                    newGrid[i][j] =
                        direction === "up" ? movedColumn[i] : movedColumn[3 - i]
                }
            }
        }

        return [newGrid, hasChanged, points]
    }

    const isGameOver = (currentGrid) => {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (currentGrid[i][j] === 0) return false
            }
        }

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                if (currentGrid[i][j] === currentGrid[i][j + 1]) return false
                if (currentGrid[j][i] === currentGrid[j + 1][i]) return false
            }
        }

        return true
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            const keyToDirection = {
                ArrowUp: "up",
                ArrowDown: "down",
                ArrowLeft: "left",
                ArrowRight: "right",
            }
            if (keyToDirection[e.key]) {
                e.preventDefault()
                moveGrid(keyToDirection[e.key])
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [grid, gameOver])

    const handleTouchStart = (e) => {
        touchStart.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
        }
    }

    const handleTouchEnd = (e) => {
        const deltaX = e.changedTouches[0].clientX - touchStart.current.x
        const deltaY = e.changedTouches[0].clientY - touchStart.current.y
        const minSwipeDistance = 30

        if (
            Math.abs(deltaX) < minSwipeDistance &&
            Math.abs(deltaY) < minSwipeDistance
        ) {
            return
        }

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            moveGrid(deltaX > 0 ? "right" : "left")
        } else {
            moveGrid(deltaY > 0 ? "down" : "up")
        }
    }

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

    const getTileStyle = (value) => {
        return {
            width: "100%",
            height: "100%",
            fontSize: `${boardSize / (value > 100 ? 15 : 12)}px`,
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-xl">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-3xl font-bold text-gray-800">2048</div>
                    <div className="flex gap-4 items-center">
                        <div className="min-w-[75px] relative text-tan flex min-w-0 grow basis-0 transform-gpu items-center justify-between gap-2 rounded-xl px-4 py-2 text-sm font-bold sm:h-[52px] sm:flex-auto sm:flex-col sm:justify-center sm:gap-0 sm:py-0 sm:text-xl bg-sand border border-gray-300">
                            <span className="min-w-0 shrink-[500] grow basis-[20px] truncate text-xs font-medium uppercase sm:flex-initial">
                                Score
                            </span>
                            <span className="invisible hidden h-0 sm:block">
                                444
                            </span>
                            <span className="shrink-1 truncate">{score}</span>
                        </div>

                        <button
                            onClick={initGame}
                            className="px-4 py-2 bg-blue-500 text-white rounded-xl border border-blue-300 hover:bg-blue-600 hover:border-blue-400 transition-colors font-bold text-sm sm:text-xl"
                        >
                            New Game
                        </button>
                    </div>
                </div>

                <div
                    className="bg-gray-300 p-3 rounded-lg"
                    style={{ width: boardSize, height: boardSize }}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="grid grid-cols-4 grid-rows-4 gap-3 h-full">
                        {grid.flat().map((value, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-center font-bold rounded transition-colors duration-100 ${getTileColor(
                                    value
                                )}`}
                                style={getTileStyle(value)}
                            >
                                {value !== 0 ? value : ""}
                            </div>
                        ))}
                    </div>
                </div>

                {gameOver && (
                    <div className="text-xl font-bold text-red-500 text-center mt-4">
                        Game Over! Final Score: {score}
                    </div>
                )}

                <div className="text-gray-600 text-center mt-4">
                    Use arrow keys or swipe to move tiles
                </div>
            </div>
        </div>
    )
}
