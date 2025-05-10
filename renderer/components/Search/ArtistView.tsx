import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSonosActions } from '@providers/SonosContext';
import { ipcService } from '@components/providers/ipcService';
import ImageWithFallback from '@components/ImageWithFallback';
import type { ArtistDetails } from '../../../main/MusicAPIService';
import missing_album_art from '@public/images/missing_album_art.png';
import { DraggableAlbum, IAlbumEntity } from '@components/result-types/albumEntity';
import { DraggableTrack } from '@components/result-types/trackEntity';
import type { TN_Artist } from '@models/Artist';
import type { TN_Track } from '@models/Track';
import { TN_Album } from '@models/Album';

interface ArtistViewProps {
    artist: TN_Artist;
}

const ArtistView: React.FC<ArtistViewProps> = ({ artist }) => {
    const player = useSonosActions();
    const [artistDetail, setArtistDetail] = useState<ArtistDetails | null>(null);
    const [topTracks, setTopTracks] = useState<TN_Track[]>([]);

    // --- paging state ---
    const albumsPageSize = 12;
    const [albums, setAlbums] = useState<TN_Album[]>([]);
    const [albumPageIndex, setAlbumPageIndex] = useState(0);
    const [loadingAlbums, setLoadingAlbums] = useState(false);
    const [hasMoreAlbums, setHasMoreAlbums] = useState(true);

    const router = useRouter();

    // --- reset when artist changes ---
    useEffect(() => {
        setArtistDetail(null);
        setTopTracks([]);
        setAlbums([]);
        setAlbumPageIndex(0);
        setHasMoreAlbums(true);
    }, [artist]);

    // --- fetch artist detail & topTracks once ---
    useEffect(() => {
        ipcService.getArtistDetails(artist.name).then(setArtistDetail);

        player.getMetadata(artist.id).then((result) => {
            const allItems = result?.mediaCollection || [];
            const trackList = allItems.find(a => a.itemType === 'trackList');
            player.getAlbum(trackList?.id).then((album => {
                Promise.all((album.trackList).map(t => player.getTrack(t.id))).then(tracks => setTopTracks(tracks));
            }));
        });
    }, [artist, player]);

    // --- fetch one page of albums whenever pageIndex changes ---
    useEffect(() => {
        if (!hasMoreAlbums) return;
        console.log(`Fetching albums Artist: ${artist.id} Skip: ${albumPageIndex * albumsPageSize} Count: ${albumsPageSize}`);
        setLoadingAlbums(true);
        player
            .getMetadata(
                artist.id,
                albumPageIndex * albumsPageSize,
                albumsPageSize
            )
            .then((result) => {
                if (!result) return;
                console.log('Fetched albums:', result);
                Promise.all((result?.mediaCollection || []).filter(a => a.itemType !== 'trackList').map(a => player.utils.convertAlbumEntityToTNAlbum(a as IAlbumEntity))).then(newAlbums => {
                    // append & dedupe
                    setAlbums(prev => {
                        const seen = new Set(prev.map(a => a.id));
                        const dedupedNew = newAlbums.filter(a => !seen.has(a.id));
                        return [...prev, ...dedupedNew];
                    });


                    // if we got fewer than a full page back, no more pages
                    if (albums.length >= result.total) {
                        setHasMoreAlbums(false);
                    }
                });
            })
            .finally(() => setLoadingAlbums(false));
    }, [artist.id, albumPageIndex]);

    // --- scroll listener ---
    useEffect(() => {
        const container = document.getElementById('scroll-container');
        if (!container) return;

        const onScroll = () => {
            console.log('scrolling', loadingAlbums, hasMoreAlbums);
            if (loadingAlbums || !hasMoreAlbums) return;
            const { scrollTop, scrollHeight, clientHeight } = container;
            if (scrollTop + clientHeight >= scrollHeight - 200) {
                console.log('Loading more albums...');
                setAlbumPageIndex(i => i + 1);
            }
        };

        container.addEventListener('scroll', onScroll);
        return () => container.removeEventListener('scroll', onScroll);
    }, [loadingAlbums, hasMoreAlbums]);

    // --- render ---
    return (
        <div className="w-full">
            {/* Hero / Header Section */}
            <div className="relative w-full h-[540px] overflow-hidden">
                {artistDetail === null ? (
                    <div className="absolute inset-0 bg-gray-800 animate-pulse" />
                ) : artistDetail.art?.background ? (
                    <div
                        className="absolute inset-0 bg-no-repeat bg-top z-10"
                        style={{
                            backgroundImage: `url(${artistDetail.art.background})`,
                            backgroundSize: '100% auto',
                            backgroundPosition: 'top center',
                            maxWidth: '1500px',
                            margin: '0 auto',
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 z-10 grid grid-cols-4 grid-rows-2 gap-1 blur-md">
                        {albums.length > 0
                            ? Array.from({ length: 8 }, (_, i) => albums[i % albums.length]).map((album, idx) => (
                                <img
                                    key={`${album.id}-${idx}`}
                                    src={album.artURI}
                                    alt={album.name}
                                    className="w-full h-full object-cover"
                                />
                            ))
                            : Array.from({ length: 8 }).map((_, idx) => (
                                <div
                                    key={`ph-${idx}`}
                                    className="w-full h-full bg-gray-800 animate-pulse"
                                />
                            ))}
                    </div>
                )}

                <div
                    className="absolute inset-0 bg-no-repeat bg-top z-0"
                    style={{
                        backgroundImage: artistDetail?.art?.background
                            ? `url(${artistDetail.art.background})`
                            : undefined,
                        backgroundSize: '100% auto',
                        backgroundPosition: 'center',
                        filter: 'blur(20px)',
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent z-20" />
                <div className="relative z-30 h-full flex items-end p-6 text-white">
                    {/* …same as before… */}
                    <ImageWithFallback
                        src={artist.artURI}
                        alt={artist.name}
                        fallback={missing_album_art}
                        className="w-64 h-64 object-cover rounded-full shadow-lg"
                    />
                    <div>
                        <h1 className="text-3xl font-bold">{artistDetail?.name || artist.name}</h1>
                        {artistDetail?.listeners && (
                            <p className="text-sm text-gray-300">{artistDetail.listeners.toLocaleString()} monthly listeners</p>
                        )}
                        {artistDetail?.bio?.summary && (
                            <div
                                className="mt-1 text-sm text-gray-400 line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: artistDetail.bio.summary }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6 text-white">
            <h2 className="text-xl font-semibold mb-4">Top Tracks</h2>
                <div className="grid grid-cols-2 @[1000px]:grid-cols-3 @[1300px]:grid-cols-4 gap-2">
                    {topTracks.map((track, i) => (
                        <DraggableTrack
                            key={track.id}
                            id={`search-${track.id}`}
                            entity={track}
                            index={i}
                            playing={false}
                            small={false}
                            isSelected={false}
                            showImage
                            onSelect={() => { }}
                        />
                    ))}
                </div>

                <h2 className="text-xl font-semibold my-4">Albums</h2>
                <div
                    className="h-[400px]  grid grid-cols-6 gap-4"
                >
                    {albums.map(album => (
                        <DraggableAlbum
                            key={album.id}
                            id={`search-album-${album.id}`}
                            entity={album}
                            onSelect={() => router.push(`/music/view/album/${album.id}`)}
                        />
                    ))}

                    {loadingAlbums &&
                        Array.from({ length: albumsPageSize }).map((_, i) => (
                            <div
                                key={`alb-ph-${i}`}
                                className="aspect-square rounded bg-gray-800 animate-pulse"
                            />
                        ))}
                </div>
            </div>
        </div>
    );
};

export default ArtistView;
