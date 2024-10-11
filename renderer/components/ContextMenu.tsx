import React, { useState, useEffect } from 'react';

const ContextMenu = ({ position, onClose, options }) => {
    return (
        <div
            className="absolute z-50 shrink rounded-lg bg-white p-2 text-sm font-semibold leading-6 text-gray-900 shadow-lg ring-1 ring-gray-900/5"
            style={{ top: position.y, left: position.x }}
        >
            {options.map((option, index) => (
                <div
                    key={index}
                    className="px-4 py-2 overflow-hidden hover:bg-gray-200 cursor-pointer block  hover:text-black "
                    onClick={() => {
                        option.onClick();
                        onClose(); // Close the menu after an action
                    }}
                >
                    {option.label}
                </div>
            ))}
        </div>
    );
};


export default ContextMenu;