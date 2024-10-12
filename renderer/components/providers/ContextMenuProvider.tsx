import { createContext, useContext, useState, useEffect } from 'react';
import ContextMenu from '../ContextMenu';

// Create a context for managing the context menu state
const ContextMenuManagerContext = createContext({
    currentMenu: null,
    setCurrentMenu: (menuId: string | null) => {},
    handleContextMenu: (event, options, onClose) => {},
    closeContextMenu: () => {},
});

export const ContextMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentMenu, setCurrentMenu] = useState<string | null>(null);
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [contextMenuOptions, setContextMenuOptions] = useState([]);
    const [onCloseCallback, setOnCloseCallback] = useState(null);

    const handleContextMenu = (event, options, onClose) => {
        onCloseCallback && onCloseCallback();
        event.preventDefault();
        setContextMenuPosition({ x: event.clientX, y: event.clientY });
        setContextMenuOptions(options);
        setContextMenuVisible(true);
        setOnCloseCallback(() => onClose); // THis seems to fire the onCloseCallback function straight away
    };

    const closeContextMenu = () => {
        setContextMenuVisible(false);
        setCurrentMenu(null);
        if (onCloseCallback) {
            onCloseCallback();
        }
    };

    const handleClickOutside = () => {
        closeContextMenu();
    };

    useEffect(() => {
        if (contextMenuVisible) {
            document.addEventListener('click', handleClickOutside);
        } else {
            document.removeEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [contextMenuVisible]);

    return (
        <ContextMenuManagerContext.Provider
            value={{ currentMenu, setCurrentMenu, handleContextMenu, closeContextMenu }}
        >
            {children}
            {contextMenuVisible && (
                <>
                    {/* Overlay to block interaction with the rest of the UI */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40" 
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
