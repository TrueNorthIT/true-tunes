import { useState, useEffect } from "react";

export function useCurrentTrack(queue, setCurrentlyPlayingIndex) {
    useEffect(() => {
        const onKeyPress = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                setCurrentlyPlayingIndex((prev) => Math.max(prev - 1, 0)); // Prevent negative index
            } else if (e.key === "ArrowRight") {
                setCurrentlyPlayingIndex((prev) => Math.min(prev + 1, queue.queue.length - 1)); // Prevent overflow
            }
        };

        window.addEventListener("keydown", onKeyPress);

        return () => {
            window.removeEventListener("keydown", onKeyPress);
        };
    }, [queue.queue.length]);

    return null; // Doesn't need to return anything
}
