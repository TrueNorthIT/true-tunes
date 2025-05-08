"use client";
import React from "react";
import { Services } from "@enums/Services";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { SonosSearchTypes } from "@enums/SonosSearchType";
import ArtistEntity from "@components/result-types/artistEntity";
import { useSonosActions } from "@components/providers/SonosContext";
import type { IArtistEntity } from "@components/result-types/artistEntity";

export default function Page({ params }: { params: { query: string } }) {
    const { query } = params;
    const player = useSonosActions();
    const router = useRouter();

    const pageSize = 24;
    const [searchResults, setSearchResults] = useState<IArtistEntity[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchArtists = useCallback(async (pageToFetch: number) => {
        if (!query) return;
        const cleanQuery = decodeURI(query);

        console.log("Fetching artists for page:", pageToFetch);
        setLoading(true);
        console.log("Query:", cleanQuery);
        const result = await player.search(
            cleanQuery,
            SonosSearchTypes.Artist,
            Services.Spotify,
            pageSize,
            pageSize * pageToFetch
        );

        if (result) {
            const newArtists = (result.mediaCollection || []) as IArtistEntity[];

            if (pageToFetch === 0) {
                setSearchResults(() => {
                    const seen = new Set<string>();
                    return (newArtists || []).filter(artist => {
                        if (seen.has(artist.id)) return false;
                        seen.add(artist.id);
                        return true;
                    });
                });
            } else {
                setSearchResults((prev) => {
                    const allArtists = [...prev, ...newArtists];
                    const seen = new Set<string>();
                    return allArtists.filter(artist => {
                        if (seen.has(artist.id)) return false;
                        seen.add(artist.id);
                        return true;
                    });
                });
            }
        }

        setLoading(false);
    }, [query, player, pageSize]);

    // Reset on new query
    useEffect(() => {
        setSearchResults([]);
        if (query) {
            fetchArtists(0); // Fetch first page
        }
    }, [query, fetchArtists]);

    useEffect(() => {
        const scrollContainer = document.getElementById("scroll-container");
        if (!scrollContainer) return;

        const handleScroll = () => {
            const scrollTop = scrollContainer.scrollTop;
            const containerHeight = scrollContainer.clientHeight;
            const contentHeight = scrollContainer.scrollHeight;

            if (scrollTop + containerHeight >= contentHeight - 300 && !loading) {
                const nextPage = Math.floor(searchResults.length / pageSize);
                fetchArtists(nextPage);
            }
        };

        scrollContainer.addEventListener("scroll", handleScroll);
        return () => {
            scrollContainer.removeEventListener("scroll", handleScroll);
        };
    }, [fetchArtists, searchResults.length, loading, pageSize]);

    return (
        <section className="@container">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3">
                Artists
            </h2>

            <div className="grid grid-cols-6 gap-4">
                {searchResults.map((artist) => (
                    <ArtistEntity key={`search-${artist.id}`} entity={artist} onSelect={() => router.push(`/music/view/artist/${artist.id}`)} />
                ))}

                {loading && searchResults.length === 0 && (
                    Array.from({ length: 48 }).map((_, i) => (
                        <ArtitstPlaceholder key={`placeholder-${i}`} />
                    ))
                )}
            </div>
        </section>
    );
}

// Simple Placeholder Component
function ArtitstPlaceholder() {
    return (
        <li className="relative hover:underline underline-offset-2 list-none p-14">
            <div className="group aspect-square rounded-full aspect-w-10 block w-full overflow-hidden  focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                <div className="aspect-square rounded bg-gray-800 animate-pulse" />
            </div>
        </li>
    );
}
