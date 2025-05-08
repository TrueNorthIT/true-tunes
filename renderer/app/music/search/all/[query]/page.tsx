"use client";

import React from 'react';
import { Services } from "@enums/Services";
import { useEffect, useState } from "react";
import { SonosSearchTypes } from "@enums/SonosSearchType";
import SearchResults from "@components/Search/SearchResults";
import { useSonosActions } from "@components/providers/SonosContext";
import type { IAlbumEntity } from "@components/result-types/albumEntity";
import type { ITrackEntity } from "@components/result-types/trackEntity";
import type { IArtistEntity } from "@components/result-types/artistEntity";

interface SearchResult {
    tracks: ITrackEntity[];
    artists: IArtistEntity[];
    albums: IAlbumEntity[];
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
                tracks: (result.track?.mediaMetadata as ITrackEntity[]) || [],
                artists: result.artist?.mediaCollection || [],
                albums: (result.album?.mediaCollection as IAlbumEntity[]) || [],
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
