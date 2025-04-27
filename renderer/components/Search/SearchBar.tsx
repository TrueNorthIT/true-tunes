import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useSonosActions } from '@providers/SonosContext';
import { SonosSearchTypes } from '@enums/SonosSearchType';

import React from 'react';
import { useRouter } from 'next/navigation';


const SearchBar: React.FC = () => {
    const player = useSonosActions();
    const [searchType, setSearchType] = React.useState(SonosSearchTypes.All);
    const router = useRouter()
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const query = (event.target as HTMLInputElement).value;

            switch (searchType) {
                case SonosSearchTypes.Track:
                    if (query) router.push(`/music/search/track/${query}`)    
                    else router.push(`/music`)
                    break;
                case SonosSearchTypes.Artist:
                    if (query) router.push(`/music/search/artist/${query}`)    
                    else router.push(`/music`)
                    break;
                case SonosSearchTypes.Album:
                    if (query) router.push(`/music/search/album/${query}`)    
                    else router.push(`/music`)
                    break;
                case SonosSearchTypes.All:
                default:
                    if (query) router.push(`/music/search/all/${query}`)    
                    else router.push(`/music`)
                    break;
            }



        }
    };

    return (
        <div className="flex items-center space-x-4">
            <form className="relative flex flex-1">
                <label htmlFor="search-field" className="sr-only">Search</label>
                <MagnifyingGlassIcon className="pointer-events-none absolute inset-y-0 left-2 h-full w-5 text-gray-400" />
                <input
                    id="search-field"
                    name="search"
                    type="search"
                    placeholder="Search..."
                    className="block h-full w-full border-0 p-4 pl-8 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                    onKeyDown={handleKeyDown}
                />
                <select
                    id="search-type"
                    name="search-type"
                    className="ml-4 w-32 px-4 right-2 top-2 bg-gray-800 text-white rounded-md"
                    onChange={(e) => setSearchType(e.target.value as SonosSearchTypes)}
                >
                    <option value={SonosSearchTypes.All}>All</option>
                    <option value={SonosSearchTypes.Track}>Track</option>
                    <option value={SonosSearchTypes.Artist}>Artist</option>
                    <option value={SonosSearchTypes.Album}>Album</option>
                </select>

            </form>
        </div>
    );
};


export default SearchBar;
