import { useEffect, useReducer, useState } from "react";
import { useSonosContext } from "./SonosContext"

export function VolumeSlider() {
    
    const player = useSonosContext();
    const [volume, setVolume] = useState(0);

    useEffect(() => {
        player.getVolume().then((result) => {
            setVolume(result);
        });
    }, []);
    
    let volumeChange = (e) => {
        let intVol = parseInt(e.target.value);
        setVolume(intVol);
        player.setVolume(intVol);
    }


    return (
        <input type="range" min="0" max="100" value={volume} onChange={(e) => volumeChange(e)} />

    )
}
    