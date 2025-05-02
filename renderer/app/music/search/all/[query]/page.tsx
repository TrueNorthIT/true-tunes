"use client";

import { useActionState, useEffect, useState } from "react";
import { IAlbumEntity } from "@components/result-types/albumEntity";
import { IArtistEntity } from "@components/result-types/artistEntity";
import { ITrackEntity } from "@components/result-types/trackEntity";
import SearchResults from "@components/Search/SearchResults";
import { Services } from "@enums/Services";
import { SonosSearchTypes } from "@enums/SonosSearchType";
import { useSonosActions } from "@components/providers/SonosContext";
import { useRouter } from "next/navigation";

interface SearchResult {
    tracks: ITrackEntity[];
    artists: IArtistEntity[];
    albums: IAlbumEntity[];
}

export default function Page({ params }: { params: { query: string } }) {
    const { query } = params;
    const player = useSonosActions();
    const router = useRouter();

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

    }, [query,]); // ⬅️ Very important: dependencies!

    return (
        <SearchResults
            term={query}
            trackResults={searchResults.tracks.slice(0, 12)}
            albumResults={searchResults.albums}
            artistResults={searchResults.artists}
        />
    );
}
