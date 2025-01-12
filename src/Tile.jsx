import React from "react"

const Tile = ({ value }) => {
    const getStyle = () => {
        switch (value) {
            case 0:
                return "bg-gray-200"
            case 2:
                return "bg-yellow-100 text-gray-800"
            case 4:
                return "bg-yellow-200 text-gray-800"
            case 8:
                return "bg-yellow-300 text-gray-800"
            case 16:
                return "bg-orange-400 text-white"
            case 32:
                return "bg-orange-500 text-white"
            case 64:
                return "bg-orange-600 text-white"
            case 128:
                return "bg-green-400 text-white"
            case 256:
                return "bg-green-500 text-white"
            case 512:
                return "bg-green-600 text-white"
            case 1024:
                return "bg-blue-400 text-white"
            case 2048:
                return "bg-blue-500 text-white"
            default:
                return "bg-gray-400 text-white"
        }
    }
    return (
        <div
            className={`h-20 w-20 flex items-center justify-center font-bold text-xl rounded ${getStyle()}`}
        >
            {value !== 0 && value}
        </div>
    )
}

export default Tile
