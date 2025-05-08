"use client";

import React from 'react';
import { Services } from "@enums/Services";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { SonosSearchTypes } from "@enums/SonosSearchType";
import AlbumEntity from "@components/result-types/albumEntity";
import { useSonosActions } from "@components/providers/SonosContext";
import type { IAlbumEntity } from "@components/result-types/albumEntity";

export default function Page({ params }: { params: { query: string } }) {
    const { query } = params;
    const player = useSonosActions();
    const router = useRouter();

    const pageSize = 24;
    const [searchResults, setSearchResults] = useState<IAlbumEntity[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAlbums = useCallback(async (pageToFetch: number) => {
        if (!query) return;
        const cleanQuery = decodeURI(query);
        console.log("Fetching albums for page:", pageToFetch);
        setLoading(true);

        const result = await player.search(
            cleanQuery,
            SonosSearchTypes.Album,
            Services.Spotify,
            pageSize,
            pageSize * pageToFetch
        );

        if (result) {
            const newAlbums = (result.mediaCollection || []) as IAlbumEntity[];

            if (pageToFetch === 0) {
                setSearchResults(() => {
                    const seen = new Set<string>();
                    return (newAlbums || []).filter(album => {
                        if (seen.has(album.id)) return false;
                        seen.add(album.id);
                        return true;
                    });
                });
            } else {
                setSearchResults((prev) => {
                    const allAlbums = [...prev, ...newAlbums];
                    const seen = new Set<string>();
                    return allAlbums.filter(album => {
                        if (seen.has(album.id)) return false;
                        seen.add(album.id);
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
            fetchAlbums(0); // Fetch first page
        }
    }, [query, fetchAlbums]);

    useEffect(() => {
        const scrollContainer = document.getElementById("scroll-container");
        if (!scrollContainer) return;

        const handleScroll = () => {
            const scrollTop = scrollContainer.scrollTop;
            const containerHeight = scrollContainer.clientHeight;
            const contentHeight = scrollContainer.scrollHeight;

            if (scrollTop + containerHeight >= contentHeight - 300 && !loading) {
                const nextPage = Math.floor(searchResults.length / pageSize);
                fetchAlbums(nextPage);
            }
        };

        scrollContainer.addEventListener("scroll", handleScroll);
        return () => {
            scrollContainer.removeEventListener("scroll", handleScroll);
        };
    }, [fetchAlbums, searchResults.length, loading, pageSize]);

    return (
        <section className="@container">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3">
                Albums
            </h2>

            <div className="grid grid-cols-6 gap-4">
                {searchResults.map((album) => (
                    <AlbumEntity key={`search-${album.id}`} entity={album} onSelect={() => router.push(`/music/view/album/${album.id}`)} />
                ))}

                {loading && searchResults.length === 0 && (
                    Array.from({ length: 48 }).map((_, i) => (
                        <AlbumPlaceholder key={`placeholder-${i}`} />
                    ))
                )}
            </div>
        </section>
    );
}

// Simple Placeholder Component
function AlbumPlaceholder() {
    return (
        <div className="aspect-square rounded bg-gray-800 animate-pulse" />
    );
}
