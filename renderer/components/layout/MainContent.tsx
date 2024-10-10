import { ReactNode } from 'react';

interface MainContentProps {
    children: ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => (
    <main>
        {children}
    </main>
);

export default MainContent;
