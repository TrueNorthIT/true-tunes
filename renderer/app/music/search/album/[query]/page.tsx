"use client";

import { useEffect, useState } from "react";
import { IAlbumEntity } from "@components/result-types/albumEntity";
import SearchResults from "@components/Search/SearchResults";
import { Services } from "@enums/Services";
import { SonosSearchTypes } from "@enums/SonosSearchType";
import { useSonosActions } from "@components/providers/SonosContext";


export default function Page({ params }: { params: { query: string } }) {
    const { query } = params;
    const player = useSonosActions();

    const [searchResults, setSearchResults] = useState<IAlbumEntity[]>([]);

    useEffect(() => {
        if (!query) return;

        player.search(query, SonosSearchTypes.Album, Services.Spotify, 25).then((result) => {
            console.log("Search result:", result);

            setSearchResults(result.mediaCollection as IAlbumEntity[] || []);
        });
    }, [query,]); // ⬅️ Very important: dependencies!

    return (
        <SearchResults
            searchType={SonosSearchTypes.Album}
            trackResults={[]}
            albumResults={searchResults}
            artistResults={[]}
        />
    );
}
