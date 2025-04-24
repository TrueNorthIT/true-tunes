import React, { useEffect, useState } from 'react';
import AlbumEntity, { IAlbumEntity } from '@components/result-types/albumEntity';
import { ITrackEntity } from '@components/result-types/trackEntity';
import { useSonosContext } from '@providers/SonosContext';
import { ipcService } from '@components/providers/ipcService';
import { IArtistEntity } from '@components/result-types/artistEntity';

interface ArtistViewProps {
    artist: IArtistEntity;
    onBack?: (album?: IAlbumEntity) => void;
}

const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ArtistView: React.FC<ArtistViewProps> = ({ artist, onBack }) => {
    const player = useSonosContext();
    const [albums, setAlbums] = useState<IAlbumEntity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        player.getMetadata(artist.id).then((result) => {
            console.log('Artist Metadata:', artist);
            console.log('Artist Tracks:', result);

            setAlbums(result?.mediaCollection as IAlbumEntity[] || []);
            setLoading(false);
        });

    }, [artist]);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {onBack && (
                <button onClick={() => onBack()} className="mb-4 text-sm text-indigo-400 hover:underline">
                    ← Back to search
                </button>
            )}

            <div className="flex items-start gap-6">
                <img src={artist.albumArtURI} alt={artist.title} className="w-32 h-32 object-cover rounded-lg" />
                <div>
                    <h1 className="text-2xl font-bold text-white">{artist.title}</h1>

                </div>
            </div>

            <div className="grid grid-cols-3 @[1000px]:grid-cols-4 @[1300px]:grid-cols-6 gap-4">
                {albums.map((album) => (
                    <AlbumEntity key={album.id} entity={album} onSelect={() => onBack(album)} />
                ))}
            </div>
        </div>
    );
};

export default ArtistView;
