"use client";
import { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';
import ImageWithFallback from '@components/ImageWithFallback';
import { useSonosActions } from '@components/providers/SonosContext';
import { useEffect, useState } from 'react';
import AlbumView from '@components/Search/AlbumView';
import { useRouter } from 'next/navigation';

export interface IAlbumEntity extends MediaItem {
    artist: string;
    artistId: string;
}

interface Props {
    entity: IAlbumEntity;
    onSelect?: () => void; // Optional onClick handler
}


export default function Page({ params }: { params: { id: string } }) {
    const { id } = params;
    const player = useSonosActions();
    const router = useRouter();
    const [album, setAlbum] = useState<IAlbumEntity | null>(null);


    useEffect(() => {
        if (!id) return;
        const  urlDecoded = decodeURIComponent(id);
        
        player.getItemMetadata(urlDecoded).then((result) => {
            console.log('Album Metadata:', result);
            setAlbum(result?.mediaCollection[0] as IAlbumEntity || null);    
        });
    }, [id]); 


    if (!album) {
        return <div>Loading...</div>;
    }

    return (
        
        <AlbumView album={album} onBack={() => {router.back()}} />
    );
}

