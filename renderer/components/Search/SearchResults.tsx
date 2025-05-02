import React, { useEffect, useRef, useState } from 'react';
import { ITrackEntity } from '@components/result-types/trackEntity';
import { IArtistEntity } from '@components/result-types/artistEntity';
import { IAlbumEntity } from '@components/result-types/albumEntity';
import TrackEntity from '@components/result-types/trackEntity';
import ArtistEntity from '@components/result-types/artistEntity';
import AlbumEntity from '@components/result-types/albumEntity';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DndContext, DragOverlay, useDraggable } from '@dnd-kit/core';
import { DraggableTrack, SortableTrack } from '@components/Queue/queue';

interface SearchResultsProps {
    term: string;
    trackResults: ITrackEntity[];
    artistResults: IArtistEntity[];
    albumResults: IAlbumEntity[];
}

const CARD_WIDTH = 128;
const GAP = 24;


const SearchResults: React.FC<SearchResultsProps> = ({
    term,
    trackResults,
    artistResults,
    albumResults,
}) => {
    const artistRowRef = useRef<HTMLDivElement>(null);
    const [visibleArtistCount, setVisibleArtistCount] = useState(artistResults.length);

    const router = useRouter();


    const updateVisibleArtistCount = () => {
        const container = artistRowRef.current;
        if (!container) return;

        const availableWidth = container.offsetWidth;
        const fullCardWidth = CARD_WIDTH + GAP;
        const maxCount = Math.floor(availableWidth / fullCardWidth);
        setVisibleArtistCount(maxCount);
    };

    useEffect(() => {
        updateVisibleArtistCount();
        const observer = new ResizeObserver(updateVisibleArtistCount);
        if (artistRowRef.current) observer.observe(artistRowRef.current);
        return () => observer.disconnect();
    }, [artistResults.length]);

    const hasAnyResults = trackResults.length || artistResults.length || albumResults.length;
    if (!hasAnyResults) {
        return <p className="text-gray-400 text-center mt-8">No results found.</p>;
    }


    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden slick-scrollbar">


            <div className="mx-auto max-w-[2000px] mt-6 space-y-10 px-1 sm:px-2 md:px-4 pr-1 @container">

                <section>

                    <h2 className="text-lg sm:text-xl font-semibold text-white mb-3">
                        <Link href={"/music/search/track/" + term} className='hover:underline'>
                            Tracks
                        </Link>
                    </h2>

                    <div className="grid grid-cols-2 @[1000px]:grid-cols-3 @[1300px]:grid-cols-4 gap-2">
                        {trackResults.map((track, index) => (
                            <DraggableTrack
                                key={`search-${track.id}`}
                                id={`search-${track.id}`}
                                track={track}
                                small={false}
                                playing={false}
                                index={index}
                                selected={false}
                                hideAlbumArt={false}
                                onSelect={() => { }}
                            ></DraggableTrack>
                        ))}
                    </div>

                </section>



                <section className="relative">
                    <h2 className="text-lg sm:text-xl font-semibold text-white mb-3">
                        <Link href={"/music/search/artist/" + term} className='hover:underline'>
                            Artists
                        </Link>
                    </h2>
                    <div ref={artistRowRef} className="flex justify-evenly overflow-hidden p-2">
                        {artistResults.slice(0, visibleArtistCount).map((artist) => (
                            <div
                                key={artist.id}
                                className="w-24 sm:w-28 md:w-32 flex-shrink-0"
                            >
                                <ArtistEntity entity={artist} onSelect={() => router.push(`/music/view/artist/${artist.id}`)} />
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-lg sm:text-xl font-semibold text-white mb-3">
                        <Link href={"/music/search/album/" + term} className='hover:underline'>
                            Albums
                        </Link>
                    </h2>
                    <div className="grid grid-cols-6 gap-4">
                        {albumResults.map((album) => (
                            <AlbumEntity key={album.id} entity={album} onSelect={() => router.push(`/music/view/album/${album.id}`)} />
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default SearchResults;
