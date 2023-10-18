import React from 'react';

const region_dict = {
    NA: 'North America',
    EU: 'Europe',
};

const ServerInfoPanel = ({ bm_api_attributes, database_data }) => {
    if (!bm_api_attributes || !database_data)
        return <p>Error loading server data.</p>;

    console.log('BM API Attributes: ', bm_api_attributes);
    console.log('Database Data: ', database_data);

    const { details, rank } = bm_api_attributes;
    const { rust_last_wipe } = details;
    const { resource_rate, group_limit, region } = database_data;

    // Validate and log the date string
    console.log(`Rust Last Wipe (string): ${rust_last_wipe}`);
    if (!rust_last_wipe) {
        console.error('Rust Last Wipe is null or undefined!');
    }

    // Parse the date string
    const last_wipe_date = new Date(rust_last_wipe);

    // Log the parsed date
    console.log(`Rust Last Wipe (date): ${last_wipe_date}`);

    // Validate the parsed date
    if (isNaN(last_wipe_date)) {
        console.error('Invalid Date Object created!');
    }

    const now = new Date();
    const seconds_since_last_wipe = Math.floor((now - last_wipe_date) / 1000);

    console.log(
        `Last Wipe Date: ${last_wipe_date} | Seconds Since Last Wipe: ${seconds_since_last_wipe}`,
    );

    const server_info_data = [
        { title: 'Server Rank', value: rank },
        {
            title: 'Server Region',
            value: region in region_dict ? region_dict[region] : region,
        },
        { title: 'Last Wipe Time', value: last_wipe_date.toLocaleString() }, // Already a date object
        { title: 'Seconds Since Wipe', value: seconds_since_last_wipe },
        { title: 'Resource Rate', value: resource_rate },
        { title: 'Group Limit', value: group_limit },
    ];

    return (
        <div className="bg-dark hover:bg-grey rounded-lg p-2.5">
            <h3 className="text-lg font-bold mb-2 ">Server Info</h3>
            {server_info_data.map(({ title, value }) => (
                <p
                    className="hover:font-bold hover:text-md hover:text-lg hover:text-light"
                    key={title}
                >
                    {title}: {value}
                </p>
            ))}
        </div>
    );
};

export default ServerInfoPanel;
