// SearchContainer.tsx
import { useAsideBreakpoint } from "@components/providers/AsideBreakpointContext";
import SearchBar from "@components/Search/SearchBar";
import SearchResults from "@components/Search/SearchResults";
import { ReactNode, useState } from "react";
import { SonosSearchTypes } from "@enums/SonosSearchType";
import { ITrackEntity } from "@components/result-types/trackEntity";
import { IArtistEntity } from "@components/result-types/artistEntity";
import { IAlbumEntity } from "@components/result-types/albumEntity";

const SearchContainer = ({ children }: { children: ReactNode }) => {
    const { mainRef, handleRef } = useAsideBreakpoint();
  

    return (
        <main className="flex flex-col h-full min-h-0 px-4 py-10 sm:px-6 lg:px-8 lg:py-6 relative w-full" ref={mainRef}>
            <div ref={handleRef} className="absolute left-0 right-0 top-0 h-full w-2 cursor-col-resize bg-gray-300" />

            <SearchBar onSearchResults={console.table} />

            <div className="flex-1 min-h-0 overflow-y-auto px-1 pb-6 space-y-8 mb-16 mt-4">
                {children}
            </div>
        </main>


    );
};

export default SearchContainer;
