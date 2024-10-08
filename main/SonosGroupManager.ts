import { SonosDevice, SonosEvents, SonosManager } from '@svrooij/sonos'
import { ipcMain, shell, webContents } from 'electron';
import { mainWindow } from './background';

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
        this.coordinator.Events.on(SonosEvents.CurrentTrackMetadata, data => {
            mainWindow.webContents.send('trackMetadata', data);
        })
    }



    public async ConnectToServices() {
        await this.Connect("Office + 1");
        const spotify = await this.coordinator?.MusicServicesClient(SonosService.Spotify);
        if (this.GetQueue() === undefined) {
            const loginLink = await spotify?.GetLoginLink();
            console.log(loginLink?.regUrl);
            shell.openExternal(loginLink?.regUrl!);
            const authToken = await spotify?.GetDeviceAuthToken(loginLink!.linkCode);
            console.log(authToken);
        }

    }

    public async Connect(groupName: string) {
        //await this.manager.InitializeWithDiscovery();
        await this.manager.InitializeFromDevice(process.env.SONOS_HOST || '192.168.1.10');
        this.coordinator = this.manager.Devices.find(d => d.GroupName === groupName)?.Coordinator;
        if (!this.coordinator) {
            throw new Error('Coordinator not found');
        }

        this.ListenToTrackMetadata();
    }

    public async Search(term: string, searchType: string, service: SonosService) {
        if (this.coordinator) {
            const musicService = await this.coordinator.MusicServicesClient(service);
            const result = await musicService.Search({ id: searchType, term, index: 0, count: 15 });
            return result;
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

    public async AddToQueue(uri: string) {
        if (this.coordinator) {
            await this.coordinator.AddUriToQueue
            return 'Added';
        }
    }

}

export { SonosGroupManager, SonosService };