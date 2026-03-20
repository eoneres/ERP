import React from "react";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    onConfirm,
    onCancel,
    type = "danger",
}) {
    const colors = {
        danger: {
            bg: "bg-red-100",
            icon: "text-red-600",
            button: "bg-red-600 hover:bg-red-700",
        },
        warning: {
            bg: "bg-yellow-100",
            icon: "text-yellow-600",
            button: "bg-yellow-600 hover:bg-yellow-700",
        },
        info: {
            bg: "bg-blue-100",
            icon: "text-blue-600",
            button: "bg-blue-600 hover:bg-blue-700",
        },
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onCancel}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`${colors[type].bg} p-3 rounded-full`}>
                                        <ExclamationTriangleIcon
                                            className={`${colors[type].icon} h-6 w-6`}
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div>
                                        <Dialog.Title className="text-lg font-medium text-gray-900">
                                            {title}
                                        </Dialog.Title>
                                        <p className="text-sm text-gray-500 mt-1">{message}</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        onClick={onCancel}
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        type="button"
                                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${colors[type].button}`}
                                        onClick={onConfirm}
                                    >
                                        {confirmText}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}