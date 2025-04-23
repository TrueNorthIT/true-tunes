import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthenticationResult } from '@azure/msal-node';

interface AuthContextProps {
    userDetails: UserDetails | null;
    login: () => Promise<void>;
    logout: () => void;
}

interface UserDetails {
    name: string;
    email: string;
    profilePicture: string;
}


const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

    useEffect(() => {
        // Optimistic login to see if we have a token stored

        window.ipc.invoke<UserDetails | null>('auth-login', {optimistic: true}).then((userDetails) => {
            if (userDetails) {
                setUserDetails(userDetails);  // Set account information
            }
        });
    }, []);


    const login = async () => {
        try {
            const authToken = await window.ipc.invoke<UserDetails>('auth-login');
            setUserDetails(authToken);  // Set account information
        } catch (error) {
            console.error('Authentication error:', error);
        }
    };

    const logout = () => {
        setUserDetails(null);
        window.ipc.invoke('clear-token');  // Clear the stored tokens
    };

    return (
        <AuthContext.Provider value={{ userDetails, login, logout }}>
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
