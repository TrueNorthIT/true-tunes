import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSonosActions } from '@providers/SonosContext';
import { ipcService } from '@components/providers/ipcService';
import ImageWithFallback from '@components/ImageWithFallback';
import type { ArtistDetails } from '../../../main/MusicAPIService';
import missing_album_art from '@public/images/missing_album_art.png';
import { DraggableAlbum, type IAlbumEntity } from '@components/result-types/albumEntity';
import { DraggableTrack, type ITrackEntity } from '@components/result-types/trackEntity';
import type { IArtistEntity } from '@components/result-types/artistEntity';

interface ArtistViewProps {
    artist: IArtistEntity;
    onBack?: (album?: IAlbumEntity) => void;
}

const ArtistView: React.FC<ArtistViewProps> = ({ artist, onBack }) => {
    const player = useSonosActions();
    const [albums, setAlbums] = useState<IAlbumEntity[]>([]);
    const [artistDetail, setArtistDetail] = useState<ArtistDetails | null>(null);
    const [topTracks, setTopTracks] = useState<ITrackEntity[]>([]);

    const router = useRouter();

    useEffect(() => {
        ipcService.getArtistDetails(artist.title).then((result) => {
            setArtistDetail(result);
        });

        player.getMetadata(artist.id).then((result) => {
            console.log('Artist! Metadata:', result);
            const albums = result?.mediaCollection?.filter(a => a.itemType === 'album') as IAlbumEntity[] || [];
            const topTracks = result?.mediaCollection?.filter(a => a.itemType === "trackList")?.[0] || null;

            if (topTracks) {
                player.getMetadata(topTracks.id).then((result) => {
                    const tracks = result?.mediaMetadata as ITrackEntity[] || [];
                    setTopTracks(tracks);
                });
            }

            setAlbums(albums);



        });
    }, [artist, player]);

    return (
        <div className="w-full">
            {/* Hero / Header Section */}
            <div className="relative w-full h-[540px] overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-no-repeat bg-top z-10"
                    style={{
                        backgroundImage: `url(${artistDetail?.art?.background})`,
                        backgroundSize: '100% auto', // Scale proportionally to width
                        backgroundPosition: 'top center',
                        maxWidth: '1500px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}
                />
                <div
                    className="absolute inset-0 bg-no-repeat bg-top z-0"
                    style={{
                        backgroundImage: `url(${artistDetail?.art?.background})`,
                        backgroundSize: '100% auto', // Scale proportionally to width
                        backgroundPosition: 'center',
                        filter: 'blur(20px)',
                    }}
                />

                {/* Optional Left Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent z-10" />

                {/* Content Layer */}
                <div className="relative z-20 h-full flex items-end p-6 text-white">
                    <div className="flex items-center gap-6">
                        <ImageWithFallback
                            src={artist.albumArtURI}
                            alt={artist.title}
                            fallback={missing_album_art}
                            className="w-64 h-64 object-cover rounded-[100%] shadow-lg"
                        />
                        <div>
                            <h1 className="text-3xl font-bold">{artistDetail?.name || artist.title}</h1>
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
            </div>


            {/* Main Content */}
            <div className="p-6 text-white">
                {onBack && (
                    <button
                        onClick={() => onBack()}
                        className="mb-4 text-sm text-indigo-400 hover:underline"
                    >
                        ← Back to search
                    </button>
                )}
                <h2 className="text-xl font-semibold mb-4">Top Tracks</h2>
                <div className="grid grid-cols-2  @[1000px]:grid-cols-3 @[1300px]:grid-cols-4 gap-2">
                    {topTracks.map((track, index) => (
                        <DraggableTrack
                            key={`search-${track.id}`}
                            id={`search-${track.id}`}
                            entity={track}
                            small={false}
                            playing={false}
                            index={index}
                            isSelected={false}
                            showImage={true}
                            onSelect={() => { }}
                        ></DraggableTrack>
    
                    ))}
                </div>

                <h2 className="text-xl font-semibold mb-4">Albums</h2>
                <div className="grid grid-cols-12 gap-4">
                    {albums.map((album) => (
                        <DraggableAlbum id={`search-album-${album.id}`} key={album.id} entity={album} onSelect={() => router.push(`/music/view/album/${album.id}`)} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ArtistView;
