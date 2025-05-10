"use client";

import React from 'react';
import { Services } from "@enums/Services";
import { useEffect, useState } from "react";
import { SonosSearchTypes } from "@enums/SonosSearchType";
import SearchResults from "@components/Search/SearchResults";
import { useSonosActions } from "@components/providers/SonosContext";
import type { TN_Track } from '@models/Track';
import type { TN_Artist } from '@models/Artist';
import type { TN_Album } from '@models/Album';


interface SearchResult {
    tracks: TN_Track[];
    artists: TN_Artist[];
    albums: TN_Album[];
}

export default function Page({ params }: { params: { query: string } }) {
    const { query } = params;
    const player = useSonosActions();

    const [searchResults, setSearchResults] = useState<SearchResult>({
        tracks: [],
        artists: [],
        albums: [],
    });

    useEffect(() => {
        if (!query) return;

        player.fullFatSearch(query, Services.Spotify).then((result) => {
            console.log("Search result:", result);

            setSearchResults({
                tracks: (result.track?.mediaMetadata) || [],
                artists: (result.artist?.mediaCollection as TN_Artist[]) || [],
                albums: (result.album?.mediaCollection as TN_Album[]) || [],
            });
        });
        // Let's pre-fetch tracks, albums and artists
        player.search(query, SonosSearchTypes.Album, Services.Spotify, 24).then((result) => console.log("Pre-loaded " + result.mediaCollection.length + " albums"));
        player.search(query, SonosSearchTypes.Artist, Services.Spotify, 24).then((result) => console.log("Pre-loaded " + result.mediaCollection.length + " artists"));
        player.search(query, SonosSearchTypes.Track, Services.Spotify, 24).then((result) => console.log("Pre-loaded " + result.mediaMetadata.length + " tracks"));

    }, [query,player]);

    return (
        <SearchResults
            term={query}
            trackResults={searchResults.tracks.slice(0, 12)}
            albumResults={searchResults.albums}
            artistResults={searchResults.artists}
        />
    );
}
