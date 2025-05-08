"use client";
import React from "react";
import '../../styles/globals.css';
import type { ReactNode } from "react";
import QueueAside from "@components/Queue/QueueAside";
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import SearchContainer from '@components/Search/SearchContainer';
import { AsideBreakpointProvider } from "@providers/AsideBreakpointContext";


export default function MusicLayout({ children }: { children: ReactNode }) {

    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: {
            delay: 100,
            tolerance: 0,
        },
    });
    const sensors = useSensors(pointerSensor);

    return (
        <AsideBreakpointProvider>
            <div className="flex h-full overflow-y-hidden">
                <DndContext
                    collisionDetection={closestCenter}
                    sensors={sensors}
                >
                    <QueueAside />
                    <div className='flex-1 min-h-0 overflow-y-auto px-4 py-10 sm:px-6 lg:px-8 lg:py-6 relative w-full pl-0'>
                        <SearchContainer>
                            {children}
                        </SearchContainer>

                    </div>
                </DndContext>


            </div>
        </AsideBreakpointProvider>
    );
}
