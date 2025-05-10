import type { TN_AlbumRef } from "./Album";
import type { TN_ArtistRef } from "./Artist";

export interface TN_TrackRef {
    id: string;
    title: string;
}
export interface TN_Track extends TN_TrackRef {
    type: "track";
    artist: TN_ArtistRef;
    album: TN_AlbumRef;
    artURI: string;
    duration: string;
    explicit: boolean;    
}