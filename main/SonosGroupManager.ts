import type { SonosDevice } from '@svrooij/sonos';
import { SonosEvents, SonosManager } from '@svrooij/sonos'
import type { SmapiClient } from '@svrooij/sonos/lib/musicservices/smapi-client';
import { mainWindow } from './background';
import type { Track } from '@svrooij/sonos/lib/models';
import type { Services } from '../renderer/enums/Services';

enum SonosService {
    Spotify = 9
}

class SonosGroupManager {

    private manager: SonosManager;
    private coordinator: SonosDevice | undefined;
    private serviceClients = new Map<number, SmapiClient>();
    private serviceAuth = new Map<number, { authToken: string; key: string }>();

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


    private async getMusicServiceClient(serviceId: number) {
        if (!this.coordinator) return undefined;
        if (this.serviceClients.has(serviceId)) {
            return this.serviceClients.get(serviceId);
        }
        const auth = this.serviceAuth.get(serviceId);
        const musicService = await this.coordinator.MusicServicesClient(serviceId, auth);
        this.serviceClients.set(serviceId, musicService);
        return musicService;
    }

    private async authenticateService(serviceId: number) {
        if (!this.coordinator) return undefined;
        const musicService = await this.coordinator.MusicServicesClient(serviceId);
        const link = await musicService.GetLoginLink();
        console.log('Link URL: ', link.regUrl, ' Enter code: ', link.linkCode);
        const credentials = await musicService.GetDeviceAuthToken(link.linkCode);
        this.serviceAuth.set(serviceId, {
            authToken: credentials.authToken,
            key: credentials.privateKey
        });
        const authenticatedService = await this.coordinator.MusicServicesClient(serviceId, {
            authToken: credentials.authToken,
            key: credentials.privateKey
        });
        this.serviceClients.set(serviceId, authenticatedService);
        return authenticatedService;
    }

    private isNoAuthTokenError(error: unknown): boolean {
        if (!error) return false;
        if (error instanceof Error && error.message.toLowerCase().includes('no auth token')) {
            return true;
        }
        if (typeof error !== 'object') return false;
        const fault = (error as { Fault?: { detail?: { ExceptionInfo?: string } } }).Fault;
        const exceptionInfo = fault?.detail?.ExceptionInfo;
        return typeof exceptionInfo === 'string' && exceptionInfo.toLowerCase().includes('no auth token');
    }

    public async ConnectToServices() {
        try {
            const spotify = await this.authenticateService(SonosService.Spotify);
            console.log(spotify);
        } catch (e) {
            console.log(e);
        }

    }

    public async Connect(ipAddress?: string) {
        try {

            let success: boolean
            if (ipAddress !== undefined) {
                success = await this.manager.InitializeFromDevice(ipAddress);
            } else {
                success = await this.manager.InitializeWithDiscovery();
            }
            success = success && this.manager.Devices.length > 0;
            if (!success) return false;
            this.coordinator = this.manager.Devices.find(d => d.Coordinator)?.Coordinator;
            if (!this.coordinator) {
                throw new Error('Coordinator not found');
            }
    
            this.ListenToTrackMetadata();
            this.ListenToVolumeChange();
            this.ListenToPlayPause();
            this.ListenToMute();
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    public async Search(term: string, searchType: string, service: Services, resultCount: number, skip: number = 0) {
        if (this.coordinator) {
            const musicService = await this.getMusicServiceClient(service);
            try {
                const result = await musicService.Search({ id: searchType, term, index: skip, count: resultCount });
                return result;
            } catch (e) {
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
            const musicService = await this.getMusicServiceClient(service);
            const result = await musicService.GetMetadata({ id: 'root', index: 0, count: 15, recursive: true });
            return result;
        }
    }

    public async GetItemMetadata(service: Services, id: string) {
        if (this.coordinator) {
            const musicService = await this.getMusicServiceClient(service);
            try {
                const result = await musicService.GetExtendedMetadata({ id });
                return result;
            } catch (e) {
                if (this.isNoAuthTokenError(e)) {
                    const authenticatedService = await this.authenticateService(service);
                    if (authenticatedService) {
                        return authenticatedService.GetExtendedMetadata({ id });
                    }
                }
                console.log(e);
            }
        }
    }

    public async GetMetadata(service: Services, id: string, skip: number = 0, count: number = 15) {
        if (this.coordinator) {
            const musicService = await this.getMusicServiceClient(service);
            const result = await musicService.GetMetadata({ id, index: skip, count, recursive: true });
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
            await this.coordinator.GroupRenderingControlService.SetGroupMute({ InstanceID: 0, DesiredMute: !(await this.coordinator.GroupRenderingControlService.GetGroupMute()).CurrentMute });
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
            const stopped = this.coordinator.CurrentTransportState === "STOPPED";
            if (stopped) await this.coordinator.SwitchToQueue();
            await this.coordinator.SeekTrack(index);
            if (stopped) await this.coordinator.Play(); 
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
    public async ReorderTracksInQueue(startingIndex: number, numberOfTracks: number, insertBefore: number) {
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
            await this.coordinator.AVTransportService.RemoveTrackRangeFromQueue({ InstanceID: 0, UpdateID: null, StartingIndex: startingIndex, NumberOfTracks: numberOfTracks });
            return 'Removed';
        }
    }

}

export { SonosGroupManager, SonosService };
