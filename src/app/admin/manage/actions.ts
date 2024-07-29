import { eq, asc, desc } from 'drizzle-orm';
import { db, kitsTable } from '@/db/db';
import { Kits } from '@/db/schema';
import { revalidatePath } from 'next/cache';

export async function getKits(): Promise<Kits[]> {
    return await db.select().from(kitsTable).where(eq(kitsTable.active, true)).orderBy(asc(kitsTable.o_id));
}

export async function getPrioritizedKits(): Promise<Kits[]> {
    return await db.select().from(kitsTable).where(eq(kitsTable.active, true)).orderBy(desc(kitsTable.p_id));
}

export async function getArchivedKits(): Promise<Kits[]> {
    return await db.select().from(kitsTable).where(eq(kitsTable.active, false)).orderBy(asc(kitsTable.o_id));
}

export async function changeOrder(currIdList: number[], nextIdList: number[]): Promise<void> {
    const [currId, currOrderId] = currIdList;
    const [nextId, nextOrderId] = nextIdList;
    console.log(`Swapping ${currId} (${currOrderId}) with ${nextId} (${nextOrderId})`);

    await db.update(kitsTable).set({ o_id: nextOrderId }).where(eq(kitsTable.id, currId));
    await db.update(kitsTable).set({ o_id: currOrderId }).where(eq(kitsTable.id, nextId));

    revalidatePath(`/admin/manage`);
    revalidatePath(`/kits`);
}

export async function changePriority(currIdList: number[], nextIdList: number[]): Promise<void> {
    const [currId, currPriorityId] = currIdList;
    const [nextId, nextPriorityId] = nextIdList;
    console.log(`Swapping priority ${currId} (${currPriorityId}) with ${nextId} (${nextPriorityId})`);

    await db.update(kitsTable).set({ p_id: nextPriorityId }).where(eq(kitsTable.id, currId));
    await db.update(kitsTable).set({ p_id: currPriorityId }).where(eq(kitsTable.id, nextId));
    revalidatePath(`/admin/manage`);
    revalidatePath(`/kits`);
}

export async function setInactive(id: number): Promise<void> {
    console.log(`Setting kit with id: ${id} as inactive`);
    await db.update(kitsTable).set({ active: false, o_id: -1000000 }).where(eq(kitsTable.id, id));
    revalidatePath(`/admin/manage`);
    revalidatePath(`/kits`);
}

export async function setActive(id: number): Promise<void> {
    console.log(`Setting kit with id: ${id} as active`);

    const lastItem = await db.select().from(kitsTable).orderBy(desc(kitsTable.o_id)).limit(1);
    const newOId = lastItem.length > 0 ? lastItem[0].o_id + 1 : 1;

    await db.update(kitsTable).set({ active: true, o_id: newOId }).where(eq(kitsTable.id, id));
    revalidatePath(`/admin/manage`);
    revalidatePath(`/kits`);
}
