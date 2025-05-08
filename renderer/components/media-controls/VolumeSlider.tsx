import React from "react";
import { useSonosActions, useSonosState } from "../providers/SonosContext"

export default function VolumeSlider() {

    const player = useSonosActions();
    const state = useSonosState()

    const volumeChange = (e) => {
        const intVol = parseInt(e.target.value);
        player.setVolume(intVol);
    }

    return (
        <input type="range" min="0" max="100" value={state.playbackState?.volume ?? 0} onChange={(e) => volumeChange(e)} />
    )
}
