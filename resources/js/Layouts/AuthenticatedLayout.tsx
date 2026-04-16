import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <nav className="border-b border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="relative inline-flex items-center justify-center rounded-full p-2 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-300"
                                        >
                                            <Bell className="h-5 w-5" />
                                            {(usePage().props.auth.notifications?.unread_count ?? 0) > 0 && (
                                                <span className="absolute top-0 right-0 inline-flex items-center justify-center rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold leading-none text-white animate-pulse">
                                                    {usePage().props.auth.notifications?.unread_count}
                                                </span>
                                            )}
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content align="right">
                                        {(() => {
                                            const notifications = usePage().props.auth.notifications;
                                            return (
                                                <>
                                                    <div className="w-80 max-h-96 overflow-auto">
                                                        {notifications && notifications.items.length > 0 ? (
                                                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                                                {notifications.items.map((notification, index) => (
                                                                    <Link
                                                                        key={`${notification.id}-${index}`}
                                                                        href={notification.link || '#'}
                                                                        className="block px-4 py-3 transition duration-150 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-700 animate-fadeIn"
                                                                        style={{
                                                                            animationDelay: `${index * 50}ms`,
                                                                        }}
                                                                    >
                                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                            {notification.title}
                                                                        </p>
                                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                                            {notification.message}
                                                                        </p>
                                                                        {notification.created_at && (
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                                {new Date(notification.created_at).toLocaleString()}
                                                                            </p>
                                                                        )}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                                                No notifications yet
                                                            </div>
                                                        )}
                                                    </div>
                                                    {notifications && notifications.items.length > 0 && (
                                                        <Dropdown.Link
                                                            href={route('notifications.mark-read')}
                                                            method="post"
                                                            as="button"
                                                            className="w-full text-center border-t border-gray-100 dark:border-gray-700 px-4 py-2 text-xs font-medium text-indigo-700 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                        >
                                                            <Check className="inline h-3 w-3 mr-1" />
                                                            Mark all as read
                                                        </Dropdown.Link>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:focus:bg-gray-900 dark:focus:text-gray-400"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        {(() => {
                            const notif = usePage().props.auth.notifications;
                            return notif && notif.unread_count > 0 ? (
                                <ResponsiveNavLink
                                    href={route('notifications.mark-read')}
                                    method="post"
                                    as="button"
                                >
                                    <Bell className="inline h-4 w-4 mr-2" />
                                    Mark Notifications Read ({notif.unread_count})
                                </ResponsiveNavLink>
                            ) : null;
                        })()}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
