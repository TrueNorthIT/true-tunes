import React, { useCallback } from "react";
import ContextMenu from '../ContextMenu';
import { createContext, useContext, useState, useEffect } from 'react';
// Create a context for managing the context menu state
const ContextMenuManagerContext = createContext({
    currentMenu: null,
    setCurrentMenu: (menuId: string | null) => { },
    handleContextMenu: (event, options, onClose) => { },
    closeContextMenu: () => { },
});

export const ContextMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentMenu, setCurrentMenu] = useState<string | null>(null);
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [contextMenuOptions, setContextMenuOptions] = useState([]);
    const [onCloseCallback, setOnCloseCallback] = useState(null);

    const handleContextMenu = (event, options, onClose) => {
        if (onCloseCallback) onCloseCallback();
        event.preventDefault();
        setContextMenuPosition({ x: event.clientX, y: event.clientY });
        setContextMenuOptions(options);
        setContextMenuVisible(true);
        setOnCloseCallback(() => onClose); // THis seems to fire the onCloseCallback function straight away
    };

    const closeContextMenu = useCallback(() => {
        setContextMenuVisible(false);
        setCurrentMenu(null);
        if (onCloseCallback) onCloseCallback();
        
    }, [onCloseCallback]);

    
    useEffect(() => {
        const handleClickOutside = () => {
            closeContextMenu();
        };
        if (contextMenuVisible) {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('contextmenu', handleClickOutside); // Close on right-click outside
        } else {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('contextmenu', handleClickOutside); // Close on right-click outside

        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('contextmenu', handleClickOutside); // Close on right-click outside
        };
    }, [contextMenuVisible, closeContextMenu]);

    return (
        <ContextMenuManagerContext.Provider
            value={{ currentMenu, setCurrentMenu, handleContextMenu, closeContextMenu }}
        >
            {children}
            {contextMenuVisible && (
                <>
                    {/* Overlay to block interaction with the rest of the UI */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={closeContextMenu}
                    />

                    {/* The ContextMenu should have a higher z-index */}
                    <ContextMenu
                        position={contextMenuPosition}
                        onClose={closeContextMenu}
                        options={contextMenuOptions}
                    />
                </>
            )}
        </ContextMenuManagerContext.Provider>
    );
};

// Custom hook to use the context
export const useContextMenuManager = () => useContext(ContextMenuManagerContext);
