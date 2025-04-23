import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useSonosContext } from '@providers/SonosContext';
import { SonosSearchTypes } from '@enums/SonosSearchType';
import { Services } from '@enums/Services';
import TrackEntity, { ITrackEntity } from '@components/result-types/trackEntity';
import { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';
import React from 'react';

const SearchBar: React.FC = () => {

    const player = useSonosContext()

    const [results, setResults] = React.useState<ITrackEntity[]>([]);

    const [searchType, setSearchType] = React.useState(SonosSearchTypes.Track);

    const handleKeyDown = event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            // Search for the query


            player.search(event.target.value, searchType, Services.Spotify, 10).then((result) => {

                setResults(result.mediaMetadata?.map((entity: ITrackEntity) => entity));

            });

            console.log(results);
        }
    }

    return (
        <>
            <div className="flex items-center space-x-4">
                <form action="#" method="GET" className="relative flex flex-1 ">
                    <label htmlFor="search-field" className="sr-only">Search</label>
                    <MagnifyingGlassIcon
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 left-2 h-full w-5 text-gray-400 "
                    />
                    <input
                        id="search-field"
                        name="search"
                        type="search"
                        placeholder="Search..."
                        className="block h-full w-full border-0 p-4 pl-8 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                        onKeyDown={handleKeyDown}
                    />

                    {/* Search Type switcher, Track vs Artist */}
                    <select
                        id="search-type"
                        name="search-type"
                        className="ml-4 w-32 px-4 right-2 top-2 bg-gray-800 text-white rounded-md "
                        onChange={(e) => {
                            // Handle search type change
                            setSearchType(e.target.value as SonosSearchTypes);
                        }}
                    >
                        <option value={SonosSearchTypes.Track}>Track</option>
                        <option value={SonosSearchTypes.Artist}>Artist</option>
                        <option value={SonosSearchTypes.Album}>Album</option>
                    </select>
                </form>

            </div>

            {/* <pre>{JSON.stringify(results, undefined, 2)}</pre> */}

            {
                results?.map((entity: ITrackEntity) => {
                    return <TrackEntity entity={entity} small={false} playing={false} showImage={true} isSearchResult={true} />
                })
            }
        </>

    )
};

export default SearchBar;
