import Link from 'next/link';
import Image from 'next/image';
import { IoIosArrowForward } from 'react-icons/io';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever, MdRestore } from 'react-icons/md';
import { changeOrder, changePriority, setInactive, setActive } from './actions';
import { Kits } from '@/db/schema';

interface ManageProps {
    kits: Kits[];
    archivedKits: Kits[];
    prioritizedKits: Kits[];
    activeTab: string;
}

export function Manage({ kits, archivedKits, prioritizedKits, activeTab }: ManageProps) {
    async function handleOrderChange(formData: FormData) {
        'use server';
        const currId = Number(formData.get('currId'));
        const currOrderId = Number(formData.get('currOrderId'));
        const nextId = Number(formData.get('nextId'));
        const nextOrderId = Number(formData.get('nextOrderId'));

        if (nextId !== null && nextOrderId !== null) {
            console.log(`Handle Order Change: currId: ${currId} (${currOrderId}) | nextId: ${nextId} (${nextOrderId})`);
            await changeOrder([currId, currOrderId], [nextId, nextOrderId]);
        }
    }

    async function handlePriorityChange(formData: FormData) {
        'use server';
        const currId = Number(formData.get('currId'));
        const currPriorityId = Number(formData.get('currPriorityId'));
        const nextId = Number(formData.get('nextId'));
        const nextPriorityId = Number(formData.get('nextPriorityId'));

        if (nextId !== null && nextPriorityId !== null) {
            console.log(`Handle Priority Change: currId: ${currId} (${currPriorityId}) | nextId: ${nextId} (${nextPriorityId})`);
            await changePriority([currId, currPriorityId], [nextId, nextPriorityId]);
        }
    }

    async function handleSetInactive(formData: FormData) {
        'use server';
        const id = Number(formData.get('id'));
        console.log(`Handle Set Inactive: id: ${id}`);
        await setInactive(id);
    }

    async function handleSetActive(formData: FormData) {
        'use server';
        const id = Number(formData.get('id'));
        console.log(`Handle Set Active: id: ${id}`);
        await setActive(id);
    }

    return (
        <div className="flex h-full w-full flex-col items-center overflow-y-auto py-4">
            <div className="w-[95%] rounded-lg bg-primary_dark text-lg font-bold text-st_darkest md:w-4/5">
                <div className="w-full rounded-t-md bg-primary_dark text-lg font-bold text-st_darkest">
                    <div className="flex pt-1">
                        {kits.length > 0 && (
                            <Link
                                href="/admin/manage?tab=manage"
                                className={`rounded-t-md px-2 py-1 ${
                                    activeTab === 'manage'
                                        ? 'bg-st_darkest text-primary'
                                        : 'bg-primary text-st_darkest hover:bg-st_darkest hover:text-primary'
                                }`}
                            >
                                Order
                            </Link>
                        )}
                        {archivedKits.length > 0 && (
                            <Link
                                href="/admin/manage?tab=archived"
                                className={`rounded-t-md px-2 py-1 ${
                                    activeTab === 'archived'
                                        ? 'bg-st_darkest text-primary'
                                        : 'bg-primary text-st_darkest hover:bg-st_darkest hover:text-primary'
                                }`}
                            >
                                Archive
                            </Link>
                        )}
                        <Link
                            href="/admin/manage?tab=priority"
                            className={`rounded-t-md px-2 py-1 ${
                                activeTab === 'priority'
                                    ? 'bg-st_darkest text-primary'
                                    : 'bg-primary text-st_darkest hover:bg-st_darkest hover:text-primary'
                            }`}
                        >
                            Priority
                        </Link>
                    </div>
                </div>

                <div className="flex h-fit w-full flex-col items-center">
                    {kits.length > 0 &&
                        activeTab === 'manage' &&
                        kits.reverse().map((kit, i) => {
                            const last_kit = kits[i - 1] ?? kits[kits.length - 1];
                            const next_kit = kits[i + 1] ?? kits[0];

                            return (
                                <div
                                    key={kit.id.toString()}
                                    className="flex w-full flex-row items-center space-x-4 rounded-b-lg border-b-2 border-primary_dark bg-st p-1 hover:bg-primary"
                                >
                                    <div className="flex max-h-24 min-h-24 min-w-24 max-w-24 items-center justify-center rounded bg-st p-1">
                                        <Image
                                            src={kit.image_path}
                                            alt={kit.name}
                                            width={kit.width}
                                            height={kit.height}
                                            className="h-[5.5rem] w-[5.5rem] object-contain"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <form action={handleOrderChange}>
                                            <input type="hidden" name="currId" value={kit.id.toString()} />
                                            <input type="hidden" name="currOrderId" value={kit.o_id.toString()} />
                                            <input type="hidden" name="nextId" value={last_kit.id.toString()} />
                                            <input type="hidden" name="nextOrderId" value={last_kit.o_id.toString()} />
                                            <button type="submit">
                                                <IoIosArrowForward className="h-8 w-8 -rotate-90 transform cursor-pointer rounded-lg bg-st_darkest fill-primary hover:bg-primary_dark hover:fill-st_darkest" />
                                            </button>
                                        </form>

                                        <form action={handleOrderChange}>
                                            <input type="hidden" name="currId" value={kit.id.toString()} />
                                            <input type="hidden" name="currOrderId" value={kit.o_id.toString()} />
                                            <input type="hidden" name="nextId" value={next_kit.id.toString()} />
                                            <input type="hidden" name="nextOrderId" value={next_kit.o_id.toString()} />
                                            <button type="submit">
                                                <IoIosArrowForward className="h-8 w-8 rotate-90 transform cursor-pointer rounded-lg bg-st_darkest fill-primary hover:bg-primary_dark hover:fill-st_darkest" />
                                            </button>
                                        </form>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2">
                                        <Link href={`/admin/edit?id=${kit.id.toString()}`} className="">
                                            <FaEdit className="h-10 w-10 rounded-lg bg-st_darkest fill-primary p-1.5 hover:bg-primary_dark hover:fill-st_darkest" />
                                        </Link>
                                        <form action={handleSetInactive} className="flex h-fit w-fit">
                                            <input type="hidden" name="id" value={kit.id.toString()} />
                                            <button type="submit" className="h-full w-full">
                                                <MdDeleteForever className="h-10 w-10 rounded-lg bg-st_darkest fill-red-700 p-1 hover:bg-primary_dark hover:fill-red-900" />
                                            </button>
                                        </form>
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-st_darkest">{kit.name}</h3>
                                    </div>
                                </div>
                            );
                        })}
                    {prioritizedKits.length > 0 &&
                        activeTab === 'priority' &&
                        prioritizedKits.map((kit, i) => {
                            const last_kit = prioritizedKits[i - 1] ?? prioritizedKits[prioritizedKits.length - 1];
                            const next_kit = prioritizedKits[i + 1] ?? prioritizedKits[0];

                            return (
                                <div
                                    key={kit.id.toString()}
                                    className="flex w-full flex-row items-center space-x-4 rounded-lg border-b-2 border-primary_dark bg-primary p-1 hover:bg-st_lightest"
                                >
                                    <div className="flex max-h-24 min-h-24 min-w-24 max-w-24 items-center justify-center rounded bg-st p-1">
                                        <Image
                                            src={kit.image_path}
                                            alt={kit.name}
                                            width={kit.width}
                                            height={kit.height}
                                            className="h-[5.5rem] w-[5.5rem] object-contain"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <form action={handlePriorityChange}>
                                            <input type="hidden" name="currId" value={kit.id.toString()} />
                                            <input type="hidden" name="currPriorityId" value={kit.p_id.toString()} />
                                            <input type="hidden" name="nextId" value={last_kit.id.toString()} />
                                            <input type="hidden" name="nextPriorityId" value={last_kit.p_id.toString()} />
                                            <button type="submit">
                                                <IoIosArrowForward className="h-8 w-8 -rotate-90 transform cursor-pointer rounded-lg bg-st fill-primary hover:bg-primary hover:fill-st_darkest" />
                                            </button>
                                        </form>

                                        <form action={handlePriorityChange}>
                                            <input type="hidden" name="currId" value={kit.id.toString()} />
                                            <input type="hidden" name="currPriorityId" value={kit.p_id.toString()} />
                                            <input type="hidden" name="nextId" value={next_kit.id.toString()} />
                                            <input type="hidden" name="nextPriorityId" value={next_kit.p_id.toString()} />
                                            <button type="submit">
                                                <IoIosArrowForward className="h-8 w-8 rotate-90 transform cursor-pointer rounded-lg bg-st fill-primary hover:bg-primary hover:fill-st_darkest" />
                                            </button>
                                        </form>
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-st_darkest">{kit.name}</h3>
                                    </div>
                                </div>
                            );
                        })}
                    {archivedKits.length > 0 &&
                        activeTab === 'archived' &&
                        archivedKits.map((kit) => (
                            <div
                                key={kit.id.toString()}
                                className="flex w-full flex-row items-center space-x-4 rounded-lg border-b-2 border-primary_dark bg-primary p-1 hover:bg-st_lightest"
                            >
                                <div className="flex max-h-24 min-h-24 min-w-24 max-w-24 items-center justify-center rounded bg-st p-1">
                                    <Image
                                        src={kit.image_path}
                                        alt={kit.name}
                                        width={kit.width}
                                        height={kit.height}
                                        className="h-[5.5rem] w-[5.5rem] object-contain"
                                    />
                                </div>
                                <form action={handleSetActive} className="flex h-fit w-fit">
                                    <input type="hidden" name="id" value={kit.id.toString()} />
                                    <button type="submit" className="h-full w-full">
                                        <MdRestore className="h-10 w-10 rounded-lg bg-st fill-green-700 p-1 hover:bg-primary hover:fill-green-900" />
                                    </button>
                                </form>
                                <div className="flex-grow">
                                    <h3 className="font-bold text-st_darkest">{kit.name}</h3>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
