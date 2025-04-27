"use client";

import { useEffect, useState, useCallback } from "react";
import AlbumEntity, { IAlbumEntity } from "@components/result-types/albumEntity";
import { Services } from "@enums/Services";
import { SonosSearchTypes } from "@enums/SonosSearchType";
import { useSonosActions } from "@components/providers/SonosContext";
import { useRouter } from "next/navigation";

export default function Page({ params }: { params: { query: string } }) {
    const { query } = params;
    const player = useSonosActions();
    const router = useRouter();

    const pageSize = 24;
    const [searchResults, setSearchResults] = useState<IAlbumEntity[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAlbums = useCallback(async (pageToFetch: number) => {
        if (!query) return;

        console.log("Fetching albums for page:", pageToFetch);
        setLoading(true);

        const result = await player.search(
            query,
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

            <div className="grid grid-cols-3 @[1000px]:grid-cols-4 @[1200px]:grid-cols-6 gap-4">
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
