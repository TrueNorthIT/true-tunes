import React, { useEffect, useRef, useState } from 'react';
import { SonosSearchTypes } from '@enums/SonosSearchType';
import { ITrackEntity } from '@components/result-types/trackEntity';
import { IArtistEntity } from '@components/result-types/artistEntity';
import { IAlbumEntity } from '@components/result-types/albumEntity';
import TrackEntity from '@components/result-types/trackEntity';
import ArtistEntity from '@components/result-types/artistEntity';
import AlbumEntity from '@components/result-types/albumEntity';
import AlbumView from './AlbumView';
import ArtistView from './ArtistView';

interface SearchResultsProps {
    searchType: SonosSearchTypes;
    trackResults: ITrackEntity[];
    artistResults: IArtistEntity[];
    albumResults: IAlbumEntity[];
}

const CARD_WIDTH = 128; // 32 * 4px = Tailwind w-32
const GAP = 24;         // Tailwind gap-6 = 1.5rem = 24px

const SearchResults: React.FC<SearchResultsProps> = ({
    searchType,
    trackResults,
    artistResults,
    albumResults,
}) => {
    const artistRowRef = useRef<HTMLDivElement>(null);
    const [visibleArtistCount, setVisibleArtistCount] = useState(artistResults.length);


    const [selectedAlbum, setSelectedAlbum] = useState<IAlbumEntity | null>(null);
    const [selectedArtist, setSelectedArtist] = useState<IArtistEntity | null>(null);

    const updateVisibleArtistCount = () => {
        const container = artistRowRef.current;
        if (!container) return;

        const availableWidth = container.offsetWidth;
        const fullCardWidth = CARD_WIDTH + GAP;

        const maxCount = Math.floor(availableWidth / fullCardWidth);
        setVisibleArtistCount(maxCount);
    };

    useEffect(() => {
        updateVisibleArtistCount(); // initial run

        const observer = new ResizeObserver(updateVisibleArtistCount);
        if (artistRowRef.current) observer.observe(artistRowRef.current);

        return () => observer.disconnect();
    }, [artistResults.length]);

    const hasAnyResults = trackResults.length || artistResults.length || albumResults.length;

    if (!hasAnyResults)
        return <p className="text-gray-400 text-center mt-8">No results found.</p>;

    if (selectedAlbum) return <AlbumView album={selectedAlbum} onBack={(artist?: IArtistEntity) => { setSelectedAlbum(null); if (artist) setSelectedArtist(artist) }} />;
    if (selectedArtist) return <ArtistView artist={selectedArtist} onBack={(album?: IAlbumEntity) => { setSelectedArtist(null); if (album) setSelectedAlbum(album) }} />;


    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden slick-scrollbar">
            <div className="mx-auto max-w-[2000px] mt-6 space-y-10 px-1 sm:px-2 md:px-4 pr-1  @container">


                {/* Songs */}
                {searchType === SonosSearchTypes.All &&
                    <>
                        <section>
                            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3">Songs</h2>
                            <div className="grid grid-cols-2  @[1000px]:grid-cols-3 @[1300px]:grid-cols-4 gap-2">
                                {trackResults.map((track) => (
                                    <TrackEntity
                                        key={track.id}
                                        entity={track}
                                        small={false}
                                        playing={false}
                                        showImage={true}
                                        isSearchResult={true}
                                    />
                                ))}
                            </div>
                        </section>
                        <section className="relative">
                            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3">Artists</h2>

                            <div ref={artistRowRef} className="flex justify-evenly overflow-hidden p-2">
                                {artistResults.slice(0, visibleArtistCount).map((artist) => (
                                    <div
                                        key={artist.id}
                                        className="w-24 sm:w-28 md:w-32 flex-shrink-0"
                                    >
                                        <ArtistEntity entity={artist} onSelect={() => setSelectedArtist(artist)} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>

                }    <section>
                    <h2 className="text-lg sm:text-xl font-semibold text-white mb-3">Albums</h2>
                    <div className="grid grid-cols-3 @[1000px]:grid-cols-4 @[1300px]:grid-cols-6 gap-4">
                        {albumResults.map((album) => (
                            <AlbumEntity key={album.id} entity={album} onSelect={() => setSelectedAlbum(album)} />
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default SearchResults;
