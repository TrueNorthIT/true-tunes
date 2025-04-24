import { Services } from "../renderer/enums/Services";

export default interface ISonosGroupManager {
    Connect(groupName: string): Promise<void>;
    ConnectToServices(): Promise<void>;

    ListenToTrackMetadata(): void;
    ListenToVolumeChange(): void;
    ListenToPlayPause(): void;
    ListenToMute(): void;

    Search(term: string, searchType: string, service: Services, resultCount: number): Promise<any>;

    GetQueue(): Promise<any>;
    GetConnectionStatus(): Promise<any>;
    GetRootPage(service: Services): Promise<any>;
    GetMetadata(service: Services, id: string): Promise<any>;

    TogglePlayback(): Promise<string | undefined>;
    ToggleMute(): Promise<void>;

    Next(): Promise<string | undefined>;
    Previous(): Promise<string | undefined>;
    GetPlaybackState(): Promise<any>;
    GetVolume(): Promise<number | undefined>;
    SetVolume(volume: number): Promise<string | undefined>;

    JumpToPointInQueue(index: number): Promise<string | undefined>;
    SeekToPosition(position: string): Promise<string | undefined>;

    AddToQueue(uri: string, index?: number): Promise<string | undefined>;
    PlaySongNow(uri: string): Promise<string | undefined>;

    ReorderTracksInQueue(
        startingIndex: number,
        numberOfTracks: number,
        insertBefore: number
    ): Promise<string | undefined>;
}
