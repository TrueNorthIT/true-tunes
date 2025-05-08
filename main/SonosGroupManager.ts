import type { SonosDevice} from '@svrooij/sonos';
import { SonosEvents, SonosManager } from '@svrooij/sonos'
import { mainWindow } from './background';
import type { Track } from '@svrooij/sonos/lib/models';
import type { Services } from '../renderer/enums/Services';

enum SonosService {
    Spotify = 9
}

class SonosGroupManager {

    private manager: SonosManager;
    private coordinator: SonosDevice | undefined;

    constructor() {
        this.manager = new SonosManager();
    }

    public ListenToTrackMetadata() {
        this.coordinator.Events.on(SonosEvents.CurrentTrackMetadata, (data: Track) => {
            mainWindow.webContents.send('trackMetadata', data);
        })
    }

    public ListenToVolumeChange() {
        this.coordinator.Events.on(SonosEvents.Volume, (data: number) => {
            mainWindow.webContents.send('volume', data);
        })
    }

    public ListenToPlayPause() {
        this.coordinator.Events.on(SonosEvents.PlaybackStopped, () => {
            mainWindow.webContents.send('playbackState');
        })
    }

    public ListenToMute() {
        this.coordinator.Events.on(SonosEvents.Mute, (data: boolean) => {
            mainWindow.webContents.send('mute', data);
        })
    }
    

    public async ConnectToServices() {
        try{
            let spotify = await this.coordinator?.MusicServicesClient(SonosService.Spotify);
            const link = await spotify.GetLoginLink();
            console.log('Link URL: ', link.regUrl, ' Enter code: ', link.linkCode);
            const credentials = await spotify.GetDeviceAuthToken(link.linkCode);
            spotify = await this.coordinator?.MusicServicesClient(SonosService.Spotify, credentials);
        
            console.log(spotify);
        }catch(e) {
            console.log(e);
        }

    }

    public async Connect(groupName?: string) {
        // try {
        //     const connected = await this.manager.InitializeWithDiscovery(20);
        //     if (!connected) {
        //         throw new Error('No Sonos devices found');
        //     }
        // }catch(e) {
        await this.manager.InitializeFromDevice(process.env.SONOS_HOST || '192.168.1.10');
        // }
        
        if (groupName) this.coordinator = this.manager.Devices.find(d => d.GroupName === groupName)?.Coordinator;
        else this.coordinator = this.manager.Devices.find(d => d.Coordinator)?.Coordinator;
        if (!this.coordinator) {
            throw new Error('Coordinator not found');
        }

        this.ListenToTrackMetadata();
        this.ListenToVolumeChange();
        this.ListenToPlayPause();
        this.ListenToMute();
    }

    public async Search(term: string, searchType: string, service: Services, resultCount: number, skip: number = 0) {
        if (this.coordinator) {
            const musicService = await this.coordinator.MusicServicesClient(service);
            try{
                const result = await musicService.Search({ id: searchType, term, index: skip, count: resultCount });
                return result;
            }catch(e) {
                console.log(e);
            }
            
        }
    }

    public async GetQueue() {
        if (this.coordinator) {
            const queue = await this.coordinator.GetQueue();
            return queue;
        }
    }

    public async GetConnectionStatus() {
        if (this.coordinator) {
            return this.coordinator.GetZoneGroupState();
        }
    }

    public async GetRootPage(service: Services) {
        if (this.coordinator) {
            const musicService = await this.coordinator.MusicServicesClient(service);
            const result = await musicService.GetMetadata({ id: 'root', index: 0, count: 15, recursive: true });
            return result;
        }
    }

    public async GetItemMetadata(service: Services, id: string) {
        if (this.coordinator) {
            const musicService = await this.coordinator.MusicServicesClient(service);
            const result = await musicService.GetExtendedMetadata({ id});
            return result;
        }
    }

    public async GetMetadata(service: Services, id: string) {
        if (this.coordinator) {
            const musicService = await this.coordinator.MusicServicesClient(service);
            const result = await musicService.GetMetadata({ id, index: 0, count: 150, recursive: true });
            return result;
        }
    }
    public async TogglePlayback() {
        if (this.coordinator) {
            await this.coordinator.TogglePlayback();
            return 'Toggled';
        }
    }

    public async ToggleMute() {
        if (this.coordinator) {
            await this.coordinator.GroupRenderingControlService.SetGroupMute({ InstanceID: 0, DesiredMute: !(await this.coordinator.GroupRenderingControlService.GetGroupMute()).CurrentMute});
        }
    }

    public async Next() {
        if (this.coordinator) {
            await this.coordinator.Next();
            return 'Next';
        }
    }

    public async Previous() {
        if (this.coordinator) {
            await this.coordinator.Previous();
            return 'Previous';
        }
    }

    public async GetPlaybackState() {
        if (this.coordinator) {
            return this.coordinator.GetState();
        }
    }

    public async GetVolume() {
        if (this.coordinator) {
            return this.coordinator.Volume;
        }
    }

    public async SetVolume(volume: number) {
        if (this.coordinator) {
            await this.coordinator.SetVolume(volume);
            return 'Volume set';
        }
    }

    public async JumpToPointInQueue(index: number) {
        if (this.coordinator) {
            await this.coordinator.SeekTrack(index);
            return 'Jumped';
        }
    }

    public async SeekToPosition(position: string) {
        if (this.coordinator) {
            await this.coordinator.SeekPosition(position);
            return 'Seeked';
        }
    }

    public async AddToQueue(uri: string, index?: number) {
        if (this.coordinator) {
            await this.coordinator.AddUriToQueue(uri, index);
            return 'Added';
        }
    }

    public async PlaySongNow(uri: string) {
        if (this.coordinator) {
            await this.coordinator.SetAVTransportURI(uri);
            await this.coordinator.Play();
            return 'Playing';
        }
    }
    public async ReorderTracksInQueue(startingIndex: number, numberOfTracks: number, insertBefore: number){
        if (this.coordinator) {
            await this.coordinator.AVTransportService.ReorderTracksInQueue({
                InstanceID: 0,
                StartingIndex: startingIndex,
                NumberOfTracks: numberOfTracks,
                InsertBefore: insertBefore,
                UpdateID: 0
            });
            return 'Reordered';
        }
    }

    public async RemoveTrackRangeFromQueue(startingIndex: number, numberOfTracks: number) {
        if (this.coordinator) {
            await this.coordinator.AVTransportService.RemoveTrackRangeFromQueue({InstanceID: 0, UpdateID: null , StartingIndex: startingIndex, NumberOfTracks: numberOfTracks});
            return 'Removed';
        }
    }

}

export { SonosGroupManager, SonosService };