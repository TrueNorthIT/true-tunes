import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

const userNavigation = [
    { name: 'Your Profile', href: '#' },
    { name: 'Sign out', href: '#' },
];

const UserMenu: React.FC = () => (
    <Menu as="div" className="relative">
        <MenuButton className="-m-1.5 flex items-center p-1.5">
            <span className="sr-only">Open user menu</span>
            <img
                alt="User profile"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                className="h-8 w-8 rounded-full bg-gray-50"
            />
            <span className="hidden lg:flex lg:items-center">
                <span aria-hidden="true" className="ml-4 text-sm font-semibold leading-6 text-gray-900">Tom Cook</span>
                <ChevronDownIcon aria-hidden="true" className="ml-2 h-5 w-5 text-gray-400" />
            </span>
        </MenuButton>
        <MenuItems className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
            {userNavigation.map((item) => (
                <MenuItem key={item.name}>
                    {({ focus }) => (
                        <a
                            href={item.href}
                            className={`block px-3 py-1 text-sm leading-6 ${focus ? 'bg-gray-50' : ''}`}
                        >
                            {item.name}
                        </a>
                    )}
                </MenuItem>
            ))}
        </MenuItems>
    </Menu>
);

export default UserMenu;
