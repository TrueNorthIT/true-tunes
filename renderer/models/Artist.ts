
export interface TN_ArtistRef {
    id: string;
    name: string;
}
export interface TN_Artist extends TN_ArtistRef {
    type: "artist";
    artURI: string;
    heroArtURI: string;
}