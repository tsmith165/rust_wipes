'use server';

import { eq, desc, asc, gt, lt, and, inArray } from 'drizzle-orm';
import { db, kits, KitExtraImages } from '@/db/db';
import { KitsWithExtraImages } from '@/db/schema';

export async function fetchKits(): Promise<KitsWithExtraImages[]> {
    console.log(`Fetching active kits with Drizzle`);
    const kitsWithExtraImages = await db
        .select({
            kit: kits,
            extraImages: KitExtraImages,
        })
        .from(kits)
        .where(eq(kits.active, true))
        .leftJoin(KitExtraImages, eq(KitExtraImages.kit_id, kits.id))
        .orderBy(desc(kits.o_id));

    console.log(`Captured active kits successfully`);

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
    const kitList = await db.select({ id: kits.id }).from(kits).where(eq(kits.active, true));
    return kitList.map((kit) => kit.id);
}

export async function fetchKitById(id: number) {
    const kit = await db
        .select()
        .from(kits)
        .where(and(eq(kits.id, id), eq(kits.active, true)))
        .execute();

    if (kit.length === 0) {
        return null;
    }

    const extraImages = await db
        .select()
        .from(KitExtraImages)
        .where(eq(KitExtraImages.kit_id, id))
        .orderBy(asc(KitExtraImages.id))
        .execute();

    const kitData = {
        ...kit[0],
        extraImages,
    };

    return kitData;
}

export async function fetchKitsByIds(ids: number[]) {
    const kits_data = await db
        .select()
        .from(kits)
        .where(and(inArray(kits.id, ids), eq(kits.active, true)))
        .execute();
    const kitsWithImages = await Promise.all(
        kits_data.map(async (kit) => {
            const extraImages = await db
                .select()
                .from(KitExtraImages)
                .where(eq(KitExtraImages.kit_id, kit.id))
                .orderBy(asc(KitExtraImages.id))
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
    console.log(`Fetching adjacent active kit IDs for kit ID: ${currentId}`);
    const currentKit = await db
        .select()
        .from(kits)
        .where(and(eq(kits.id, currentId), eq(kits.active, true)))
        .limit(1);

    if (currentKit.length === 0) {
        return { next_id: -1, last_id: -1 };
    }

    const currentOId = currentKit[0].o_id;

    // Fetch the next active kit by o_id
    const nextKit = await db
        .select()
        .from(kits)
        .where(and(gt(kits.o_id, currentOId), eq(kits.active, true)))
        .orderBy(asc(kits.o_id))
        .limit(1);

    // Fetch the last active kit by o_id
    const lastKit = await db
        .select()
        .from(kits)
        .where(and(lt(kits.o_id, currentOId), eq(kits.active, true)))
        .orderBy(desc(kits.o_id))
        .limit(1);

    // Fetch the active kit with the minimum o_id
    const firstKit = await db.select().from(kits).where(eq(kits.active, true)).orderBy(asc(kits.o_id)).limit(1);

    // Fetch the active kit with the maximum o_id
    const maxOIdKit = await db.select().from(kits).where(eq(kits.active, true)).orderBy(desc(kits.o_id)).limit(1);

    const next_id = nextKit.length > 0 ? nextKit[0].id : firstKit[0].id;
    const last_id = lastKit.length > 0 ? lastKit[0].id : maxOIdKit[0].id;

    console.log(`Found next_id: ${next_id} and last_id: ${last_id}`);

    return { next_id, last_id };
}

export async function getMostRecentKitId(): Promise<number | null> {
    console.log('Fetching most recent active kit ID...');
    const kit = await db.select().from(kits).where(eq(kits.active, true)).orderBy(desc(kits.o_id)).limit(1);

    return kit[0]?.id || null;
}

export async function fetchKitImageById(id: number) {
    const kit = await db
        .select({
            image_path: kits.image_path,
            width: kits.width,
            height: kits.height,
        })
        .from(kits)
        .where(and(eq(kits.id, id), eq(kits.active, true)))
        .execute();

    return kit[0] || null;
}
