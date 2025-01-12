import React, { useState } from "react"
import GameBoard from "./Board.jsx"

const App = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4 ">2048!</h1>
            <GameBoard />
        </div>
    )
}

export default App
