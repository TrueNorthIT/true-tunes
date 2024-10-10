import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useSonosContext } from './providers/SonosContext';
import { SonosSearchTypes } from '../enums/SonosSearchType';
import { Services } from '../enums/Services';
import TrackEntity, { ITrackEntity } from './result-types/trackEntity';
import { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';
import React from 'react';
import ArtistEntity, { IArtistEntity } from './result-types/artistEntity';
import AlbumEntity, { IAlbumEntity } from './result-types/albumEntity';

const SearchBar: React.FC = () => {

    const player = useSonosContext()

    const [trackResults, setTrackResults] = React.useState<ITrackEntity[]>([]);
    const [artistResults, setArtistResults] = React.useState<IArtistEntity[]>([]);
    const [albumResults, setAlbumResults] = React.useState<IAlbumEntity[]>([]);

    const handleKeyDown = event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            // Search for the query
            
            player.fullFatSearch(event.target.value, Services.Spotify).then((result) => {
                console.log(result);

                let tracks = result[SonosSearchTypes.Track].mediaMetadata;
                let artists = result[SonosSearchTypes.Artist].mediaCollection;
                let albums = result[SonosSearchTypes.Album].mediaCollection;

                setTrackResults(tracks.map((entity: ITrackEntity) => entity));
                setArtistResults(artists.map((entity: IArtistEntity) => entity));
                setAlbumResults(albums.map((entity: IAlbumEntity) => entity));

            });
            console.log(artistResults);
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

        <h1>Tracks</h1>
        {
            trackResults.map((entity: ITrackEntity) => {
                return <TrackEntity entity={entity} />
            })

        }

        <h1>Artists</h1>
        {
            artistResults.map((entity: IArtistEntity) => {
                return <ArtistEntity entity={entity} />
            })

        }

        <h1>Albums</h1>
        {
            albumResults.map((entity: IAlbumEntity) => {
                return <AlbumEntity entity={entity} />
            })
        }
        </>
        
    )
};

export default SearchBar;
