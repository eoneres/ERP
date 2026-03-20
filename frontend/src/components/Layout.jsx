import React from "react";
import { Fragment, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
    Bars3Icon,
    HomeIcon,
    UsersIcon,
    TruckIcon,
    CalendarIcon,
    WrenchIcon,
    CubeIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Clientes", href: "/clientes", icon: UsersIcon },
    { name: "Veículos", href: "/veiculos", icon: TruckIcon },
    { name: "Agendamentos", href: "/agendamentos", icon: CalendarIcon },
    { name: "Ordens de Serviço", href: "/os", icon: WrenchIcon },
    { name: "Estoque", href: "/estoque", icon: CubeIcon },
    { name: "Movimentações", href: "/estoque/movimentacoes", icon: ArrowPathIcon }, // ← novo
    { name: "Fornecedores", href: "/estoque/fornecedores", icon: TruckIcon },
    { name: "Financeiro", href: "/financeiro", icon: CurrencyDollarIcon },
    { name: "Relatórios", href: "/relatorios", icon: ChartBarIcon },
    { name: "Configurações", href: "/configuracoes", icon: Cog6ToothIcon },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { user, signOut } = useAuth();

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            {/* Sidebar mobile */}
            <Transition.Root show={sidebarOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-40 lg:hidden"
                    onClose={setSidebarOpen}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex z-40">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                                        <button
                                            type="button"
                                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            <span className="sr-only">Fechar sidebar</span>
                                            <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </button>
                                    </div>
                                </Transition.Child>
                                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                                    <div className="flex-shrink-0 flex items-center px-4">
                                        <h1 className="text-xl font-bold text-primary-600">
                                            Oficina Mecânica
                                        </h1>
                                    </div>
                                    <nav className="mt-5 px-2 space-y-1">
                                        {navigation.map((item) => (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                className={classNames(
                                                    location.pathname === item.href
                                                        ? "bg-gray-100 text-gray-900"
                                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                                    "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                                                )}
                                                onClick={() => setSidebarOpen(false)}
                                            >
                                                <item.icon
                                                    className={classNames(
                                                        location.pathname === item.href
                                                            ? "text-gray-500"
                                                            : "text-gray-400 group-hover:text-gray-500",
                                                        "mr-4 flex-shrink-0 h-6 w-6"
                                                    )}
                                                    aria-hidden="true"
                                                />
                                                {item.name}
                                            </Link>
                                        ))}
                                    </nav>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                        <div className="flex-shrink-0 w-14">{/* Force sidebar to shrink */}</div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Sidebar desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
                        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                            <div className="flex items-center flex-shrink-0 px-4">
                                <h1 className="text-xl font-bold text-primary-600">
                                    Oficina Mecânica
                                </h1>
                            </div>
                            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={classNames(
                                            location.pathname === item.href
                                                ? "bg-gray-100 text-gray-900"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                            "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                                        )}
                                    >
                                        <item.icon
                                            className={classNames(
                                                location.pathname === item.href
                                                    ? "text-gray-500"
                                                    : "text-gray-400 group-hover:text-gray-500",
                                                "mr-3 flex-shrink-0 h-6 w-6"
                                            )}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
                    <button
                        type="button"
                        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">Abrir sidebar</span>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div className="flex-1 px-4 flex justify-end">
                        <div className="ml-4 flex items-center md:ml-6">
                            {/* Profile dropdown */}
                            <Menu as="div" className="ml-3 relative">
                                <div>
                                    <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                        <span className="sr-only">Abrir menu</span>
                                        <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                                            {user?.nome?.charAt(0) || "U"}
                                        </div>
                                    </Menu.Button>
                                </div>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                                    <p className="font-medium">{user?.nome}</p>
                                                    <p className="text-gray-500">{user?.email}</p>
                                                </div>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => signOut()}
                                                    className={classNames(
                                                        active ? "bg-gray-100" : "",
                                                        "block w-full text-left px-4 py-2 text-sm text-gray-700"
                                                    )}
                                                >
                                                    Sair
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        </div>
                    </div>
                </div>

                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}