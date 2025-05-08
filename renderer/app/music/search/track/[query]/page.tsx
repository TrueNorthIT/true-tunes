"use client";
import React from "react";
import Link from "next/link";
import { Services } from "@enums/Services";
import { useEffect, useState, useCallback } from "react";
import { SonosSearchTypes } from "@enums/SonosSearchType";
import ImageWithFallback from "@components/ImageWithFallback";
import { useSonosActions } from "@components/providers/SonosContext";
import type { ITrackEntity } from "@components/result-types/trackEntity";

const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function Page({ params }: { params: { query: string } }) {
    const { query } = params;
    const player = useSonosActions();

    const pageSize = 24;
    const [searchResults, setSearchResults] = useState<ITrackEntity[]>([]);
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);

    const fetchTracks = useCallback(async () => {
        if (!query || loading) return;
        const cleanQuery = decodeURI(query);

        console.log("Fetching Tracks from offset:", offset);
        setLoading(true);

        const result = await player.search(
            cleanQuery,
            SonosSearchTypes.Track,
            Services.Spotify,
            pageSize,
            offset
        );

        if (result) {
            const newTracks = (result.mediaMetadata || []) as ITrackEntity[];
            const seen = new Set<string>();

            const filteredTracks = (() => {
                const allTracks = [...searchResults, ...newTracks];
                return allTracks.filter(track => {
                    if (seen.has(track.id)) return false;
                    seen.add(track.id);
                    return true;
                });
            })();

            setSearchResults(filteredTracks);
            setOffset(filteredTracks.length); // Offset is just number of loaded items
        }
        setLoading(false);
    }, [query, offset, player, pageSize, loading, searchResults]);

    // Reset state on query change
    useEffect(() => {
        setSearchResults([]);
        setOffset(0);
        if (query) {
            fetchTracks();
        }
    }, [query, fetchTracks]);

    // Scroll listener
    useEffect(() => {
        const scrollContainer = document.getElementById("scroll-container");
        if (!scrollContainer) return;

        const handleScroll = () => {
            const scrollTop = scrollContainer.scrollTop;
            const containerHeight = scrollContainer.clientHeight;
            const contentHeight = scrollContainer.scrollHeight;

            if (scrollTop + containerHeight >= contentHeight - 300 && !loading) {
                fetchTracks();
            }
        };

        scrollContainer.addEventListener("scroll", handleScroll);
        return () => {
            scrollContainer.removeEventListener("scroll", handleScroll);
        };
    }, [fetchTracks, loading]);

    return (
        <section className="@container">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3">
                Tracks
            </h2>

            <table className="w-full table-fixed text-left border-separate border-spacing-y-2">
                <thead>
                    <tr className="text-gray-400 text-sm">
                        <th className="w-8">Title</th>
                        <th className="w-48"></th>
                        <th className="w-48">Album</th>
                        <th className="w-24 text-right">Duration</th>
                    </tr>
                </thead>

                <tbody>

                    {searchResults.map((track) => (
                        <tr key={track.id} className="hover:bg-gray-700 rounded-md text-white h-16 ">
                            <td>
                                <div className="w-16 h-16 rounded overflow-hidden">
                                    <ImageWithFallback
                                        src={track.trackMetadata?.albumArtURI}
                                        alt={track.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </td>

                            <td className="py-2">
                                <div className="flex flex-col gap-2">
                                    <span>
                                        {track.title}
                                        {track.tags?.explicit ?
                                            <span className="text-xs bg-[#f85f5fce] text-white px-1.5 py-0.5 rounded-md ml-2">
                                                EXPLICIT
                                            </span>
                                            : null
                                        }
                                    </span>
                                    <span className="text-gray-400 text-sm hover:underline">
                                        <Link href={`/music/view/artist/${track.trackMetadata.artistId}`}>
                                            {track.trackMetadata.artist}
                                        </Link>
                                    </span>
                                </div>
                            </td>

                            <td className="py-2">
                                <div className="flex items-center gap-2">
                                    <span className="hover:underline">
                                        <Link href={`/music/view/album/${track.trackMetadata.albumId}`}>
                                            {track.trackMetadata.album}
                                        </Link>
                                    </span>
                                </div>
                            </td>

                            <td className="text-right pr-2 align-middle">
                                {formatDuration(track.trackMetadata?.duration ?? 0)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}
