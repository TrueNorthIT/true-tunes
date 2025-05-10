"use client";
import React from "react";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AlbumView from '@components/Search/AlbumView';
import { useSonosActions } from '@components/providers/SonosContext';
import type { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';
import type { TN_Album } from "@models/Album";

export interface IAlbumEntity extends MediaItem {
    artist: string;
    artistId: string;
}


export default function Page({ params }: { params: { id: string } }) {
    const { id } = params;
    const player = useSonosActions();
    const router = useRouter();
    const [album, setAlbum] = useState<TN_Album | null>(null);


    useEffect(() => {
        if (!id) return;
        const urlDecoded = decodeURIComponent(id);

        player.getAlbum(urlDecoded).then((result) => {
            setAlbum(result);
        });


    }, [id, player]);


    if (!album) {
        return <div>Loading...</div>;
    }

    return (

        <AlbumView album={album} onBack={() => { router.back() }} />
    );
}

