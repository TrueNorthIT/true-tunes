import { Bars3Icon, BellIcon } from '@heroicons/react/24/solid';
import { Dispatch, SetStateAction } from 'react';
import SearchBar from '../SearchBar';
import PlayPauseButton from '../media-controls/PlayPauseButton';
import VolumeSlider from '../media-controls/VolumeSlider';
import UserMenu from './UserMenu';
import BackButton from '../media-controls/BackButton';
import NextButton from '../media-controls/NextButton';
import MuteButton from '../media-controls/MuteButton';
import TrackProgressSlider from '../media-controls/TrackProgress';

interface HeaderProps {
    setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-700 lg:hidden">
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
        </button>

        <div aria-hidden="true" className="h-6 w-px bg-gray-900/10 lg:hidden" />

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <MuteButton />
            <VolumeSlider />
            <BackButton />
            <PlayPauseButton />
            <NextButton />
            <TrackProgressSlider />
    
            <div className="flex items-center gap-x-4 lg:gap-x-6">
                <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                    <span className="sr-only">View notifications</span>
                    <BellIcon aria-hidden="true" className="h-6 w-6" />
                </button>

                <div aria-hidden="true" className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" />

                <UserMenu />
            </div>
        </div>
    </div>
);

export default Header;
