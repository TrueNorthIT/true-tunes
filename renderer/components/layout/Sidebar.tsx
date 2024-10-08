import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { Dispatch, SetStateAction } from 'react';
import truenorth_logo from "../../public/images/truenorth_logo.png";
import Link from 'next/link';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: Dispatch<SetStateAction<boolean>>;
    navigation: {
        name: string;
        href: string;
        current: boolean;
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    }[];
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, navigation }) => (
    <>
        {/* Toggleable Sidebar for Small and Medium Screens */}
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
            />
            <div className="fixed inset-0 flex">
                <DialogPanel
                    transition
                    className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
                >
                    <TransitionChild>
                        <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                            <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                                <span className="sr-only">Close sidebar</span>
                                <XMarkIcon aria-hidden="true" className="h-6 w-6 text-white" />
                            </button>
                        </div>
                    </TransitionChild>
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10">
                        <div className="flex h-16 shrink-0 items-center">
                            <Image
                                alt="TrueNorthIT logo"
                                src={truenorth_logo}
                                className="h-8 w-auto"
                            />
                        </div>
                        <nav className="flex flex-1 flex-col">
                            <ul role="list" className="-mx-2 flex-1 space-y-1">
                                {navigation.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={`group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 ${item.current ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                }`}
                                        >
                                            <item.icon aria-hidden="true" className="h-6 w-6 shrink-0" />
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>

        {/* Static Sidebar for Large Screens */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-20 lg:overflow-y-auto lg:bg-gray-900 lg:pb-4">
            <div className="flex h-16 shrink-0 items-center justify-center">
                <Image
                    alt="TrueNorthIT logo"
                    src={truenorth_logo}
                    className="h-8 w-auto"
                />
            </div>
            <nav className="mt-8">
                <ul role="list" className="flex flex-col items-center space-y-1">
                    {navigation.map((item) => (
                        <li key={item.name}>
                            <Link
                                href={item.href}
                                className={`group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 ${item.current ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <item.icon aria-hidden="true" className="h-6 w-6 shrink-0" />
                                <span className="sr-only">{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    </>
);

export default Sidebar;
