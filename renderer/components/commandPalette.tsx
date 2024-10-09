import { useState, useEffect } from 'react'
import {
    Combobox,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
    Dialog,
    DialogPanel,
    DialogBackdrop,
} from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { DocumentPlusIcon, SpeakerXMarkIcon, HashtagIcon, TagIcon, PlayPauseIcon } from '@heroicons/react/24/outline'
import { useSonosContext } from './providers/SonosContext'



export default function Example() {
    const [query, setQuery] = useState('')
    const [open, setOpen] = useState(false) // Dialog starts closed by default

    const player = useSonosContext()

    const quickActions = [
        {
            name: 'Toggle Play / Pause...',
            icon: PlayPauseIcon,
            shortcut: 'Space',
            url: '#',
            action: () => player.togglePlayback(),
        },
        {
            name: 'Toggle Mute...',
            icon: SpeakerXMarkIcon,
            shortcut: 'M',
            url: '#',
            action: () => player.toggleMute(),
        },
        {
            name: 'Skip to Next track...',
            icon: HashtagIcon,
            shortcut: 'F',
            url: '#',
            action: () => player.next(),
        },
        {
            name: 'Skip to Previous track...',
            icon: TagIcon,
            shortcut: 'B',
            url: '#',
            action: () => player.previous(),
        },
    ]

    // Filter the quick actions based on the search query
    const filteredActions =
        query === ''
            ? quickActions
            : quickActions.filter((action) =>
                action.name.toLowerCase().includes(query.toLowerCase())
            )

    // Effect to handle key binding for Ctrl + Shift + P to open the command bar
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'p') {
                event.preventDefault()
                setOpen((prevOpen) => !prevOpen) // Toggle the dialog visibility
            }
        }

        // Attach the event listener for opening the command bar
        window.addEventListener('keydown', handleKeyDown)

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    // Effect to dynamically bind the quick action shortcuts to their functions
    useEffect(() => {
        const handleActionShortcut = (event: KeyboardEvent) => {
            quickActions.forEach((action) => {
                if (event.key.toUpperCase() === action.shortcut.toUpperCase() && event.ctrlKey) {
                    event.preventDefault()
                    action.action() // Trigger the associated action
                }
                if (event.key === " " && action.shortcut === "Space" && event.ctrlKey) {
                    event.preventDefault()
                    action.action()
                }
            })
        }

        // Attach the event listener for action shortcuts
        window.addEventListener('keydown', handleActionShortcut)

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleActionShortcut)
        }
    }, [])

    const handleClose = () => {
        setTimeout(() => {
            setOpen(false)
            setQuery('') // Clear query when closing
        }, 200)
    }

    return (
        <Dialog
            className="relative z-10"
            open={open}
            onClose={handleClose}
        >
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
                <DialogPanel
                    transition
                    className="mx-auto max-w-2xl transform divide-y divide-gray-500 divide-opacity-20 overflow-hidden rounded-xl bg-gray-900 shadow-2xl transition-all data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                >
                    <Combobox
                        onChange={(item) => {
                            if (item) {
                                (item as any).action() // Trigger the action of the selected item
                                setOpen(false) // Close the dialog after selecting an action
                            }
                        }}
                    >
                        <div className="relative">
                            <MagnifyingGlassIcon
                                className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-500"
                                aria-hidden="true"
                            />
                            <ComboboxInput
                                autoFocus
                                className="h-12 w-full border-0 bg-white text-black pl-11 pr-4 focus:ring-0 sm:text-sm"
                                placeholder="Search actions..."
                                onChange={(event) => setQuery(event.target.value)}
                            />
                        </div>

                        {(query === '' || filteredActions.length > 0) && (
                            <ComboboxOptions
                                static
                                as="ul"
                                className="max-h-80 scroll-py-2 divide-y divide-gray-500 divide-opacity-20 overflow-y-auto"
                            >
                                <li className="p-2">
                                    <ul className="text-sm text-gray-400">
                                        {filteredActions.map((action) => (
                                            <ComboboxOption
                                                key={action.shortcut}
                                                value={action}
                                                className="group flex cursor-default select-none items-center rounded-md px-3 py-2 data-[focus]:bg-gray-800 data-[focus]:text-white"
                                            >
                                                <action.icon
                                                    className="h-6 w-6 flex-none text-gray-500 group-data-[focus]:text-white"
                                                    aria-hidden="true"
                                                />
                                                <span className="ml-3 flex-auto truncate">{action.name}</span>
                                                <span className="ml-3 flex-none text-xs font-semibold text-gray-400">
                                                    <kbd className="font-sans">⌘</kbd>
                                                    <kbd className="font-sans">{action.shortcut}</kbd>
                                                </span>
                                            </ComboboxOption>
                                        ))}
                                    </ul>
                                </li>
                            </ComboboxOptions>
                        )}

                        {query !== '' && filteredActions.length === 0 && (
                            <div className="px-6 py-14 text-center sm:px-14">
                                <DocumentPlusIcon className="mx-auto h-6 w-6 text-gray-500" aria-hidden="true" />
                                <p className="mt-4 text-sm text-gray-200">
                                    No actions found for that search term. Please try again.
                                </p>
                            </div>
                        )}
                    </Combobox>
                </DialogPanel>
            </div>
        </Dialog>
    )
}
