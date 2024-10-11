import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../providers/authProvider'; // Import the Auth context
import Image from 'next/image';

const UserMenu: React.FC = () => {
    const { userDetails, login, logout } = useAuth(); // Access login, logout, and account from the Auth context

    const userNavigation = [
        { name: 'Your Profile', href: '#' }, // Placeholder for profile navigation
        { name: 'Sign out', href: '#', onClick: logout }, // Trigger logout on sign out
    ];

    return (
        <Menu as="div" className="relative">
            {userDetails ? (
                <>
                    <MenuButton className="-m-1.5 flex items-center p-1.5">
                        <span className="sr-only">Open user menu</span>
                        {userDetails.profilePicture ? (
                                <Image
                                    src={userDetails.profilePicture}
                                    alt="User profile"
                                    width={32}    // Set desired width
                                    height={32}   // Set desired height
                                    className="rounded-full bg-gray-50"
                            
                                />)
                            : (<Image
                                src="/images/truenorth_logo.png" 
                                alt="User profile"
                                width={32}    // Set desired width
                                height={32}   // Set desired height
                                className="rounded-full bg-gray-50"
                            />)
                        }
                        <span className="hidden lg:flex lg:items-center">
                            <span aria-hidden="true" className="ml-4 text-sm font-semibold leading-6 text-gray-900">
                                {userDetails.name || 'User'}
                            </span>
                            <ChevronDownIcon aria-hidden="true" className="ml-2 h-5 w-5 text-gray-400" />
                        </span>
                    </MenuButton>
                    <MenuItems className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                        {userNavigation.map((item) => (
                            <MenuItem key={item.name}>
                                {({ focus }) => (
                                    <a
                                        href={item.href}
                                        onClick={item.onClick} // Handle logout
                                        className={`block px-3 py-1 text-sm leading-6 ${focus ? 'bg-gray-50' : ''} text-gray-900`}
                                    >
                                        {item.name}
                                    </a>
                                )}
                            </MenuItem>
                        ))}
                    </MenuItems>
                </>
            ) : (
                <button
                    onClick={login}
                    className="text-sm font-semibold text-gray-900 bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded"
                >
                    Login
                </button>
            )}
        </Menu>
    );
};

export default UserMenu;
