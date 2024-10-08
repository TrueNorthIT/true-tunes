import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthenticationResult } from '@azure/msal-node';

interface AuthContextProps {
    account: AuthenticationResult | null;
    profilePicture: string | null;
    login: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [account, setAccount] = useState<AuthenticationResult | null>(null);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);

    useEffect(() => {
        // Optimistic login to see if we have a token stored

        window.ipc.invoke<AuthenticationResult | null>('auth-login', {optimistic: true}).then((authToken) => {
            if (authToken) {
                setAccount(authToken);  // Set account information
                fetchProfilePicture(authToken.accessToken);  // Fetch and set profile picture
            }
        });
    }, []);

    // Fetch the user's profile picture after logging in
    const fetchProfilePicture = async (accessToken: string) => {
        try {
            const userPhoto = await window.ipc.invoke<string>('get-user-photo', accessToken);
            setProfilePicture(userPhoto);  // Set the profile picture in state
        } catch (error) {
            console.error('Error fetching user profile picture:', error);
        }
    };

    const login = async () => {
        try {
            const authToken = await window.ipc.invoke<AuthenticationResult>('auth-login');
            setAccount(authToken);  // Set account information
            await fetchProfilePicture(authToken.accessToken);  // Fetch and set profile picture
        } catch (error) {
            console.error('Authentication error:', error);
        }
    };

    const logout = () => {
        setAccount(null);
        setProfilePicture(null);  // Clear the profile picture on logout
        window.ipc.invoke('clear-token');  // Clear the stored tokens
    };

    return (
        <AuthContext.Provider value={{ account, profilePicture, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook to use AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
