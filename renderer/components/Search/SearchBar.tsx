import { ArrowTurnLeftDownIcon, ArrowUturnLeftIcon, BackwardIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation'

const SearchBar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname()
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const query = (event.target as HTMLInputElement).value;

            const currentRoute = pathname.split('/')[3]
            if (!query) router.push(`/music`)
            if (['track', 'album', 'artist'].includes(currentRoute)) {
                router.push(`/music/search/${currentRoute}/${query}`)
            }else {
                router.push(`/music/search/all/${query}`)
            }

        }
    };

    return (
        <div className="flex flex-row  space-x-4">
            <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={() => router.back()}
            >
                <ArrowUturnLeftIcon className="h-5 w-5 mr-2" aria-hidden="true" />
            </button>
            <form className="relative flex flex-1 ">

                <label htmlFor="search-field" className="sr-only">Search</label>
                <MagnifyingGlassIcon className="pointer-events-none absolute inset-y-0 left-2 h-full w-5 text-gray-400" />
                <input
                    id="search-field"
                    name="search"
                    type="search"
                    placeholder="Search..."
                    className="block h-full w-full border-0 p-4 pl-8 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm rounded-md mr-"
                    onKeyDown={handleKeyDown}
                />


            </form>
        </div>
    );
};


export default SearchBar;
