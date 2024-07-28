'use server';

import { auth } from '@clerk/nextjs/server';
import { db, kitsTable, kitExtraImagesTable } from '@/db/db';
import { Kits } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';

async function checkUserRole(): Promise<{ isAdmin: boolean; error?: string | undefined }> {
    const { userId } = auth();
    if (!userId) {
        return { isAdmin: false, error: 'User is not authenticated. Cannot edit kit.' };
    }
    console.log(`User ID: ${userId}`);
    const hasAdminRole = await isClerkUserIdAdmin(userId);
    console.log(`User hasAdminRole: ${hasAdminRole}`);
    if (!hasAdminRole) {
        return { isAdmin: false, error: 'User does not have the admin role. Cannot edit kit.' };
    }
    return { isAdmin: true };
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

export async function onSubmitEditForm(data: SubmitFormData): Promise<{ success: boolean; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }

    try {
        console.log('Form Data (Next Line):');
        console.log(data);

        console.log('Editing kit with form data:', data);

        if (data.kit_id) {
            // Update existing kit
            await db
                .update(kitsTable)
                .set({
                    description: data.description || '',
                    price: parseInt(data.price || '0'),
                    permission_string: data.permission_string || '',
                    image_path: data.image_path || '',
                    width: parseInt(data.width || '0'),
                    height: parseInt(data.height || '0'),
                })
                .where(eq(kitsTable.id, parseInt(data.kit_id)));
        } else {
            console.log("Couldn't find kit with id " + data.kit_id);
            console.log('Skipping kit creation');
            return { success: false, error: 'Could not find kit with id ' + data.kit_id };
        }
        revalidatePath(`/kits/edit`);
        revalidatePath(`/kits`);
        return { success: true };
    } catch (error) {
        console.error('Error updating kit:', error);
        return { success: false, error: 'Error updating kit' };
    }
}

export async function handleImageReorder(
    kitId: number,
    currentImageId: number,
    targetImageId: number,
): Promise<{ success: boolean; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }

    try {
        const currentImage = await db.select().from(kitExtraImagesTable).where(eq(kitExtraImagesTable.id, currentImageId)).limit(1);
        const targetImage = await db.select().from(kitExtraImagesTable).where(eq(kitExtraImagesTable.id, targetImageId)).limit(1);

        if (currentImage.length === 0 || targetImage.length === 0) {
            console.error(`No images found for reordering`);
            return { success: false, error: `No images found for reordering` };
        }

        console.log(`Setting image path for ${currentImageId} to ${targetImage[0].image_path}`);
        await db
            .update(kitExtraImagesTable)
            .set({ image_path: targetImage[0].image_path })
            .where(eq(kitExtraImagesTable.id, currentImageId));

        console.log(`Setting image path for ${targetImageId} to ${currentImage[0].image_path}`);
        await db
            .update(kitExtraImagesTable)
            .set({ image_path: currentImage[0].image_path })
            .where(eq(kitExtraImagesTable.id, targetImageId));

        revalidatePath(`/kits/edit`);
        revalidatePath(`/kits`);
        return { success: true };
    } catch (error) {
        console.error('Error reordering images:', error);
        return { success: false, error: 'Error reordering images' };
    }
}

export async function handleImageTitleEdit(imageId: number, newTitle: string): Promise<{ success: boolean; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }

    try {
        await db.update(kitExtraImagesTable).set({ title: newTitle }).where(eq(kitExtraImagesTable.id, imageId));
        revalidatePath(`/kits/edit`);
        revalidatePath(`/kits`);
        return { success: true };
    } catch (error) {
        console.error('Error editing image title:', error);
        return { success: false, error: 'Error editing image title' };
    }
}

export async function handleImageDelete(kitId: number, imagePath: string): Promise<{ success: boolean; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }
    try {
        await db
            .delete(kitExtraImagesTable)
            .where(and(eq(kitExtraImagesTable.kit_id, kitId), eq(kitExtraImagesTable.image_path, imagePath)));
        revalidatePath(`/kits/edit`);
        revalidatePath(`/kits`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting image:', error);
        return { success: false, error: 'Error deleting image' };
    }
}

