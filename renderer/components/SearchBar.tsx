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
                        className="pointer-events-none absolute inset-y-0 left-3 h-full w-5 text-gray-900"
                    />
                    <input
                        id="search-field"
                        name="search"
                        type="search"
                        placeholder="Search..."
                        className="block h-full w-full border-0 p-4 pl-12 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm rounded-full"
                        onKeyDown={handleKeyDown}
                    />

                </form>

            </div>


            <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-1">
                <div className="flex p-px lg:col-span-6 h-min">
                    <div className="overflow-hidden rounded-lg bg-gray-800 ring-1 ring-white/15 lg:rounded-t-[2rem] flex-grow">
                        <div className="p-10">


                            <div className="border-b-4 border-gray-700 bg-gray-800 pb-3 mb-3">
                                <h3 className="text-2xl font-semibold leading-6 text-gray-50">Tracks</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:grid-cols-4">
                                {
                                    trackResults.map((entity: ITrackEntity) => {
                                        return <TrackEntity key={entity.id} entity={entity} />
                                    })

                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex p-px lg:col-span-3">
                    <div className="overflow-hidden rounded-lg bg-gray-800 ring-1 ring-white/15 lg:rounded-bl-[2rem]">
                        <div className="p-10">
                            <div className="border-b-4 border-gray-700 bg-gray-800 pb-3 mb-3">
                                <h3 className="text-2xl font-semibold leading-6 text-gray-50">Albums</h3>
                            </div>
                            <ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-3 xl:gap-x-8">
                                {
                                    albumResults.map((entity: IAlbumEntity) => {
                                        return <AlbumEntity key={entity.id} entity={entity} />
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="flex p-px lg:col-span-3">
                    <div className="overflow-hidden rounded-lg bg-gray-800 ring-1 ring-white/15  lg:rounded-br-[2rem]">
                        <div className="p-10">
                            <div className="border-b-4 border-gray-700 bg-gray-800 pb-3 mb-3">
                                <h3 className="text-2xl font-semibold leading-6 text-gray-50">Artists</h3>
                            </div>
                            <ul role="list" className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                                {
                                    artistResults.map((entity: IArtistEntity) => {
                                        return <ArtistEntity key={entity.id} entity={entity} />
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

        </>

    )
};

export default SearchBar;
