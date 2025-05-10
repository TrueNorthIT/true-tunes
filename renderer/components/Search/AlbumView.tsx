import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSonosActions, } from '@providers/SonosContext';
import { ipcService } from '@components/providers/ipcService';
import ImageWithFallback from '@components/ImageWithFallback';
import { DraggableTrack } from '@components/result-types/trackEntity';
import type { IArtistEntity } from '@components/result-types/artistEntity';
import type { TN_Track } from '@models/Track';
import type { TN_Album } from '@models/Album';

interface AlbumViewProps {
    album: TN_Album;
    onBack?: (artist?: IArtistEntity) => void;
}



const AlbumView: React.FC<AlbumViewProps> = ({ album, onBack }) => {
    const player = useSonosActions();
    const [tracks, setTracks] = useState<TN_Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [genres, setGenres] = useState<string[] | null>(null);

    const router = useRouter();

    useEffect(() => {
        setLoading(true);
        Promise.all(album?.trackList.map(async (track) => await player.getTrack(track.id))).then((albumTracks) => {
            setTracks(albumTracks);            
            setLoading(false);
        }) 



        // const genreURL = `https://api.getgenre.com/search?artist_name=${encodeURIComponent(album.artist)}&album_name=${encodeURIComponent(album.title)}&timeout=30`;

        ipcService.getGenreInfo(album.artist.name, album.name)
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
    }, [album, player]);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {onBack && (
                <button onClick={() => onBack()} className="mb-4 text-sm text-indigo-400 hover:underline">
                    ← Back to search
                </button>
            )}

            <div className="flex items-start gap-6">
                <ImageWithFallback src={album.artURI} alt={album.name} className="w-32 h-32 object-cover rounded-lg" />
                <div>
                    <h1 className="text-2xl font-bold text-white">{album.name}</h1>
                    <p className="text-gray-400 hover:underline" onClick={() => router.push(`/music/view/artist/${album.artist.id}`)} >{album.artist.name}</p>
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
                ) : 
                    tracks.map((track) => (

                        <DraggableTrack
                            entity={track}
                            isSearchResult={true}
                            isSelected={false}
                            key={track.id}
                            showImage={false}
                            playing={false}
                            small={true}
                            id={`search-${track.id}`}
                            onSelect={() => {}}
                        
                        
                        />

                    ))}
            
            </div>
        </div>
    );
};

export default AlbumView;
