import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function ServerHeader({ name, ip, port, players, maxPlayers }) {
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
        <div className="flex flex-col justify-between rounded-t-lg bg-dark p-5 font-bold hover:bg-grey xl:flex-row">
            <h2 className="w-auto truncate text-2xl font-bold">{name}</h2>
            <div
                className="relative flex min-w-[124px] space-x-3 rounded-lg hover:bg-primary xl:flex-col xl:space-x-0"
                onClick={copyToClipboard}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{ cursor: 'pointer' }}
            >
                <div className="text-light hover:text-lg hover:font-bold">IP: {ip}</div>
                <div className="m-0 text-light hover:text-lg hover:font-bold">Port: {port}</div>
                <div className="m-0 text-light hover:text-lg hover:font-bold">
                    Players: {players}/{maxPlayers}
                </div>
                {copySuccess && (
                    <div className="absolute bottom-0 left-0 z-10 mb-[-40px] ml-2 rounded bg-green-400 px-3 py-1 text-black">
                        Copy Success!
                    </div>
                )}
                {hover && !copySuccess && (
                    <div className="absolute bottom-0 left-0 z-10 mb-[-40px] ml-2 rounded bg-grey px-3 py-1 text-white">
                        Click to copy server IP
                    </div>
                )}
            </div>
        </div>
    );
}

ServerHeader.propTypes = {
    name: PropTypes.string.isRequired,
    ip: PropTypes.string.isRequired,
    port: PropTypes.number.isRequired,
    players: PropTypes.number.isRequired,
    maxPlayers: PropTypes.number.isRequired,
};
