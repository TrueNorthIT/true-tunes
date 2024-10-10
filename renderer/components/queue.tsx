import { useSonosContext } from "./providers/SonosContext";
import Image, { StaticImageData } from "next/image";
import { useEffect, useState } from "react";

import truenorth_logo from "../public/images/truenorth_logo.png";
import TrackEntity from "./result-types/trackEntity";

export default function Queue() {

    const player = useSonosContext();



    return (
        <div>
            {
                player.queue.map((track, index) => ( <TrackEntity key={index} entity={track} /> ))
            }
            
        </div>
    );
}
