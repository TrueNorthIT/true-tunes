import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useSonosContext } from './providers/SonosContext';
import { SonosSearchTypes } from '../enums/SonosSearchType';
import { Services } from '../enums/Services';
import TrackEntity, { ITrackEntity } from './result-types/trackEntity';
import { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';
import React from 'react';

const SearchBar: React.FC = () => {

    const player = useSonosContext()

    const [results, setResults] = React.useState<ITrackEntity[]>([]);

    const handleKeyDown = event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            // Search for the query
            

            player.search(event.target.value, SonosSearchTypes.Track, Services.Spotify).then((result) => {

                setResults(result.mediaMetadata.map((entity: ITrackEntity) => entity));
       
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
                    className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 "
                />
                <input
                    id="search-field"
                    name="search"
                    type="search"
                    placeholder="Search..."
                    className="block h-full w-full border-0 p-4 pl-8 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                    onKeyDown={handleKeyDown}
                />
                
            </form>
        
        </div>

        {/* <pre>{JSON.stringify(results, undefined, 2)}</pre> */}

        {
            results.map((entity: ITrackEntity) => {
                return <TrackEntity entity={entity} />
            })
        }
        </>
        
    )
};

export default SearchBar;
