'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createNewKit } from '@/app/admin/edit/actions';
import ResizeUploader from '@/app/admin/edit/ResizeUploader';
import InputTextbox from '@/components/inputs/InputTextbox';

interface NewKitData {
    name: string;
    imagePath: string;
    width: number;
    height: number;
    smallImagePath: string;
    smallWidth: number;
    smallHeight: number;
    type: string;
}

export default function CreateKit() {
    const [imageUrl, setImageUrl] = useState('Not yet uploaded');
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [title, setTitle] = useState('Not yet uploaded');
    const [smallImageUrl, setSmallImageUrl] = useState('Not yet uploaded');
    const [smallWidth, setSmallWidth] = useState(0);
    const [smallHeight, setSmallHeight] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [type, _] = useState('monthly');

    const router = useRouter();

    const handleUploadComplete = useCallback(
        (
            fileName: string,
            originalImageUrl: string,
            smallImageUrl: string,
            originalWidth: number,
            originalHeight: number,
            smallWidth: number,
            smallHeight: number,
        ) => {
            console.log(
                'handleUploadComplete',
                fileName,
                originalImageUrl,
                smallImageUrl,
                originalWidth,
                originalHeight,
                smallWidth,
                smallHeight,
            );
            setTitle(fileName.split('.')[0]);
            setImageUrl(originalImageUrl);
            setSmallImageUrl(smallImageUrl);
            setWidth(originalWidth);
            setHeight(originalHeight);
            setSmallWidth(smallWidth);
            setSmallHeight(smallHeight);
            setStatusMessage(null);

            if (fileName) {
                setTitle(fileName.split('.')[0]);
            }
        },
        [],
    );

    const handleCreateKit = async (action: 'edit' | 'images' | 'view') => {
        setIsSubmitting(true);
        try {
            const data: NewKitData = {
                name: title,
                imagePath: imageUrl,
                width,
                height,
                smallImagePath: smallImageUrl,
                smallWidth,
                smallHeight,
                type,
            };
            const kit_data = await createNewKit(data);
            setStatusMessage({ type: 'success', message: 'Kit created successfully.' });
            handleResetInputs();
            if (kit_data.kit?.id) {
                switch (action) {
                    case 'edit':
                        router.push(`/admin/edit?id=${kit_data.kit.id}`);
                        break;
                    case 'images':
                        router.push(`/admin/edit/images/${kit_data.kit.id}`);
                        break;
                    case 'view':
                        router.push(`/kits?item=${kit_data.kit.id}`);
                        break;
                }
            }
        } catch (error) {
            console.error('Error creating kit:', error);
            setStatusMessage({ type: 'error', message: 'Failed to create kit. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetInputs = useCallback(() => {
        setImageUrl('Not yet uploaded');
        setWidth(0);
        setHeight(0);
        setTitle('Not yet uploaded');
        setSmallImageUrl('Not yet uploaded');
        setSmallWidth(0);
        setSmallHeight(0);
        setStatusMessage(null);
    }, []);

    const isFormValid = imageUrl !== 'Not yet uploaded' && title !== 'Not yet uploaded' && !isSubmitting;

    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-stone-900">
            <div className="flex w-4/5 flex-col items-center justify-center rounded-lg bg-stone-900">
                <div
                    id="header"
                    className="w-fit rounded-t-lg bg-gradient-to-r from-primary_dark via-primary_light to-primary_dark bg-clip-text text-center text-4xl font-bold text-transparent"
                >
                    Create New Kit
                </div>
                <div className="flex w-full flex-col items-center space-y-2 p-2">
                    <ResizeUploader
                        handleUploadComplete={handleUploadComplete}
                        handleResetInputs={handleResetInputs}
                        backToEditLink={`/admin/edit`}
                    />
                    <InputTextbox idName="title" name="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <InputTextbox idName="image_path" name="Image Path" value={imageUrl} />
                    <InputTextbox idName="px_width" name="Width (px)" value={width.toString()} />
                    <InputTextbox idName="px_height" name="Height (px)" value={height.toString()} />
                    <InputTextbox idName="small_image_path" name="Small Path" value={smallImageUrl} />
                    <InputTextbox idName="small_px_width" name="Sm Width" value={smallWidth.toString()} />
                    <InputTextbox idName="small_px_height" name="Sm Height" value={smallHeight.toString()} />
                    {imageUrl !== '' && imageUrl !== null ? null : width < 800 && height < 800 ? (
                        <div className="text-red-500">Warning: Image width and height are less than 800px.</div>
                    ) : width < 800 ? (
                        <div className="text-red-500">Warning: Image width is less than 800px.</div>
                    ) : height < 800 ? (
                        <div className="text-red-500">Warning: Image height is less than 800px.</div>
                    ) : null}

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            disabled={!isFormValid}
                            onClick={() => handleCreateKit('edit')}
                            className={
                                'relative rounded-md px-4 py-1 text-lg font-bold ' +
                                (isFormValid
                                    ? ' bg-primary_dark text-stone-300 hover:bg-primary_light hover:text-stone-950'
                                    : 'cursor-not-allowed bg-stone-400 text-stone-950 hover:bg-stone-400 hover:text-primary')
                            }
                        >
                            {isSubmitting ? 'Creating...' : 'Create & Edit'}
                        </button>
                        <button
                            type="button"
                            disabled={!isFormValid}
                            onClick={() => handleCreateKit('images')}
                            className={
                                'relative rounded-md px-4 py-1 text-lg font-bold ' +
                                (isFormValid
                                    ? ' bg-primary_dark text-stone-300 hover:bg-primary hover:text-stone-950'
                                    : 'cursor-not-allowed bg-stone-400 text-stone-950 hover:bg-stone-400 hover:text-primary')
                            }
                        >
                            {isSubmitting ? 'Creating...' : 'Create & Add Images'}
                        </button>
                        <button
                            type="button"
                            disabled={!isFormValid}
                            onClick={() => handleCreateKit('view')}
                            className={
                                'relative rounded-md px-4 py-1 text-lg font-bold ' +
                                (isFormValid
                                    ? ' bg-primary_dark text-stone-300 hover:bg-primary hover:text-stone-950'
                                    : 'cursor-not-allowed bg-stone-400 text-stone-950 hover:bg-stone-400 hover:text-primary')
                            }
                        >
                            {isSubmitting ? 'Creating...' : 'Create & View'}
                        </button>
                    </div>
                    {statusMessage && (
                        <div
                            className={`mt-4 rounded p-2 ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                            {statusMessage.message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
