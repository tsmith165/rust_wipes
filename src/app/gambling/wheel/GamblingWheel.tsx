'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { spinWheel, getUserCredits } from './wheelActions';
import { WHEEL_SLOTS, DEGREES_PER_SLOT, COLOR_CODES, WheelColor, WheelPayout } from './wheelConstants';

interface WheelResult {
    start: number;
    end: number;
    color: WheelColor;
    payout: WheelPayout;
}

export default function GamblingWheel() {
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<WheelResult | null>(null);
    const [rotation, setRotation] = useState(0);
    const [steamId, setSteamId] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [credits, setCredits] = useState<number | null>(null);
    const currentRotationRef = useRef(0);

    useEffect(() => {
        if (steamId && code) {
            getUserCredits(steamId, code)
                .then(({ credits }) => setCredits(credits))
                .catch((error) => setError(error.message));
        }
    }, [steamId, code]);

    const handleSpin = async () => {
        setSpinning(true);
        setError('');
        try {
            const {
                result,
                totalRotation,
                finalDegree,
                credits: updatedCredits,
            } = await spinWheel(steamId, code, currentRotationRef.current);
            setRotation((prev) => prev + totalRotation);
            currentRotationRef.current = finalDegree;
            setCredits(updatedCredits);
            setTimeout(() => {
                setResult(result);
                setSpinning(false);
            }, 5000); // Wait for animation to complete
        } catch (error) {
            console.error('Error spinning wheel:', error);
            setError(error instanceof Error ? error.message : 'An error occurred while spinning the wheel.');
            setSpinning(false);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="mb-4 flex w-full max-w-md flex-col space-y-2">
                <input
                    type="text"
                    value={steamId}
                    onChange={(e) => setSteamId(e.target.value)}
                    placeholder="Enter your Steam ID"
                    className="rounded border p-2"
                />
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter your code"
                    className="rounded border p-2"
                />
            </div>
            {credits !== null && <p className="mb-4 text-lg font-bold">Credits: {credits}</p>}
            <div className="relative h-64 w-64">
                <motion.div
                    className="absolute h-full w-full rounded-full"
                    style={{
                        background: `conic-gradient(${WHEEL_SLOTS.map(
                            (slot, index) =>
                                `${COLOR_CODES[slot.color]} ${index * DEGREES_PER_SLOT}deg ${(index + 1) * DEGREES_PER_SLOT}deg`,
                        ).join(', ')})`,
                    }}
                    animate={{ rotate: rotation }}
                    transition={{ duration: 5, ease: 'easeInOut' }}
                />
                <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 transform rounded-full bg-white" />
            </div>
            <button
                onClick={handleSpin}
                disabled={spinning || !steamId || !code || credits === null || credits < 1}
                className="mt-4 rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
            >
                {spinning ? 'Spinning...' : 'Spin'}
            </button>
            {error && <p className="mt-2 text-red-500">{error}</p>}
            {result && <p className="mt-4">You won: {result.payout}</p>}
            <div className="mt-8 w-full max-w-md">
                <h3 className="mb-2 text-lg font-bold">Legend</h3>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(COLOR_CODES).map(([color, code]) => (
                        <div key={color} className="flex items-center">
                            <div className="mr-2 h-4 w-4" style={{ backgroundColor: code }}></div>
                            <span>{WHEEL_SLOTS.find((slot) => slot.color === color)?.payout}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
