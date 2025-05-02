"use client";
import { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';
import ImageWithFallback from '@components/ImageWithFallback';
import { useSonosActions } from '@components/providers/SonosContext';
import { useEffect, useState } from 'react';
import AlbumView from '@components/Search/AlbumView';
import { useRouter } from 'next/navigation';
import { IArtistEntity } from '@components/result-types/artistEntity';
import ArtistView from '@components/Search/ArtistView';



export default function Page({ params }: { params: { id: string } }) {
    const { id } = params;
    const player = useSonosActions();
    const router = useRouter();
    const [artist, setArtist] = useState<IArtistEntity | null>(null);


    useEffect(() => {
        if (!id) return;
        const  urlDecoded = decodeURIComponent(id);
        
        player.getItemMetadata(urlDecoded).then((result) => {
            console.log('Artist Metadata:', result);
            setArtist(result?.mediaCollection?.[0] as IArtistEntity || null);    
        });
    }, [id]); 


    if (!artist) {
        return <div>Loading...</div>;
    }

    return (
        
        <ArtistView artist={artist} onBack={() => {router.back()}} />
    );
}

