import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useSonosContext } from '@providers/SonosContext';
import { SonosSearchTypes } from '@enums/SonosSearchType';
import { Services } from '@enums/Services';
import { ITrackEntity } from '@components/result-types/trackEntity';
import { IArtistEntity } from '@components/result-types/artistEntity';
import { IAlbumEntity } from '@components/result-types/albumEntity';
import React from 'react';

// SearchBar.tsx
interface SearchBarProps {
    onSearchResults: (results: {
        type: SonosSearchTypes;
        tracks: ITrackEntity[];
        artists: IArtistEntity[];
        albums: IAlbumEntity[];
    }) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearchResults }) => {
    const player = useSonosContext();
    const [searchType, setSearchType] = React.useState(SonosSearchTypes.All);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const query = (event.target as HTMLInputElement).value;

            if (searchType === SonosSearchTypes.All) {
                player.fullFatSearch(query, Services.Spotify).then((result) => {
                    console.log('Search result:', result);
                    onSearchResults({
                        type: searchType,
                        tracks: result.track.mediaMetadata as ITrackEntity[] || [],
                        artists: result.artist.mediaCollection || [],
                        albums: result.album.mediaCollection as IAlbumEntity[] || [],
                    });
                });
            } else {
                player.search(query, searchType, Services.Spotify, 10).then((result) => {
                    const tracks = searchType === SonosSearchTypes.Track ? result.mediaMetadata as ITrackEntity[] || [] : [];
                    const collection = result.mediaCollection || [];

                    onSearchResults({
                        type: searchType,
                        tracks,
                        artists: searchType === SonosSearchTypes.Artist ? collection : [],
                        albums: searchType === SonosSearchTypes.Album ? collection as IAlbumEntity[] : [],
                    });
                });
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
