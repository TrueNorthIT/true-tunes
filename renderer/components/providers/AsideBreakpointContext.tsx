import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

// Define the types for the context
interface AsideBreakpointContextType {
    width: number;
    sidebarHeight: number;
    mainRef: React.RefObject<HTMLElement>;
    asideRef: React.RefObject<HTMLElement>;
    handleRef: React.RefObject<HTMLDivElement>; 
    nowPlayingCardRef: React.RefObject<HTMLDivElement>;
    setWidth: (width: number) => void;
    registerBreakpoint: (pxValue: number, callback: (isBelowBreakpoint: boolean) => void) => Breakpoint;
}

// Create context with an initial value of null
const AsideBreakpointContext = createContext<AsideBreakpointContextType | null>(null);

// Define props for the provider
interface AsideBreakpointProviderProps {
    children: React.ReactNode;
}

export interface Breakpoint {
    unsubscribe: () => void;
}

export const AsideBreakpointProvider: React.FC<AsideBreakpointProviderProps> = ({ children }) => {
    const [width, setWidth] = useState<number>(640); // Default sidebar width
    const [sidebarHeight, setSidebarHeight] = useState(0);
    const [breakpoints, setBreakpoints] = useState<Record<number, Array<(isBelowBreakpoint: boolean) => void>>>({});

    const mainRef = useRef<HTMLElement>(null);
    const asideRef = useRef<HTMLElement>(null);
    const handleRef = useRef<HTMLDivElement>(null); // Ref for the handle element
    const nowPlayingCardRef = useRef<HTMLDivElement>(null);
    const isResizing = useRef(false);

    // Register a breakpoint handler and return an unsubscribe method
    const registerBreakpoint = useCallback((pxValue: number, callback: (isBelowBreakpoint: boolean) => void) => {
        setBreakpoints((prev) => {
            const currentCallbacks = prev[pxValue] || [];
            return {
                ...prev,
                [pxValue]: [...currentCallbacks, callback],
            };
        });

        // Unsubscribe function to remove the specific callback
        const unsubscribe = () => {
            setBreakpoints((prev) => {
                const currentCallbacks = prev[pxValue] || [];
                return {
                    ...prev,
                    [pxValue]: currentCallbacks.filter((cb) => cb !== callback),
                };
            });
        };

        return { unsubscribe };
    }, []);


    // Update sidebar height based on the main content and the NowPlayingCard
    const updateSidebarHeight =  useCallback(() => {
        if (!mainRef.current || !nowPlayingCardRef.current) return;
        const newSidebarHeight = mainRef.current.clientHeight - (nowPlayingCardRef.current.clientHeight + 80);
        setSidebarHeight(newSidebarHeight);
    }, [mainRef, nowPlayingCardRef]);

    const handleMouseDown = () => {
        isResizing.current = true;
    };

    const handleMouseMove = (e) => {
        if (!asideRef.current) return;
        if (isResizing.current) {
            let newWidth = e.clientX - asideRef.current.offsetLeft;
            if (newWidth< 200) newWidth = 200;
            setWidth(newWidth);
            updateSidebarHeight();
        }
    };

    const handleMouseUp = () => {
        isResizing.current = false;
    };

    useEffect(() => {
        Object.keys(breakpoints).forEach((bp) => {
            const pxValue = parseInt(bp, 10);
            const isBelowBreakpoint = width <= pxValue;

            // Call all registered callbacks for the breakpoint
            if (breakpoints[pxValue]) {
                breakpoints[pxValue].forEach((callback) => callback(isBelowBreakpoint));
            }
        });
    }, [width, breakpoints]);

    useEffect(() => {
        window.onresize = updateSidebarHeight;
        updateSidebarHeight(); // Set initial height
        return () => {
            window.onresize = null;
        };
    }, [updateSidebarHeight]);

    useEffect(() => {
        const handleElement = handleRef.current;
        if (!handleElement) return;

        handleElement.addEventListener('mousedown', handleMouseDown);

        return () => {
            handleElement.removeEventListener('mousedown', handleMouseDown);
        };
    }, [handleRef]);

    return (
        <AsideBreakpointContext.Provider
            value={{
                width,
                sidebarHeight,
                mainRef,
                asideRef,
                handleRef,
                nowPlayingCardRef,
                setWidth,
                registerBreakpoint,
            }}
        >
            <div
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                {children}
            </div>
        </AsideBreakpointContext.Provider>
    );
};

// Custom hook to use the context
export const useAsideBreakpoint = (): AsideBreakpointContextType => {
    const context = useContext(AsideBreakpointContext);
    if (!context) {
        throw new Error('useAsideBreakpoint must be used within an AsideBreakpointProvider');
    }
    return context;
};
