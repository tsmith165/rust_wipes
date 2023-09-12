const axios = require('axios');
const moment = require('moment');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Scrapper {
    constructor({ apiKey, maxDaysOld, minRank }) {
        this.apiKey = apiKey;
        this.maxDaysOld = maxDaysOld;
        this.minRank = minRank;
        this.today = moment();
        this.serversParsed = 0;
        this.serversPosted = 0;
        this.serversSkipped = 0;
        this.serverAttributeStats = {};
    }

    log(message) {
        console.log(message);
    }

    async fetchServerList(api_url) {
        try {
            const response = await axios.get('YOUR_API_URL_HERE');
            this.parseServerListData(response.data);
        } catch (error) {
            console.error('API call failed: ', error);
        }
    }

    async parseServerListData(response) {
        if (!response.data) {
            console.log("Response data not present. Response output (Next Line):");
            console.log(response);
            return;
        }
        for (const server of response.data) {
            this.serversParsed++;
            const attrs = server.attributes;
            if (!attrs) {
                this.serversSkipped++;
                continue;
            }

            const id = attrs.id;
            const rank = attrs.rank;
            const name = attrs.name;
            const players = attrs.players;
            const maxPlayers = attrs.maxPlayers;
            const details = attrs.details;
            const rustDescription = details ? details.rust_description : '';
            const rustLastWipe = details ? details.rust_last_wipe : null;
            const BM_DATE_FORMAT = 'MM/DD/YYYY';
            const MY_DATE_FORMAT = 'YYYY-MM-DD';
            const wipeDateTime = rustLastWipe ? moment(rustLastWipe, BM_DATE_FORMAT) : null;
            const wipeWeekday = wipeDateTime ? wipeDateTime.isoWeekday() : null;
            const wipeDay = wipeDateTime ? wipeDateTime.date() : null;
            const forceWipe = (wipeWeekday === 4 && wipeDay < 8);

            this.log(`BM ID: ${id} | Name: ${name}`);
            this.log(`Rank: ${rank} | Players: ${players}/${maxPlayers}`);
            this.log(`Last Wipe: ${wipeDateTime ? wipeDateTime.format(MY_DATE_FORMAT) : 'N/A'} | Force Wipe?: ${forceWipe}`);

            // Server exclusion logic
            if (rank > this.minRank) {
                console.log(`Not saving servers with rank > ${this.minRank} in DB. Skipping ${name}...`);
                this.serversSkipped++;
                continue;
            }

            if (wipeDateTime && moment().diff(wipeDateTime, 'days') > this.maxDaysOld) {
                console.log(`Wipe is older than ${this.maxDaysOld} days old. Skipping...`);
                this.serversSkipped++;
                continue;
            }

            if (!wipeDateTime) {
                this.serversSkipped++;
                continue;
            }

            const serverAttributes = this.parseServerAttributes(name, rustDescription);
            const maxAttributes = this.parseGroupedAttributesForMax(serverAttributes);

            await this.insertIntoDb(id, rank, name, maxAttributes, forceWipe, wipeDateTime);

            this.serversPosted++;

            console.log('-'.repeat(60));
        }
    }

    async insertIntoDb(id, rank, title, maxAttributes, forceWipe, wipeDateTime) {
        const serverData = {
            id,
            rank,
            title,
            region: 'NA', // Update this with real data
            attrs: maxAttributes,
            wipes: [wipeDateTime.format('YYYY-MM-DD HH:mm:ss')], // Use moment to format the datetime
            force_wipes: forceWipe ? [forceWipe] : []
        };
    
        const serverParsed = {
            id,
            rank,
            title,
            region: 'NA', // Update this with real data
            wipe_schedule: maxAttributes.wipe_schedule || null,
            game_mode: maxAttributes.game_mode || null,
            resource_rate: maxAttributes.resource_rate || null,
            group_limit: maxAttributes.group_limit || null,
            primary_day: null, // Update this with real data
            primary_hour: null, // Update this with real data
        };
    
        await prisma.server_data.create({ data: serverData });
        await prisma.server_parsed.create({ data: serverParsed });
    }

    parseGroupedAttributesForMax(serverAttributes) {
        const maxAttributes = {};

        for (const [groupKey, attributes] of Object.entries(serverAttributes)) {
            if (Object.keys(attributes).length === 0) {
                continue;
            }

            // Your group limit logic
            if (groupKey === "group_limit") {
                for (const groupLimit of ["no limit", "quad", "trio", 'duo', 'solo']) {
                if (attributes[groupLimit]) {
                    maxAttributes[groupKey] = groupLimit;
                    this.serverAttributeStats[groupLimit] = (this.serverAttributeStats[groupLimit] || 0) + 1;
                    break;
                }
                }
                continue;
            }

            // Max attributes for other groups
            maxAttributes[groupKey] = Object.keys(attributes).reduce((a, b) => attributes[a] > attributes[b] ? a : b);
            this.serverAttributeStats[maxAttributes[groupKey]] = (this.serverAttributeStats[maxAttributes[groupKey]] || 0) + 1;
        }

        return maxAttributes;
    }

    parseServerAttributes(title, description) {
        title = title.toLowerCase();
        description = description.toLowerCase();

        const serverAttributes = {};

        for (const [groupKey, attributeKeys] of Object.entries(ATTRIBUTE_GROUPS)) {
            serverAttributes[groupKey] = {};
            this.serverAttributeStats[groupKey] = this.serverAttributeStats[groupKey] || {};

            for (const attribute of attributeKeys) {
                const keywords = ATTRIBUTE_KEYWORDS[attribute];
                const count = this.countKeywordsInString(keywords, title) + this.countKeywordsInString(keywords, description);
                if (count > 0) {
                    this.serverAttributeStats[groupKey][attribute] = (this.serverAttributeStats[groupKey][attribute] || 0) + count;
                }
            }
        }

        return serverAttributes;
    }

    countKeywordsInString(keywords, string) {
        return keywords.reduce((count, keyword) => count + (string.split(keyword).length - 1), 0);
    }
}

const ATTRIBUTE_KEYWORDS = {
    'biweekly': ['biweekly', 'bi-weekly', 'twice per week'],
    'weekly': ['weekly'],
    'bimonthly': ['bi-monthly', 'bimonthly', '2week', '2 week'],
    'monthly': ['monthly'],
    'pvp': ['pvp'],
    'pve': ['pve'],
    'arena': ['arena', 'gun game', 'deathmatch', 'aim train'],
    'build': ['build', 'creative', 'noclip'],
    '1x': ['1x'],
    '1.5x': ['1.5x'],
    '2x': ['2x'],
    '3x': ['3x'],
    '5x': ['5x'],
    '10x': ['10x'],
    '100x': ['100x'],
    '1000x': ['1000x'],
    'solo': ['solo'],
    'duo': ['duo'],
    'trio': ['trio'],
    'quad': ['quad'],
    'no limit': ['5 man', '6 man', 'no group limit', 'no limit', 'no max group', 'clan', 'big group', 'large group']
};

const ATTRIBUTE_GROUPS = {
    "wipe_schedule": ["biweekly", "weekly", "bimonthly", "monthly"],
    "game_mode": ["pvp", "pve", "arena", "build"],
    "resource_rate": ["1x", "1.5x", "2x", "3x", "5x", "10x", "100x", "1000x"],
    "group_limit": ["solo", "duo", "trio", "quad", "no limit"]
};

module.exports = Scrapper;