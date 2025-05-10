"use client";
import { ipcService } from "@components/providers/ipcService";
import { decode } from "html-entities";
import React, { useEffect } from "react";


export default function Page({ params }: { params: { artist: string, track: string } }) {
    const { artist, track } = params;

    const [lyrics, setLyrics] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        setLoading(true);
        console.log("Fetching lyrics for:", artist, track);

        ipcService.getLyrics(artist, track).then((l) => {
            setLyrics(l);
            setLoading(false);
        });



    }, [artist, track]);

    if (loading) {
        return (
            <section className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
            </section>
        );
    }

    return (
        <section >
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-6xl font-bold mb-4">{decodeURI(track)}</h1>
                <h2 className="text-3xl text-gray-600 mb-4">{decodeURI(artist)}</h2>
                <div className="prose prose-lg max-w-none text-4xl text-center" style={{ lineHeight: '3.5rem' }}>
                    {lyrics ? (
                        <div dangerouslySetInnerHTML={{ __html: decode(lyrics).replaceAll("\n\n", "<br>") }} />
                    ) : (
                        <p>No lyrics found.</p>
                    )}
                </div>
            </div>
        </section>
    );
}
