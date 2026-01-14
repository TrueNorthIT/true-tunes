"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { StaticImageData } from "next/image";
import ImageWithFallback from "@components/ImageWithFallback";
import truenorth_logo from "@public/images/truenorth_logo.png";
import { useAsideBreakpoint } from "@providers/AsideBreakpointContext";
import { useSonosActions, useSonosState } from "@providers/SonosContext";
import type { Track } from "@svrooij/sonos/lib/models";
import { extractTrackReference } from "../../utils/sonosUri";

export default function NowPlayingCard() {
  const [albumArtUri, setAlbumArtUri] = useState<string | StaticImageData>(
    truenorth_logo
  );
  const [trackName, setTrackName] = useState("TrueNorth Radio");
  const [albumName, setAlbumName] = useState("TrueNorth Radio");
  const [artistName, setArtistName] = useState("TrueNorth");
  const [artistId, setArtistId] = useState<string | null>(null);
  const [albumId, setAlbumId] = useState<string | null>(null);

  const actions = useSonosActions();
  const state = useSonosState();
  useEffect(() => {
    const nowPlaying = state?.playbackState?.positionInfo
      ?.TrackMetaData as Track;
    const trackReference = extractTrackReference(nowPlaying?.TrackUri);
    if (!trackReference) return;
    actions
      .getTrack(trackReference.ref, trackReference.serviceId)
      .then((track) => {
        console.log("Now Playing Track:", track);
        setAlbumName(track.album.name);
        setTrackName(track.title);
        setArtistName(track.artist.name);
        setAlbumArtUri(track.artURI);
        setArtistId(track.artist.id);
        setAlbumId(track.album.id);
      })
      .catch((error) => {
        console.error("Error fetching track info:", error);
      });
  }, [state, actions]);

  const [isSmall, setIsSmall] = useState(false);

  const { registerBreakpoint } = useAsideBreakpoint(); // Access breakpoint context

  const breakpointRef = useRef(null);

  useEffect(() => {
    breakpointRef.current = registerBreakpoint(400, setIsSmall);

    return () => {
      if (breakpointRef.current) {
        breakpointRef.current.unsubscribe();
      }
    };
  }, [registerBreakpoint]);

  return (
    <div
      className={
        "parent flex p-6 bg-gray-800 text-white rounded-lg shadow-lg w-full h-full " +
        (isSmall ? "flex-col" : "flex-row")
      }
    >
      {/* Album Art */}
      <div
        className={
          "relative content-center max-w-64 " +
          (isSmall ? "w-full mx-auto max-w-64 mb-4" : "w-1/3 mr-8")
        }
      >
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
            <Link
              href={`/music/view/artist/${artistId}`}
              className="hover:underline"
            >
              {artistName}
            </Link>
          </h2>
        </div>
        <div>
          <label className="text-gray-400 text-sm">Album</label>
          <h3 className="text-gray-300" title={albumName}>
            <Link
              href={`/music/view/album/${albumId}`}
              className="hover:underline"
            >
              {albumName}
            </Link>
          </h3>
        </div>
      </div>
    </div>
  );
}
