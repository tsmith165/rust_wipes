const axios = require('axios');

async function fetch_server_list(api_url) {
    console.log(`Fetching server list from API with URL: ${api_url}`);
    try {
        const response = await axios.get(api_url);
        return response.data;
    } catch (error) {
        console.error('API call failed: ', error);
        return null;
    }
}

function count_keywords_in_string(keywords, string) {
    return keywords.reduce((count, keyword) => count + (string.split(keyword).length - 1), 0);
}

module.exports = {
    fetch_server_list,
    count_keywords_in_string
};