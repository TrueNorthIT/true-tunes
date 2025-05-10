"use client";
import React from "react";
import { useEffect, useState } from 'react';
import ArtistView from '@components/Search/ArtistView';
import { useSonosActions } from '@components/providers/SonosContext';
import type { TN_Artist } from "@models/Artist";



export default function Page({ params }: { params: { id: string } }) {
    const { id } = params;
    const player = useSonosActions();
    const [artist, setArtist] = useState<TN_Artist | null>(null);


    useEffect(() => {
        if (!id) return;
        const urlDecoded = decodeURIComponent(id);

        player.getArtist(urlDecoded).then((result) => {
            console.log('Artist:', result);
            setArtist(result);
        });


    }, [id, player]);


    if (!artist) {
        return <div>Loading...</div>;
    }

    return (

        <ArtistView artist={artist} />
    );
}

