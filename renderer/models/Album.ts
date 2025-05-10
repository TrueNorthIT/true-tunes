import type { TN_ArtistRef } from "./Artist";
import type { TN_TrackRef } from "./Track";

export interface TN_AlbumRef{ id: string; name: string; }
export interface TN_Album extends TN_AlbumRef {
    type: "album";
    artist: TN_ArtistRef;
    artURI: string;
    trackCount: number;
    duration: string;
    trackList: TN_TrackRef[];    
}