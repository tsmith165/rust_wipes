import { eq, asc, desc } from 'drizzle-orm';
import { db, kits } from '@/db/db';
import { Kits } from '@/db/schema';
import { revalidatePath } from 'next/cache';

import { auth } from '@clerk/nextjs/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';

async function checkUserRole(): Promise<{ isAdmin: boolean; error?: string | undefined }> {
    const { userId } = await auth();
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

export async function getKits(): Promise<Kits[]> {
    return await db.select().from(kits).where(eq(kits.active, true)).orderBy(asc(kits.o_id));
}

export async function getPrioritizedKits(): Promise<Kits[]> {
    return await db.select().from(kits).where(eq(kits.active, true)).orderBy(desc(kits.p_id));
}

export async function getArchivedKits(): Promise<Kits[]> {
    return await db.select().from(kits).where(eq(kits.active, false)).orderBy(asc(kits.o_id));
}

export async function changeOrder(currIdList: number[], nextIdList: number[]): Promise<void> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return;
    }

    const [currId, currOrderId] = currIdList;
    const [nextId, nextOrderId] = nextIdList;
    console.log(`Swapping ${currId} (${currOrderId}) with ${nextId} (${nextOrderId})`);

    await db.update(kits).set({ o_id: nextOrderId }).where(eq(kits.id, currId));
    await db.update(kits).set({ o_id: currOrderId }).where(eq(kits.id, nextId));

    revalidatePath(`/admin/manage`);
    revalidatePath(`/kits`);
}

export async function changePriority(currIdList: number[], nextIdList: number[]): Promise<void> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return;
    }

    const [currId, currPriorityId] = currIdList;
    const [nextId, nextPriorityId] = nextIdList;
    console.log(`Swapping priority ${currId} (${currPriorityId}) with ${nextId} (${nextPriorityId})`);

    await db.update(kits).set({ p_id: nextPriorityId }).where(eq(kits.id, currId));
    await db.update(kits).set({ p_id: currPriorityId }).where(eq(kits.id, nextId));
    revalidatePath(`/admin/manage`);
    revalidatePath(`/kits`);
}

export async function setInactive(id: number): Promise<void> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return;
    }

    console.log(`Setting kit with id: ${id} as inactive`);
    await db.update(kits).set({ active: false, o_id: -1000000 }).where(eq(kits.id, id));
    revalidatePath(`/admin/manage`);
    revalidatePath(`/kits`);
}

export async function setActive(id: number): Promise<void> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return;
    }

    console.log(`Setting kit with id: ${id} as active`);

    const lastItem = await db.select().from(kits).orderBy(desc(kits.o_id)).limit(1);
    const newOId = lastItem.length > 0 ? lastItem[0].o_id + 1 : 1;

    await db.update(kits).set({ active: true, o_id: newOId }).where(eq(kits.id, id));
    revalidatePath(`/admin/manage`);
    revalidatePath(`/kits`);
}
