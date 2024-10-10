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


    const parentRef = useRef(null);
    const [scale, setScale] = useState(1); // State to hold the scale factor

    useEffect(() => {
        const parentElement = parentRef.current;

        // Define ResizeObserver callback to adjust text scale
        const resizeObserver = new ResizeObserver(entries => {
            entries.forEach(entry => {
                const parentWidth = entry.contentRect.width;

                // Calculate the scale based on the container's width (you can adjust the divisor for your preference)
                const newScale = parentWidth / 400; // Adjust 400 to control when it starts resizing
                setScale(newScale); // Update scale state
            });
        });

        if (parentElement) {
            resizeObserver.observe(parentElement); // Observe the parent container
        }

        // Cleanup the observer on component unmount
        return () => {
            if (parentElement) {
                resizeObserver.unobserve(parentElement);
            }
        };
    }, []);

    return (
        <div className="parent flex flex-col sm:flex-row p-6 bg-gray-800 text-white rounded-lg shadow-lg w-full h-full">
            {/* Album Art */}
            <div className="relative w-full sm:w-1/3 content-center">
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
            <div className="flex flex-col justify-center flex-grow sm:ml-8 mt-6 sm:mt-0 space-y-2 overflow-auto">
                <div>
                    <label className="text-gray-400 text-sm">Track</label>
                    <h1 className="resizable-text font-semibold" title={trackName}>
                        {trackName}
                    </h1>
                </div>
                <div>
                    <label className="text-gray-400 text-sm">Artist</label>
                    <h2 className="resizable-text text-gray-300" title={artistName}>
                        {artistName}
                    </h2>
                </div>
                <div>
                    <label className="text-gray-400 text-sm">Album</label>
                    <h3 className="resizable-text text-gray-300" title={albumName}>
                        {albumName}
                    </h3>
                </div>
            </div>
        </div>






    );
}
