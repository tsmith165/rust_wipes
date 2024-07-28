'use client';

import { SignUp } from '@clerk/nextjs';

const Sign_Up = () => {
    return (
        <div className={'flex h-full w-full items-center justify-center bg-stone-950'}>
            <div className={'m-auto h-fit w-fit'}>
                <SignUp path="/signup" routing="path" />
            </div>
        </div>
    );
};

export default Sign_Up;
