"use client";

import { useSonosActions, useSonosQueue, useSonosState } from "@providers/SonosContext";
import Image, { StaticImageData } from "next/image";
import { useEffect, useState } from "react";
import { Breakpoint, useAsideBreakpoint } from "@providers/AsideBreakpointContext"; // Import the provider

import truenorth_logo from "@public/images/truenorth_logo.png";
import ImageWithFallback from "@components/ImageWithFallback";
import { Track } from "@svrooij/sonos/lib/models";
import { ITrackEntity } from "@components/result-types/trackEntity";
import Link from "next/link";

export default function NowPlayingCard() {
    const [albumArtUri, setAlbumArtUri] = useState<string | StaticImageData>(truenorth_logo);
    const [trackName, setTrackName] = useState("TrueNorth Radio");
    const [albumName, setAlbumName] = useState("TrueNorth Radio");
    const [artistName, setArtistName] = useState("TrueNorth");
    const [artistId, setArtistId] = useState<string | null>(null);
    const [albumId, setAlbumId] = useState<string | null>(null);


    const queue = useSonosQueue();
    const actions = useSonosActions();

    useEffect(() => {
        if (queue.queue.length > 0) {
            const currentTrack = queue.queue[queue.currentTrackIndex-1];
            console.log("Current Track: ", currentTrack);
            const trackId = currentTrack?.TrackUri.match(/spotify:track:[^?]+/)[0]

            actions.getItemMetadata(trackId).then((metadata) => {
                console.log("Metadata: ", metadata);
                setAlbumId((metadata.mediaMetadata[0] as ITrackEntity).trackMetadata.albumId);             
                setArtistId((metadata.mediaMetadata[0] as ITrackEntity).trackMetadata.artistId);
            });


            setAlbumArtUri(currentTrack?.AlbumArtUri || truenorth_logo);
            setAlbumName(currentTrack?.Album || "Unknown Album");
            setArtistName(currentTrack?.Artist || "Unknown Artist");
            setTrackName(currentTrack?.Title || "Unknown Track");
        } else {
            setAlbumArtUri(truenorth_logo);
            setAlbumName("TrueNorth Radio");
            setArtistName("TrueNorth");
            setTrackName("TrueNorth Radio");
        }
    }, [queue]);

    const [isSmall, setIsSmall] = useState(false);

    const { registerBreakpoint } = useAsideBreakpoint(); // Access breakpoint context

    let breakpoint: Breakpoint = null;
    
    useEffect(() => {
        breakpoint = registerBreakpoint(400, setIsSmall);
        return () => breakpoint.unsubscribe();        
    }, [registerBreakpoint]);


    return (
        <div 
            className={"parent flex p-6 bg-gray-800 text-white rounded-lg shadow-lg w-full h-full " + (isSmall ? "flex-col" : "flex-row")}
        >
            {/* Album Art */}
            <div className={"relative content-center max-w-64 " + (isSmall ? "w-full mx-auto max-w-64 mb-4" : "w-1/3 mr-8")}>
                <ImageWithFallback
                    src={albumArtUri}
                    alt={albumName}
                    width={1}
                    height={1}
                    className="rounded-lg"
                    priority={true}
                />
            </div>

            {/* Track Info */}
            <div className="flex flex-col justify-center flex-grow space-y-2 overflow-auto">
                <div>
                    <label className="text-gray-400 text-sm">Track</label>
                    <h1 className="font-semibold" title={trackName}>
                        {trackName}
                    </h1>
                </div>
                <div>
                    <label className="text-gray-400 text-sm">Artist</label>
                    <h2 className="text-gray-300" title={artistName}>
                        <Link href={`/music/view/artist/${artistId}`} className="hover:underline">
                            {artistName}
                        </Link>
                    </h2>
                </div>
                <div>
                    <label className="text-gray-400 text-sm">Album</label>
                    <h3 className="text-gray-300" title={albumName}>
                        <Link href={`/music/view/album/${albumId}`} className="hover:underline">
                            {albumName}
                        </Link>
                    </h3>
                </div>
            </div>
        </div>
    );
}
