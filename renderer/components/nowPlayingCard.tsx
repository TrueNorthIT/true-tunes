import { useSonosContext } from "./providers/SonosContext";
import Image, { StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";

import truenorth_logo from "../public/images/truenorth_logo.png";

export default function NowPlayingCard() {
    const [albumArtUri, setAlbumArtUri] = useState<string | StaticImageData>(truenorth_logo);
    const [trackName, setTrackName] = useState("TrueNorth Radio");
    const [albumName, setAlbumName] = useState("TrueNorth Radio");
    const [artistName, setArtistName] = useState("TrueNorth");

    const player = useSonosContext();

    const container = useRef<HTMLDivElement>(null);

    const [isSmall, setIsSmall] = useState(false);


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


    useEffect(() => {
        const updateScreenSize = () => {
            if (container.current) {
                setIsSmall(container.current.clientWidth <= 400);
            }
        };

        // Call the function once on mount
        updateScreenSize();


    }, [container.current?.clientWidth]);


    return (
        <div 
            ref={container}
            className={"parent flex  p-6 bg-gray-800 text-white rounded-lg shadow-lg w-full h-full " +  (isSmall  ? "flex-col" : "flex-row")}
        >
            {/* Album Art */}
            <div className={"relative  content-center max-w-64 " +  (isSmall ? "w-full mx-auto max-w-64 mb-4" : "w-1/3 mr-8")}>
                <Image
                    src={albumArtUri}
                    alt={albumName}
                    layout="responsive"
                    width={1}
                    height={1}
                    className="rounded-lg"
                    objectFit="cover"
                />
            </div>

            {/* Track Info */}
            <div className="flex flex-col justify-center flex-grow  space-y-2 overflow-auto">
                <div>
                    <label className="text-gray-400 text-sm">Track</label>
                    <h1 className="font-semibold" title={trackName}>
                        {trackName}
                    </h1>
                </div>
                <div>
                    <label className="text-gray-400 text-sm">Artist</label>
                    <h2 className="text-gray-300" title={artistName}>
                        {artistName}
                    </h2>
                </div>
                <div>
                    <label className="text-gray-400 text-sm">Album</label>
                    <h3 className="text-gray-300" title={albumName}>
                        {albumName}
                    </h3>
                </div>
            </div>
        </div>

    );
}
