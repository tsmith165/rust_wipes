'use server';

import { eq, desc } from 'drizzle-orm';
import { db } from '@/db/db';
import { kitsTable, kitExtraImagesTable, KitsWithExtraImages } from '@/db/schema';

export async function fetchKits(): Promise<KitsWithExtraImages[]> {
    console.log(`Fetching kits with Drizzle`);
    const kitsWithExtraImages = await db
        .select({
            kit: kitsTable,
            extraImage: kitExtraImagesTable,
        })
        .from(kitsTable)
        .leftJoin(kitExtraImagesTable, eq(kitExtraImagesTable.kit_id, kitsTable.id))
        .orderBy(desc(kitsTable.id));

    console.log(`Captured kits successfully`);

    const formattedKits = kitsWithExtraImages.reduce<KitsWithExtraImages[]>((acc, curr) => {
        const kit = curr.kit;
        const extraImage = curr.extraImage;

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

export async function fetchKitById(id: number): Promise<KitsWithExtraImages | null> {
    const kit = await db.select().from(kitsTable).where(eq(kitsTable.id, id)).limit(1);

    if (kit.length === 0) {
        return null;
    }

    const extraImages = await db
        .select()
        .from(kitExtraImagesTable)
        .where(eq(kitExtraImagesTable.kit_id, id))
        .orderBy(desc(kitExtraImagesTable.id));

    return {
        ...kit[0],
        extraImages,
    };
}
