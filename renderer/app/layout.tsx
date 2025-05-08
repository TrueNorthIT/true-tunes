"use client";
import '../styles/globals.css';
import React, { useState } from 'react';
import Header from '@components/layout/Header';
import Sidebar from '@components/layout/Sidebar';
import { AuthProvider } from '@components/providers/authProvider';
import { AudioProvider } from '@components/providers/SonosContext';
import { ContextMenuProvider } from '@components/providers/ContextMenuProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [queryClient] = React.useState(() => new QueryClient());
    return (
        <html lang="en">
            <head>
                <script
                    crossOrigin="anonymous"
                    src="//unpkg.com/react-scan/dist/auto.global.js"
                />
            </head>
            <body style={{ overflow: 'hidden', height: '100vh' }} >
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <AudioProvider> 
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
                </QueryClientProvider>
            </body>
        </html>
    );
}
