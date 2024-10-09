import { useSonosContext } from "./providers/SonosContext";
import Image, { StaticImageData } from "next/image";
import { useEffect, useState } from "react";

import truenorth_logo from "../public/images/truenorth_logo.png";

export default function NowPlayingCard() {
    const [albumArtUri, setAlbumArtUri] = useState<string | StaticImageData>(truenorth_logo);
    const [trackName, setTrackName] = useState("TrueNorth Radio");
    const [albumName, setAlbumName] = useState("TrueNorth Radio");
    const [artistName, setArtistName] = useState("TrueNorth");

    const player = useSonosContext();

    useEffect(() => {
        if (player.playbackState?.positionInfo?.TrackMetaData) {
            const metaData = player.playbackState.positionInfo.TrackMetaData;

            setAlbumArtUri(metaData.AlbumArtUri || truenorth_logo);
            setAlbumName(metaData.Album || "Unknown Album");
            setArtistName(metaData.Artist || "Unknown Artist");
            setTrackName(metaData.Title || "Unknown Track");
        } else {
            setAlbumArtUri(truenorth_logo);
            setAlbumName("TrueNorth Radio");
            setArtistName("TrueNorth");
            setTrackName("TrueNorth Radio");
        }
    }, [player.playbackState]);

    return (
        <div className="flex p-6 bg-gray-900 text-white rounded-lg shadow-lg w-full max-w-xl">
            {/* Album Art */}
            <Image 
                src={albumArtUri}
                alt={albumName}
                width={250}
                height={250}
                className="rounded-lg"
            />

            {/* Track Info */}
            <div className="flex flex-col justify-center ml-8 space-y-2">
                <div>
                    <label className="text-gray-400 text-sm">Track</label>
                    <h1 className="text-2xl font-semibold">{trackName}</h1>
                </div>
                <div>
                    <label className="text-gray-400 text-sm">Artist</label>
                    <h2 className="text-xl text-gray-300">{artistName}</h2>
                </div>
                <div>
                    <label className="text-gray-400 text-sm">Album</label>
                    <h3 className="text-lg text-gray-300">{albumName}</h3>
                </div>
            </div>
        </div>
    );
}
