"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useSonosActions } from "../providers/SonosContext";
import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/solid";

export default function MuteButton() {
    const player = useSonosActions();
    const [isMuted, setIsMuted] = useState<boolean>(false);

    useEffect(() => {
        async function fetchMuteState() {
            try {
                const playbackState = await player.getPlaybackState();
                setIsMuted(playbackState.muted);
            } catch (error) {
                console.error("Failed to fetch mute state:", error);
            }
        }

        fetchMuteState();
    }, [player]);

    const handleToggleMute = () => {
        player.toggleMute();
        setIsMuted(prev => !prev); // Optimistically toggle local state
    };

    return (
        <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
            onClick={handleToggleMute}
        >
            {isMuted ? (
                <SpeakerXMarkIcon aria-hidden="true" className="h-6 w-6" />
            ) : (
                <SpeakerWaveIcon aria-hidden="true" className="h-6 w-6" />
            )}
        </button>
    );
}
