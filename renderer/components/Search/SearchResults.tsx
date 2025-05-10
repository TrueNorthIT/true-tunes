import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import ArtistEntity from '@components/result-types/artistEntity';
import { DraggableTrack } from '@components/result-types/trackEntity';
import { DraggableAlbum } from '@components/result-types/albumEntity';
import type { TN_Track } from '@models/Track';
import type { TN_Artist } from '@models/Artist';
import type { TN_Album } from '@models/Album';
interface SearchResultsProps {
    term: string;
    trackResults: TN_Track[];
    artistResults: TN_Artist[];
    albumResults: TN_Album[];
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
                                entity={track}
                                small={false}
                                playing={false}
                                index={index}
                                isSelected={false}
                                isSearchResult={true}
                                showImage={true}
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
                            <DraggableAlbum id={`search-album-${album.id}`} key={album.id} entity={album} onSelect={() => router.push(`/music/view/album/${album.id}`)} />
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default SearchResults;
