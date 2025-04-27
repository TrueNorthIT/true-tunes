"use client";

import { useEffect, useState } from "react";
import { IAlbumEntity } from "@components/result-types/albumEntity";
import SearchResults from "@components/Search/SearchResults";
import { Services } from "@enums/Services";
import { SonosSearchTypes } from "@enums/SonosSearchType";
import { useSonosActions } from "@components/providers/SonosContext";
import { IArtistEntity } from "@components/result-types/artistEntity";
import { ITrackEntity } from "@components/result-types/trackEntity";


export default function Page({ params }: { params: { query: string } }) {
    const { query } = params;
    const player = useSonosActions();

    const [searchResults, setSearchResults] = useState<ITrackEntity[]>([]);

    useEffect(() => {
        if (!query) return;

        player.search(query, SonosSearchTypes.Track, Services.Spotify, 25).then((result) => {
            console.log("Search result:", result);

            setSearchResults(result?.mediaMetadata as ITrackEntity[] || []);
        });
    }, [query,]); // ⬅️ Very important: dependencies!

    return (
        <>
            <SearchResults
                searchType={SonosSearchTypes.Track}
                trackResults={searchResults}
                albumResults={[]}
                artistResults={[]}
            />
        </>
    );
}
