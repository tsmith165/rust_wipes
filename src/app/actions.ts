'use server';

import { eq, desc, asc, gt, lt, and, inArray } from 'drizzle-orm';
import { db, kitsTable, kitExtraImagesTable } from '@/db/db';
import { KitsWithExtraImages, KitExtraImages } from '@/db/schema';

export async function fetchKits(): Promise<KitsWithExtraImages[]> {
    console.log(`Fetching kits with Drizzle`);
    const kitsWithExtraImages = await db
        .select({
            kit: kitsTable,
            extraImages: kitExtraImagesTable,
        })
        .from(kitsTable)
        .leftJoin(kitExtraImagesTable, eq(kitExtraImagesTable.kit_id, kitsTable.id))
        .orderBy(desc(kitsTable.o_id));

    console.log(`Captured kits successfully`);

    const formattedKits = kitsWithExtraImages.reduce<KitsWithExtraImages[]>((acc, curr) => {
        const kit = curr.kit;
        const extraImage = curr.extraImages;

        const existingKit = acc.find((k) => k.id === kit.id);

        if (existingKit) {
            if (extraImage) {
                existingKit.extraImages.push(extraImage);
            }
        } else {
            acc.push({
                ...kit,
                extraImages: extraImage ? [extraImage] : [],
            });
        }

        return acc;
    }, []);

    return formattedKits;
}

export async function fetchKitIds(): Promise<number[]> {
    const kitList = await db.select({ id: kitsTable.id }).from(kitsTable);
    return kitList.map((kit) => kit.id);
}

export async function fetchKitById(id: number) {
    const kit = await db.select().from(kitsTable).where(eq(kitsTable.id, id)).execute();
    const extraImages = await db
        .select()
        .from(kitExtraImagesTable)
        .where(eq(kitExtraImagesTable.kit_id, id))
        .orderBy(asc(kitExtraImagesTable.id))
        .execute();

    const kitData = {
        ...kit[0],
        extraImages,
    };

    return kitData;
}

export async function fetchKitsByIds(ids: number[]) {
    const kits = await db.select().from(kitsTable).where(inArray(kitsTable.id, ids)).execute();
    const kitsWithImages = await Promise.all(
        kits.map(async (kit) => {
            const extraImages = await db
                .select()
                .from(kitExtraImagesTable)
                .where(eq(kitExtraImagesTable.kit_id, kit.id))
                .orderBy(asc(kitExtraImagesTable.id))
                .execute();

            return {
                ...kit,
                extraImages,
            };
        }),
    );

    return kitsWithImages;
}

export async function fetchAdjacentKitIds(currentId: number) {
    console.log(`Fetching adjacent kit IDs for kit ID: ${currentId}`);
    const currentKit = await db.select().from(kitsTable).where(eq(kitsTable.id, currentId)).limit(1);

    if (currentKit.length === 0) {
        return { next_id: -1, last_id: -1 };
    }

    const currentOId = currentKit[0].o_id;

    // Fetch the next kit by o_id
    const nextKit = await db.select().from(kitsTable).where(gt(kitsTable.o_id, currentOId)).orderBy(asc(kitsTable.o_id)).limit(1);

    // Fetch the last kit by o_id
    const lastKit = await db.select().from(kitsTable).where(lt(kitsTable.o_id, currentOId)).orderBy(desc(kitsTable.o_id)).limit(1);

    // Fetch the kit with the minimum o_id
    const firstKit = await db.select().from(kitsTable).orderBy(asc(kitsTable.o_id)).limit(1);

    // Fetch the kit with the maximum o_id
    const maxOIdKit = await db.select().from(kitsTable).orderBy(desc(kitsTable.o_id)).limit(1);

    const next_id = nextKit.length > 0 ? nextKit[0].id : firstKit[0].id;
    const last_id = lastKit.length > 0 ? lastKit[0].id : maxOIdKit[0].id;

    console.log(`Found next_id: ${next_id} and last_id: ${last_id}`);

    return { next_id, last_id };
}

export async function getMostRecentKitId(): Promise<number | null> {
    console.log('Fetching most recent kit ID...');
    const kit = await db.select().from(kitsTable).orderBy(desc(kitsTable.o_id)).limit(1);

    return kit[0]?.id || null;
}

export async function fetchKitImageById(id: number) {
    const kit = await db
        .select({
            image_path: kitsTable.image_path,
            width: kitsTable.width,
            height: kitsTable.height,
        })
        .from(kitsTable)
        .where(eq(kitsTable.id, id))
        .execute();

    return kit[0] || null;
}