export async function handleTitleUpdate(formData: FormData): Promise<{ success: boolean; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }

    try {
        const kitId = Number(formData.get('kitId'));
        const newTitle = formData.get('newTitle')?.toString();

        if (!kitId || !newTitle) {
            console.error('Required form data missing. Cannot update title.');
            return { success: false, error: 'Required form data missing. Cannot update title.' };
        }

        await db.update(kitsTable).set({ name: newTitle }).where(eq(kitsTable.id, kitId));
        revalidatePath(`/kits/edit`);
        revalidatePath(`/kits`);
        return { success: true };
    } catch (error) {
        console.error('Error updating title:', error);
        return { success: false, error: 'Error updating title' };
    }
}

async function getMostRecentOId() {
    const lastKit = await db.select({ o_id: kitsTable.o_id }).from(kitsTable).orderBy(desc(kitsTable.o_id)).limit(1);
    return lastKit.length > 0 ? lastKit[0].o_id : null;
}

interface NewKitData {
    name: string;
    imagePath: string;
    width: number;
    height: number;
    smallImagePath: string;
    smallWidth: number;
    smallHeight: number;
}

export async function createKit(newKitData: NewKitData): Promise<{ success: boolean; kit?: Kits; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }

    try {
        const maxOId = await getMostRecentOId();
        console.log('Max OId:', maxOId);
        const newOId = maxOId ? maxOId + 1 : 1;
        console.log('New OId:', newOId);

        const data = {
            name: newKitData.name,
            image_path: newKitData.imagePath,
            width: newKitData.width,
            height: newKitData.height,
            small_image_path: newKitData.smallImagePath,
            small_width: newKitData.smallWidth,
            small_height: newKitData.smallHeight,
            o_id: newOId,
        };
        console.log('New Kit Data:', data);

        const newKit = await db.insert(kitsTable).values(data).returning();
        revalidatePath(`/kits/edit`);
        revalidatePath(`/kits`);
        return { success: true, kit: newKit[0] };
    } catch (error) {
        console.error('Error creating kit:', error);
        return { success: false, error: 'Error creating kit' };
    }
}

export async function createNewKit(newKitData: NewKitData) {
    console.log('Creating new kit:', newKitData);
    const newKitOutput = await createKit(newKitData);

    if (!newKitOutput.success) {
        console.error('Error creating new kit:', newKitOutput.error);
        return { success: false, error: 'Error creating new kit.' };
    }
    if (!newKitOutput.kit) {
        console.error('No kit returned from createKit:', newKitOutput.error);
        return { success: false, error: 'Error creating new kit.' };
    }

    revalidatePath(`/kits/edit`);
    revalidatePath(`/kits`);
    return { success: true, kit: newKitOutput.kit };
}

interface UploadFormData {
    kit_id: string;
    image_path: string;
    width: string;
    height: string;
    small_image_path: string;
    small_width: string;
    small_height: string;
    title: string | null;
    image_type: string;
}

export async function storeUploadedImageDetails(data: UploadFormData): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }
    console.log('Uploading Image...');
    try {
        const kitId = parseInt(data.kit_id?.toString() || '0');
        const imageUrl = data.image_path?.toString() || '';
        const width = parseInt(data.width?.toString() || '0');
        const height = parseInt(data.height?.toString() || '0');
        const title = data.title;
        const imageType = data.image_type?.toString() || '';
        const smallImageUrl = data.small_image_path?.toString() || '';
        const smallWidth = parseInt(data.small_width?.toString() || '0');
        const smallHeight = parseInt(data.small_height?.toString() || '0');

        const kit = await db.select().from(kitsTable).where(eq(kitsTable.id, kitId)).limit(1);
        if (!kit.length) {
            console.error(`Kit with id ${kitId} not found`);
            return { success: false, error: `Kit with id ${kitId} not found` };
        }

        if (imageType === 'main') {
            console.log('Modifying main image');
            await db
                .update(kitsTable)
                .set({
                    image_path: imageUrl,
                    width: width,
                    height: height,
                    small_image_path: smallImageUrl,
                    small_width: smallWidth,
                    small_height: smallHeight,
                })
                .where(eq(kitsTable.id, kitId));
        } else {
            if (imageType === 'extra') {
                console.log('Adding extra image');
                await db.insert(kitExtraImagesTable).values({
                    kit_id: kitId,
                    image_path: imageUrl,
                    title: title,
                    width: width,
                    height: height,
                    small_image_path: smallImageUrl,
                    small_width: smallWidth,
                    small_height: smallHeight,
                });
            }
        }
        revalidatePath(`/kits/edit`);
        revalidatePath(`/kits`);
        return { success: true, imageUrl: imageUrl };
    } catch (error) {
        console.error('Error updating kit:', error);
        return { success: false, error: 'Error updating kit' };
    }
}
