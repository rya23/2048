import React, { useState } from 'react';
import GameBoard from './Board.jsx';
import { Analytics } from '@vercel/analytics/react';

const App = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <GameBoard />
            <Analytics />
        </div>
    );
};

export default App;
