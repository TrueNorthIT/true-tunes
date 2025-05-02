import React, { useEffect, useState } from 'react';
import { IAlbumEntity } from '@components/result-types/albumEntity';
import { ITrackEntity } from '@components/result-types/trackEntity';
import { useSonosActions, } from '@providers/SonosContext';
import { ipcService } from '@components/providers/ipcService';
import { IArtistEntity } from '@components/result-types/artistEntity';
import { Services } from '@enums/Services';
import { SonosSearchTypes } from '@enums/SonosSearchType';
import { on } from 'events';
import Image from 'next/image';
import ImageWithFallback from '@components/ImageWithFallback';
import { useRouter } from 'next/navigation';

interface AlbumViewProps {
    album: IAlbumEntity;
    onBack?: (artist?: IArtistEntity) => void;
}

const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const AlbumView: React.FC<AlbumViewProps> = ({ album, onBack }) => {
    const player = useSonosActions();
    const [tracks, setTracks] = useState<ITrackEntity[]>([]);
    const [loading, setLoading] = useState(true);
    const [genres, setGenres] = useState<string[] | null>(null);

    const router = useRouter();

    useEffect(() => {
        setLoading(true);
        player.getMetadata(album.id).then((result) => {
            console.log('Album Metadata:', album);
            console.log('Album Tracks:', result);

            setTracks(result?.mediaMetadata as ITrackEntity[] || []);
            setLoading(false);
        });

        // const genreURL = `https://api.getgenre.com/search?artist_name=${encodeURIComponent(album.artist)}&album_name=${encodeURIComponent(album.title)}&timeout=30`;

        ipcService.getGenreInfo(album.artist, album.title)
            .then(data => {
                console.log('Genre data:', data);
                if (data?.top_genres?.length) {
                    setGenres(data.top_genres);
                } else if (data?.album_artists?.[0]?.genres?.length) {
                    setGenres(data.album_artists[0].genres);
                } else {
                    setGenres([]);
                }
            })
            .catch(err => {
                console.error('Genre fetch failed', err);
                setGenres([]);
            });
    }, [album]);

    const openArtist = async (artistName: string, artistId: string) => {
        const result = await player.search(artistName, SonosSearchTypes.Artist, Services.Spotify, 100);
        const foundArtist = result?.mediaCollection?.find((artist: IArtistEntity) => artist.id === artistId);
        console.log('Artist result:', foundArtist);
        if (foundArtist && onBack) onBack(foundArtist);
    }


    return (
        <div className="p-6 max-w-4xl mx-auto">
            {onBack && (
                <button onClick={() => onBack()} className="mb-4 text-sm text-indigo-400 hover:underline">
                    ← Back to search
                </button>
            )}

            <div className="flex items-start gap-6">
                <ImageWithFallback src={album.albumArtURI} alt={album.title} className="w-32 h-32 object-cover rounded-lg" />
                <div>
                    <h1 className="text-2xl font-bold text-white">{album.title}</h1>
                    <p className="text-gray-400 hover:underline" onClick={() => router.push(`/music/view/artist/${album.artistId}`)} >{album.artist}</p>
                    {genres === null && <p className="text-gray-400">Loading genres...</p>}
                    {(genres && genres.length) > 0 && (
                        <div className="mt-2 overflow-x-auto">
                            <div className="flex flex-nowrap gap-2 pr-4">
                                {genres.map((genre) => (
                                    <span
                                        key={genre}
                                        className="bg-[#4338ca] text-white text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap"
                                    >
                                        {genre.toLocaleUpperCase()}
                                    </span>
                                ))}
                            </div>
                        </div>

                    )}

                </div>
            </div>

            {/* Buttons to add ablum to end of queue, to add next and to replace queue */}
            <div className="mt-6 flex flex-wrap gap-3">
                <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 text-sm font-medium"
                    onClick={async () => {
                        await player.addToQueue(album.id);
                        // tracks.forEach(track => {
                        //     player.addToQueue(track.id);
                        // });
                    }}
                >
                    ➕ Add to Queue
                </button>

                <button
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 text-sm font-medium"
                    onClick={async () => {
                        await player.playNext(album.id);
                        // for (let i = 0; i < tracks.length; i++) {
                        //     await player.playNext(tracks[i].id);
                        // }
                    }}
                >
                    ⏭️ Add Next
                </button>

                <button
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 text-sm font-medium"
                    onClick={async () => {
                        // await player.replaceQueue(tracks.map(track => track.id));
                        // player.play(); // or `player.next()` if that’s how you start playback
                    }}
                >
                    ♻️ Replace Queue
                </button>
            </div>

            <div className="mt-6">
                <h2 className="text-xl font-semibold text-white mb-3">Track List</h2>

                {loading ? (
                    <p className="text-gray-400">Loading tracks...</p>
                ) : (
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-gray-400 text-sm">
                                <th className="w-12 px-2">#</th>
                                <th>Title</th>
                                <th className="w-24 text-right">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tracks.map((track) => (
                                <tr key={track.id} className="bg-gray-800 hover:bg-gray-700 rounded-md text-white text-sm">
                                    <td className="px-2 align-middle">{track.trackMetadata?.trackNumber}</td>
                                    <td className="py-2">
                                        <div className="flex items-center gap-2">
                                            <span>{track.title}</span>
                                            {track.tags?.explicit ? (
                                                <span className="text-xs bg-[#f85f5fce] text-white px-1.5 py-0.5 rounded-md">
                                                    EXPLICIT
                                                </span>
                                            ) : null}
                                        </div>
                                    </td>
                                    <td className="text-right pr-2 align-middle">
                                        {formatDuration(track.trackMetadata?.duration ?? 0)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AlbumView;
