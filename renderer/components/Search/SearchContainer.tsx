// SearchContainer.tsx
import { useAsideBreakpoint } from "@components/providers/AsideBreakpointContext";
import { useSonosContext } from "@components/providers/SonosContext";
import SearchBar from "@components/Search/SearchBar";
import SearchResults from "@components/Search/SearchResults";
import { useState } from "react";
import { SonosSearchTypes } from "@enums/SonosSearchType";
import { ITrackEntity } from "@components/result-types/trackEntity";
import { IArtistEntity } from "@components/result-types/artistEntity";
import { IAlbumEntity } from "@components/result-types/albumEntity";

const SearchContainer = () => {
    const { mainRef, handleRef } = useAsideBreakpoint();
    const sonosContext = useSonosContext();

    const [searchType, setSearchType] = useState(SonosSearchTypes.Track);
    const [trackResults, setTrackResults] = useState<ITrackEntity[]>([]);
    const [artistResults, setArtistResults] = useState<IArtistEntity[]>([]);
    const [albumResults, setAlbumResults] = useState<IAlbumEntity[]>([]);

    const handleSearchResults = ({
        type,
        tracks,
        artists,
        albums,
    }: {
        type: SonosSearchTypes;
        tracks: ITrackEntity[];
        artists: IArtistEntity[];
        albums: IAlbumEntity[];
    }) => {
        setSearchType(type);
        setTrackResults(tracks);
        setArtistResults(artists);
        setAlbumResults(albums);
    };

    return (
        <main className="flex flex-col h-full min-h-0 px-4 py-10 sm:px-6 lg:px-8 lg:py-6 relative w-full" ref={mainRef}>
            <div ref={handleRef} className="absolute left-0 right-0 top-0 h-full w-2 cursor-col-resize bg-gray-300" />

            <SearchBar onSearchResults={handleSearchResults} />

            {/* SearchResults gets full remaining height and can scroll */}
            <div className="flex-1 min-h-0 overflow-y-auto px-1 pb-6 space-y-8 mb-16 mt-4">
                <SearchResults
                    searchType={searchType}
                    trackResults={trackResults}
                    artistResults={artistResults}
                    albumResults={albumResults}
                />
            </div>
        </main>


    );
};

export default SearchContainer;
