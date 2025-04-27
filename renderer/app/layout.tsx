"use client";

import { AuthProvider } from '@components/providers/authProvider';
// app/layout.tsx
import '../styles/globals.css';
import { AudioProvider } from '@components/providers/SonosContext';
import { ContextMenuProvider } from '@components/providers/ContextMenuProvider';
import Sidebar from '@components/layout/Sidebar';
import Header from '@components/layout/Header';
import { useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <html lang="en">
            <head>
                <script
                    crossOrigin="anonymous"
                    src="//unpkg.com/react-scan/dist/auto.global.js"
                />
            </head>
            <body style={{ overflow: 'hidden', height: '100vh' }} >

                <AuthProvider>
                    <AudioProvider> {/* Wrap the entire layout in AudioProvider */}
                        <ContextMenuProvider>
                            <div>
                                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                                <div className="lg:pl-20">
                                    <Header setSidebarOpen={setSidebarOpen} />
                                    <main style={{ height: 'calc(100vh - 64px)' }} >{children}</main>
                                </div>
                            </div>
                        </ContextMenuProvider>
                    </AudioProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
