"use client";

import { PauseCircleIcon, PlayCircleIcon } from "@heroicons/react/24/solid";
import { useSonosActions, useSonosState } from "../providers/SonosContext";
import { useEffect, useState } from "react";

export default function PlayButton() {
    const player = useSonosActions();
    const state = useSonosState(); 
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        setIsPlaying(state.playbackState?.transportState === "PLAYING");
    }, [state.playbackState?.transportState]);
    
    return (
        <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
            onClick={() => player.togglePlayback()}
        >
            {isPlaying ? (
                <PauseCircleIcon aria-hidden="true" className="h-6 w-6" />
            ) : (
                <PlayCircleIcon aria-hidden="true" className="h-6 w-6" />
            )}
        </button>
    );
}
