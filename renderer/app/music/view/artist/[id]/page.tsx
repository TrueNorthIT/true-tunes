"use client";
import React from "react";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArtistView from '@components/Search/ArtistView';
import { useSonosActions } from '@components/providers/SonosContext';
import type { IArtistEntity } from '@components/result-types/artistEntity';



export default function Page({ params }: { params: { id: string } }) {
    const { id } = params;
    const player = useSonosActions();
    const router = useRouter();
    const [artist, setArtist] = useState<IArtistEntity | null>(null);


    useEffect(() => {
        if (!id) return;
        const urlDecoded = decodeURIComponent(id);

        player.getItemMetadata(urlDecoded).then((result) => {
            console.log('Artist Metadata:', result);
            setArtist(result?.mediaCollection?.[0] as IArtistEntity || null);
        });
    }, [id, player]);


    if (!artist) {
        return <div>Loading...</div>;
    }

    return (

        <ArtistView artist={artist} onBack={() => { router.back() }} />
    );
}

