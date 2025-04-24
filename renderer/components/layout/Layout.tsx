import React, { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { AudioProvider } from '../providers/SonosContext';
import MainContent from './MainContent';
import { AuthProvider } from '../providers/authProvider';
import { ContextMenuProvider } from '../providers/ContextMenuProvider';

interface LayoutProps {
    children: ReactNode;
    navigation: {
        name: string;
        href: string;
        current: boolean;
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    }[];
}

const Layout: React.FC<LayoutProps> = ({ children, navigation }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <AuthProvider>
            <AudioProvider> {/* Wrap the entire layout in AudioProvider */}
                <ContextMenuProvider>
                    <div>
                        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} navigation={navigation} />
                        <div className="lg:pl-20">
                            <Header setSidebarOpen={setSidebarOpen} />
                            <MainContent>{children}</MainContent>
                        </div>
                    </div>
                </ContextMenuProvider>
            </AudioProvider>
        </AuthProvider>
    );
};

export default Layout;
