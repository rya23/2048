import React, { useState } from "react"
import GameBoard from "./Board.jsx"

const App = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <GameBoard />
        </div>
    )
}

export default App
