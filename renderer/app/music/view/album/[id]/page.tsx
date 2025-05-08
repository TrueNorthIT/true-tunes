"use client";
import React from "react";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AlbumView from '@components/Search/AlbumView';
import { useSonosActions } from '@components/providers/SonosContext';
import type { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';

export interface IAlbumEntity extends MediaItem {
    artist: string;
    artistId: string;
}


export default function Page({ params }: { params: { id: string } }) {
    const { id } = params;
    const player = useSonosActions();
    const router = useRouter();
    const [album, setAlbum] = useState<IAlbumEntity | null>(null);


    useEffect(() => {
        if (!id) return;
        const urlDecoded = decodeURIComponent(id);

        player.getItemMetadata(urlDecoded).then((result) => {
            console.log('Album Metadata:', result);
            setAlbum(result?.mediaCollection[0] as IAlbumEntity || null);
        });
    }, [id, player]);


    if (!album) {
        return <div>Loading...</div>;
    }

    return (

        <AlbumView album={album} onBack={() => { router.back() }} />
    );
}

