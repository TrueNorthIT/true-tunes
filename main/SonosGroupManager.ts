import { SonosDevice, SonosEvents, SonosManager } from '@svrooij/sonos'
import { ipcMain, shell, webContents } from 'electron';
import { mainWindow } from './background';
import { Track } from '@svrooij/sonos/lib/models';

enum SonosService {
    Spotify = 9
}

class SonosGroupManager {

    private manager: SonosManager;
    private coordinator: SonosDevice | undefined;

    constructor() {
        this.manager = new SonosManager();
    }

    private ListenToTrackMetadata() {
        this.coordinator.Events.on(SonosEvents.CurrentTrackMetadata, (data: Track) => {
            mainWindow.webContents.send('trackMetadata', data);
        })
    }

    private ListenToVolumeChange() {
        this.coordinator.Events.on(SonosEvents.Volume, (data: number) => {
            mainWindow.webContents.send('volume', data);
        })
    }

    private ListenToPlayPause() {
        this.coordinator.Events.on(SonosEvents.PlaybackStopped, () => {
            mainWindow.webContents.send('playbackState');
        })
    }

    private ListenToMute() {
        this.coordinator.Events.on(SonosEvents.Mute, (data: boolean) => {
            mainWindow.webContents.send('mute', data);
        })
    }
    

    public async ConnectToServices() {
        try{
            const spotify = await this.coordinator?.MusicServicesClient(SonosService.Spotify);
            console.log(spotify);
        }catch(e) {
            console.log(e);
        }

    }

    public async Connect(groupName: string) {
        try {
            await this.manager.InitializeWithDiscovery(2);
        }catch(e) {
            await this.manager.InitializeFromDevice(process.env.SONOS_HOST || '192.168.1.15');
        }
        
        this.coordinator = this.manager.Devices.find(d => d.GroupName === groupName)?.Coordinator;
        if (!this.coordinator) {
            throw new Error('Coordinator not found');
        }

        this.ListenToTrackMetadata();
        this.ListenToVolumeChange();
        this.ListenToPlayPause();
        this.ListenToMute();
    }

    public async Search(term: string, searchType: string, service: SonosService, resultCount: number) {
        if (this.coordinator) {
            const musicService = await this.coordinator.MusicServicesClient(service);
            try{
                const result = await musicService.Search({ id: searchType, term, index: 0, count: resultCount });
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

    public async GetRootPage(service: SonosService) {
        if (this.coordinator) {
            const musicService = await this.coordinator.MusicServicesClient(service);
            const result = await musicService.GetMetadata({ id: 'root', index: 0, count: 15, recursive: true });
            return result;
        }
    }

    public async GetMetadata(service: SonosService, id: string) {
        if (this.coordinator) {
            const musicService = await this.coordinator.MusicServicesClient(service);
            const result = await musicService.GetMetadata({ id, index: 0, count: 15, recursive: true });
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

    public async AddToQueue(uri: string) {
        if (this.coordinator) {
            await this.coordinator.AddUriToQueue(uri);
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

}

export { SonosGroupManager, SonosService };