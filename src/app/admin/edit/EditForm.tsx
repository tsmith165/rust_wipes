'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import InputTextbox from '@/components/inputs/InputTextbox';
import InputTextArea from '@/components/inputs/InputTextArea';

import { onSubmitEditForm } from './actions';

const MAX_CHANGE_DISPLAY_LENGTH = 30;

interface EditFormProps {
    current_kit: any;
}

interface SubmitFormData {
    kit_id: string;
    description: string;
    price: string;
    permission_string: string;
    image_path: string;
    width: string;
    height: string;
}

const EditForm: React.FC<EditFormProps> = ({ current_kit }) => {
    const [initialFormData, setInitialFormData] = useState<SubmitFormData>({
        kit_id: current_kit.id.toString(),
        description: current_kit.description || '',
        price: current_kit.price?.toString() || '',
        permission_string: current_kit.permission_string || '',
        image_path: current_kit.image_path || '',
        width: current_kit.width?.toString() || '',
        height: current_kit.height?.toString() || '',
    });

    const [formData, setFormData] = useState<SubmitFormData>(initialFormData);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [changes, setChanges] = useState<{ field: string; oldValue: string; newValue: string }[]>([]);
    const [submittedChanges, setSubmittedChanges] = useState<{ field: string; oldValue: string; newValue: string }[]>([]);

    useEffect(() => {
        const newInitialFormData = {
            kit_id: current_kit.id.toString(),
            kit_name: current_kit.name,
            description: current_kit.description || '',
            price: current_kit.price?.toString() || '',
            permission_string: current_kit.permission_string || '',
            image_path: current_kit.image_path || '',
            width: current_kit.width?.toString() || '',
            height: current_kit.height?.toString() || '',
        };
        setInitialFormData(newInitialFormData);
        setFormData(newInitialFormData);
        setChanges([]);
    }, [current_kit]);

    const getChanges = (newData: SubmitFormData) => {
        const changesArray: { field: string; oldValue: string; newValue: string }[] = [];
        Object.keys(newData).forEach((key) => {
            const typedKey = key as keyof SubmitFormData;
            if (newData[typedKey] !== initialFormData[typedKey]) {
                changesArray.push({
                    field: key,
                    oldValue: String(initialFormData[typedKey]),
                    newValue: String(newData[typedKey]),
                });
            }
        });
        return changesArray;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            const newData = { ...prevData, [name]: value };
            setChanges(getChanges(newData));
            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmittedChanges([]);
        setSubmitMessage(null);
        console.log('Form Data (Next Line):');
        console.log(formData);
        try {
            const result = await onSubmitEditForm(formData);
            if (result.success) {
                setSubmitMessage({ type: 'success', text: 'Changes submitted successfully!' });
                setSubmittedChanges(changes);
                setInitialFormData(formData); // Update initial data after successful submission
                setChanges([]); // Clear pending changes
            } else {
                setSubmitMessage({ type: 'error', text: result.error || 'An error occurred while submitting changes.' });
            }
        } catch (error) {
            setSubmitMessage({ type: 'error', text: 'An unexpected error occurred.' });
        }
    };

    const truncateChange = (value: string) => {
        return value.length > MAX_CHANGE_DISPLAY_LENGTH ? value.substring(0, MAX_CHANGE_DISPLAY_LENGTH) + '...' : value;
    };

    return (
        <div className="flex h-fit w-full p-2">
            <form onSubmit={handleSubmit} className="flex w-full flex-col space-y-2">
                <div className="flex h-fit w-full">
                    <InputTextbox idName="price" name="Price" value={formData.price} onChange={handleChange} />
                </div>
                <div className="flex h-fit w-full">
                    <InputTextbox
                        idName="permission_string"
                        name="Permissions"
                        value={formData.permission_string}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex h-fit w-full flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                    <div className="w-full md:w-1/2">
                        <InputTextbox idName="width" name="Width (px)" value={formData.width} onChange={handleChange} />
                    </div>
                    <div className="w-full md:w-1/2">
                        <InputTextbox idName="height" name="Height (px)" value={formData.height} onChange={handleChange} />
                    </div>
                </div>

                <div className="flex h-fit w-full">
                    <InputTextArea idName="description" name="Description" value={formData.description} rows={5} onChange={handleChange} />
                </div>

                <div className="flex flex-row items-center space-x-2">
                    <button
                        type="submit"
                        className={
                            'rounded-md bg-secondary px-3 py-1 text-center font-bold text-stone-400 ' +
                            'hover:bg-primary hover:text-secondary_dark'
                        }
                    >
                        Submit Changes
                    </button>
                    <Link
                        href="/admin/edit/new"
                        className={
                            'rounded-md bg-secondary px-3 py-1 text-center font-bold text-stone-400 ' +
                            ' hover:bg-primary hover:text-secondary_dark'
                        }
                    >
                        Create New Kit
                    </Link>
                    <Link
                        href={`/admin/edit/images/${formData.kit_id}`}
                        className={
                            'rounded-md bg-secondary px-3 py-1 text-center font-bold text-stone-400 ' +
                            'hover:bg-primary hover:text-secondary_dark'
                        }
                    >
                        Edit Images
                    </Link>
                </div>

                {changes.length > 0 && (
                    <div className="mt-2 rounded-md bg-yellow-100 p-2 text-yellow-800">
                        <p className="font-bold">Pending Changes:</p>
                        <ul className="list-disc pl-5">
                            {changes.map((change, index) => (
                                <li key={index}>
                                    {change.field}: {truncateChange(change.oldValue)} → {truncateChange(change.newValue)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {submitMessage && (
                    <div className={`mt-2 rounded-md p-2 ${submitMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                        <p>{submitMessage.text}</p>
                        {submitMessage.type === 'success' && submittedChanges.length > 0 && (
                            <div className="mt-2">
                                <p className="font-bold">Submitted Changes:</p>
                                <ul className="list-disc pl-5">
                                    {submittedChanges.map((change, index) => (
                                        <li key={index}>
                                            {change.field}: {truncateChange(change.oldValue)} → {truncateChange(change.newValue)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
};

export default EditForm;
