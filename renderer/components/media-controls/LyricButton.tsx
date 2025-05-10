import React, { useEffect } from "react";
import {  MicrophoneIcon } from "@heroicons/react/24/solid"
import { useSonosState } from "../providers/SonosContext"
import { useRouter } from "next/navigation";
import type { Track } from "@svrooij/sonos/lib/models";

export default function LyricButton() {

    const router = useRouter();
    const state = useSonosState();


    const [currentTrack, setCurrentTrack] = React.useState<string | null>(null);
    const [currentArtist, setCurrentArtist] = React.useState<string | null>(null);

    useEffect(() => {

        if (state?.playbackState?.positionInfo?.TrackMetaData) {
            setCurrentTrack((state?.playbackState?.positionInfo?.TrackMetaData as Track).Title);
            setCurrentArtist((state?.playbackState?.positionInfo?.TrackMetaData as Track).Artist);
        }
    }, [state]);

    return (
        <button
            type="button"
            title="Show Lyrics"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
            onClick={() => router.push(`/music/lyrics/${currentArtist}/${currentTrack}`)}
        >
            <MicrophoneIcon aria-hidden="true" className="h-6 w-6" />
        </button>
    )
}
