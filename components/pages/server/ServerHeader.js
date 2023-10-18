import React, { useState } from 'react';

const ServerHeader = ({ name, ip, port, players, maxPlayers }) => {
    const [copySuccess, setCopySuccess] = useState(false);
    const [hover, setHover] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard
            .writeText(`client.connect ${ip}:${port}`)
            .then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000); // hide tooltip after 2 seconds
            })
            .catch((err) => console.error('Could not copy text: ', err));
    };

    return (
        <div className="flex flex-col xl:flex-row justify-between font-bold bg-dark hover:bg-grey rounded-t-lg p-5">
            <h2 className="w-auto text-2xl font-bold truncate">{name}</h2>
            <div
                className="min-w-[124px] flex xl:flex-col relative rounded-lg hover:bg-primary space-x-3 xl:space-x-0"
                onClick={copyToClipboard}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{ cursor: 'pointer' }}
            >
                <div className="text-light hover:text-lg hover:font-bold">
                    IP: {ip}
                </div>
                <div className="text-light hover:text-lg hover:font-bold m-0">
                    Port: {port}
                </div>
                <div className="text-light hover:text-lg hover:font-bold m-0">
                    Players: {players}/{maxPlayers}
                </div>
                {copySuccess && (
                    <div className="absolute bottom-0 left-0 mb-[-40px] ml-2 bg-green-400 text-black px-3 py-1 rounded z-10">
                        Copy Success!
                    </div>
                )}
                {hover && !copySuccess && (
                    <div className="absolute bottom-0 left-0 mb-[-40px] ml-2 bg-grey text-white px-3 py-1 rounded z-10">
                        Click to copy server IP
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServerHeader;
