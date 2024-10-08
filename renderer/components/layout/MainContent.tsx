import { ReactNode } from 'react';

interface MainContentProps {
    children: ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => (
    <main className="xl:pl-96">
        {children}
    </main>
);

export default MainContent;
