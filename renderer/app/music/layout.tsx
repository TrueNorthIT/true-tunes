"use client";
import '../../styles/globals.css';

// pages/music/layout.tsx
import { AsideBreakpointProvider } from "@providers/AsideBreakpointContext";
import QueueAside from "@components/Queue/QueueAside";
import type { ReactNode } from "react";
import SearchContainer from '@components/Search/SearchContainer';
import SearchBar from '@components/Search/SearchBar';

export default function MusicLayout({ children }: { children: ReactNode }) {
    return (
        <AsideBreakpointProvider>
            <div className="flex h-full overflow-y-hidden">
                <QueueAside />
                <div className='flex-1 min-h-0 overflow-y-auto px-4 py-10 sm:px-6 lg:px-8 lg:py-6 relative w-full pl-0'>
                    <SearchContainer children={children} />
                    
                </div>
            </div>
        </AsideBreakpointProvider>
    );
}
