import fetch from 'node-fetch';


interface ArtistArt {
    background: string;
    thumb: string;
}

interface ArtistBasicInfo {
    name: string;
    mbid: string; // MusicBrainz ID
    art: ArtistArt;
}

export interface ArtistDetails extends ArtistBasicInfo {
    listeners: number; // Number of listeners
    playcount: number; // Number of plays
    tags: string[]; // List of tags associated with the artist
    bio: { summary: string; content: string };
    similarartists: ArtistBasicInfo[]; // List of similar artists
}


class MusicAPIService {
    private static readonly LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';
    private static readonly API_KEY = 'e2f2beee226a9d77b00aad0d7d356d4e'; // Replace with your LastFM API key
    private static readonly FANART_API_URL = 'http://webservice.fanart.tv/v3/music/';
    private static readonly FANART_API_KEY = '1d9aa190496735a9a62c207cba9930cc'; // Replace with your FanArt API key

    private static async getArtistPhotoFromFanArtz(mbid: string): Promise<ArtistArt | undefined> {
        const url = this.FANART_API_URL + mbid + '?api_key=' + this.FANART_API_KEY;

        try {
            const res = await fetch(url);
            const out = await res.json();

            return {
                background: (out?.artistbackground?.[0].url || ''),
                thumb: (out?.artistthumb?.[0].url || '')
            }


        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    public static async getBasicArtistInfo(artistName: string): Promise<ArtistBasicInfo> {
        const url = `${this.LASTFM_API_URL}?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${this.API_KEY}&format=json`;
            
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch artist info: ${response.statusText}`);
                }
                const data = await response.json();
    
                if (!data.artist) {
                    throw new Error('Artist not found');
                }
    
                const artist: ArtistBasicInfo = {
                    name: data.artist.name,
                    mbid: data.artist.mbid,
                    art: await this.getArtistPhotoFromFanArtz(data.artist.mbid)
                }
    
                return artist;
            } catch (error) {
                console.error('Error fetching artist info from LastFM:', error);
                throw error;
            }
        }

    public static async getArtistDetails(artistName: string): Promise<any> {
        const url = `${this.LASTFM_API_URL}?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${this.API_KEY}&format=json`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch artist details: ${response.statusText}`);
            }
            const data = await response.json();

            if (!data.artist) {
                throw new Error('Artist not found');
            }

            const similarArtists = await Promise.all(
                data.artist.similar.artist.map((artist: any) =>
                    this.getBasicArtistInfo(artist.name)
                )
            );
            
            const artist: ArtistDetails = {
                name: data.artist.name,
                mbid: data.artist.mbid,
                art: await this.getArtistPhotoFromFanArtz(data.artist.mbid),
                listeners: parseInt(data.artist.stats.listeners, 10),
                playcount: parseInt(data.artist.stats.playcount, 10),
                tags: data.artist.tags.tag.map((tag: any) => tag.name),
                bio: {
                    summary: data.artist.bio.summary,
                    content: data.artist.bio.content
                },
                similarartists: similarArtists
            }

            return artist;
        } catch (error) {
            console.error('Error fetching artist details from LastFM:', error);
            throw error;
        }
    }
}


export { MusicAPIService };