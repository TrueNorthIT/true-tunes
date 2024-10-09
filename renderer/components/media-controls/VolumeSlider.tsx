import { useEffect, useReducer, useState } from "react";
import { useSonosContext } from "../providers/SonosContext"

export default function VolumeSlider() {
    
    const player = useSonosContext();
    
    let volumeChange = (e) => {
        let intVol = parseInt(e.target.value);
        player.setVolume(intVol);
    }

    return (
        <input type="range" min="0" max="100" value={player.playbackState?.volume ?? 0} onChange={(e) => volumeChange(e)} />
    )
}
    