import InputTextbox from '@/components/inputs/InputTextbox';

interface SteamSignInModalProps {
    steamInput: string;
    setSteamInput: (value: string) => void;
    code: string;
    setCode: (value: string) => void;
    onVerify: () => void;
    error?: string;
}

export default function SteamSignInModal({ steamInput, setSteamInput, code, setCode, onVerify, error }: SteamSignInModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-65">
            <div className="h-fit w-fit rounded-lg bg-stone-700 p-4">
                <div className="mb-4 flex h-full w-[90vw] flex-col items-center justify-center space-y-2 sm:w-[80vw] md:w-[60vw]">
                    {/* Header stating "Steam Profile Sign-In" */}

                    {/* Steam Profile Input */}
                    <InputTextbox
                        idName="steam_input"
                        name="Steam Profile"
                        value={steamInput}
                        onChange={(e) => setSteamInput(e.target.value)}
                        placeholder="Enter your Steam Profile URL"
                        labelWidth="lg"
                    />
                    {/* Auth Code Input */}
                    <InputTextbox
                        idName="auth_code"
                        name="Auth Code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter your code"
                        labelWidth="lg"
                    />
                    <p className="text-center text-primary_light">Type '/auth' in game to get your auth code</p>
                    <p className="text-center text-stone-400">Earn credits for every hour you spend on our servers!</p>
                    {/* Verify Button */}
                    <button
                        onClick={onVerify}
                        className="mt-2 rounded bg-primary px-4 py-2 text-stone-400 hover:bg-primary_light hover:text-stone-900"
                    >
                        Verify
                    </button>
                    {/* Error Message */}
                    {error && <p className="mt-2 text-red-500">{error}</p>}
                </div>
            </div>
        </div>
    );
}
