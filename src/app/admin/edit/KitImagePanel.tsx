import React from 'react';
import { IoIosArrowUp, IoIosArrowDown, IoIosTrash } from 'react-icons/io';
import { handleImageReorder, handleImageDelete } from './actions';
import { KitsWithExtraImages, KitExtraImagesType } from '@/db/schema';
import Image from 'next/image';

interface KitImagePanelProps {
    current_kit: KitsWithExtraImages;
}

const KitImagePanel: React.FC<KitImagePanelProps> = ({ current_kit }) => {
    const extra_images: KitExtraImagesType[] = current_kit.extraImages || [];

    async function handleImageReorderAction(formData: FormData) {
        const kitId = Number(formData.get('kitId'));
        const currentImageId = Number(formData.get('currentImageId'));
        const targetImageId = Number(formData.get('targetImageId'));
        const imageType = formData.get('imageType')?.toString();

        if (!currentImageId || !targetImageId || !imageType) {
            console.error(`Required form data missing. Cannot reorder image.`);
            return;
        }

        await handleImageReorder(kitId, currentImageId, targetImageId);
    }

    async function handleImageDeleteAction(formData: FormData) {
        const kitId = Number(formData.get('kitId'));
        const imageType = formData.get('imageType')?.toString();
        const imagePath = formData.get('imagePath')?.toString();

        if (!imageType || !imagePath) {
            console.error(`Required form data missing. Cannot delete image.`);
            return;
        }

        await handleImageDelete(kitId, imagePath);
    }

    const renderImages = (images: KitExtraImagesType[], imageType: string) => {
        const elements = [];
        for (let index = 0; index < images.length; index++) {
            const image = images[index];
            const currentImageId = image.id;
            const prevImageId = images[index - 1]?.id || images[images.length - 1]?.id;
            const nextImageId = images[index + 1]?.id || images[0]?.id;

            elements.push(
                <div
                    key={index}
                    className="group flex h-[60px] flex-row items-center space-x-2 rounded-lg bg-stone-400 px-2 py-2 hover:bg-stone-500"
                >
                    <Image
                        src={image.image_path}
                        alt={image.image_path}
                        width={image.width}
                        height={image.height}
                        className="h-[40x] w-[40px] object-contain"
                    />
                    <div className="flex h-[40px] flex-col space-y-0.5">
                        <form action={handleImageReorderAction} className="flex h-full w-fit">
                            <input type="hidden" name="kitId" value={current_kit.id.toString()} />
                            <input type="hidden" name="currentImageId" value={currentImageId.toString()} />
                            <input type="hidden" name="targetImageId" value={prevImageId.toString()} />
                            <input type="hidden" name="imageType" value={imageType} />
                            <button type="submit">
                                <IoIosArrowUp className="h-[20px] w-[20px] cursor-pointer rounded-sm bg-primary fill-stone-300 p-1 hover:bg-primary_light hover:fill-stone-950" />
                            </button>
                        </form>
                        <form action={handleImageReorderAction}>
                            <input type="hidden" name="kitId" value={current_kit.id.toString()} />
                            <input type="hidden" name="currentImageId" value={currentImageId.toString()} />
                            <input type="hidden" name="targetImageId" value={nextImageId.toString()} />
                            <input type="hidden" name="imageType" value={imageType} />
                            <button type="submit">
                                <IoIosArrowDown className="h-[20px] w-[20px] cursor-pointer rounded-sm bg-primary fill-stone-300 p-1 hover:bg-primary_light hover:fill-stone-950" />
                            </button>
                        </form>
                    </div>

                    <div className="flex h-[40px] items-center justify-center">
                        <form action={handleImageDeleteAction} className="h-6 w-6">
                            <input type="hidden" name="kitId" value={current_kit.id.toString()} />
                            <input type="hidden" name="imagePath" value={image.image_path} />
                            <input type="hidden" name="imageType" value={imageType} />
                            <button type="submit">
                                <IoIosTrash className="h-6 w-6 cursor-pointer rounded-sm bg-primary fill-stone-300 p-1 hover:bg-primary_light hover:fill-stone-950" />
                            </button>
                        </form>
                    </div>
                    <div className="flex h-[40px] items-center justify-center group-hover:text-stone-950">
                        {image.title || image.image_path}
                    </div>
                </div>,
            );
        }
        return elements;
    };

    return (
        <div className="flex h-fit w-full flex-col pt-2">
            {extra_images.length > 0 && (
                <div className="flex h-fit w-full flex-col items-center justify-center rounded-lg">
                    <h3 className="radial-gradient-stone-300 w-fit rounded-t-lg bg-primary bg-clip-text text-center text-2xl font-semibold text-transparent">
                        Extra Images
                    </h3>
                    <div className="flex h-fit w-full flex-col px-4 py-4">{renderImages(extra_images, 'extra')}</div>
                </div>
            )}
        </div>
    );
};

export default KitImagePanel;
