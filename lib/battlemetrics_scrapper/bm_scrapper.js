const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const moment = require('moment');

const { ATTRIBUTE_GROUPS, ATTRIBUTE_KEYWORDS } = require('./bm_scrapper_attributes');

const { BM_API_BASE_URL, BASE_FILTER, COUNTRY_FILTER, DISTANCE_FILTER, PLAYERS_FILTER, PAGE_LEN_FILTER, WIPE_FILTER, MY_DATE_FORMAT, BM_DATE_FORMAT, REGION_MAP } = require('./bm_scrapper_constants');

const { output_stats, insert_scrapper_stats } = require('./scrapper_stats_helper');
const { fetch_server_list, count_keywords_in_string } = require('./scrapper_generic_helper');
const { create_db_connection } = require('../db_connection_helper')

class Scrapper {
    constructor({ maxDaysOld, minRank }) {
        this.maxDaysOld = maxDaysOld;
        this.minRank = minRank;
        this.pageLength = 50;
        this.maxPages = 9999999999;
        this.distance = 5000;
        this.minPlayers = 2;
        this.country = 'US';
        this.today = moment();
        this.startTime = null;
        this.endTime = null;
        this.serversParsed = 0;
        this.serversPosted = 0;
        this.serversSkipped = 0;
        this.serverAttributeStats = {};
    }

    async run() {
        this.startTime = moment();
        let api_url = this.create_bm_server_list_api_call_string();
        let count = 0;
        
        const dbConnected = await create_db_connection(process.env.DATABASE_URL);
        if (!dbConnected) {
            console.log("Failed to connect to Database. Exiting scraper...");
            return;
        }
    
        while (count < this.maxPages) {
            count++;
            console.log(`Requesting Next Page From Battle Metrics API: Page ${count}`);
            
            const data = await fetch_server_list(api_url);
            if (!data) {
                console.log("No data returned. Exiting loop...");
                break;
            }
        
            this.parse_server_list_data(data);
        
            if (data.links && data.links.next) {
                console.log(`Going to next API call: ${data.links.next}`);
                api_url = data.links.next;
                continue;
            } else {
                console.log("No next API call found. Exiting loop...");
                break;
            }
        }
        
        this.endTime = moment();
        output_stats();
        await insert_scrapper_stats();
        await this.prisma.$disconnect();
    }

    async parse_server_list_data(response) {
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
            const wipeDateTime = rustLastWipe ? moment(new Date(rustLastWipe)).format(BM_DATE_FORMAT) : null;
            const wipeMoment = rustLastWipe ? moment(new Date(rustLastWipe)) : null; 
            const wipeWeekday = wipeMoment ? wipeMoment.isoWeekday() : null;  
            const wipeDay = wipeMoment ? wipeMoment.date() : null; 
            const force_wipe = (wipeWeekday === 4 && wipeDay < 8);

            console.log(`BM ID: ${id} | Name: ${name}`);
            console.log(`Rank: ${rank} | Players: ${players}/${maxPlayers}`);
            console.log(`Last Wipe: ${wipeDateTime ? wipeDateTime : 'N/A'} | Force Wipe?: ${force_wipe}`);

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

            const serverAttributes = this.parse_server_attributes(name, rustDescription);
            const maxAttributes = this.parse_grouped_attributes_for_max(serverAttributes);

            // Search for BM_ID already in our DB - if found, append current wipe time to array
            const [wipe_array, most_frequent_wipe, second_frequent_wipe, new_record] = await this.search_existing(id, wipeDateTime, force_wipe);

            if (new_record === false && !wipe_array) {
                console.log("Skipping because wipe time already exists.");
                continue;
            }

            const dataToInsert = {
                bm_id: id,  // from attrs.id
                rank,  // from attrs.rank
                title: name,  // from attrs.name
                attributes: maxAttributes,  // parsed attributes
                wipe_time_array: wipeDateTime,  // processed DateTime
                most_frequent_wipe: most_frequent_wipe,
                second_frequent_wipe: second_frequent_wipe, 
                new_record: new_record, 
                force_wipe: force_wipe 
            };

            await this.insert_into_db(dataToInsert);
            this.serversPosted++;
            console.log('-'.repeat(60));
        }
    }

    async insert_into_db(data) {
        const {
            bm_id, rank, title, attributes, wipe_time_array, 
            most_frequent_wipe, second_frequent_wipe, new_record, force_wipe 
        } = data;
        
        let wipe_array = [];
        let force_wipe_array = []
        let primary_wipe_time = [null, null, null]
        let second_wipe_time = [null, null, null]
        let force_wipe_time = [null, null]
        
        if (force_wipe) {
            force_wipe_time = most_frequent_wipe;
            force_wipe_array = wipe_time_array;
        } else {
            primary_wipe_time = most_frequent_wipe;
            second_wipe_time = second_frequent_wipe;
            wipe_array = wipe_time_array;
        }
        
        const [ primary_day, primary_hour, last_primary ] = primary_wipe_time;
        var { secondary_day, secondary_hour, last_secondary } = second_wipe_time;

        secondary_day = (typeof secondary_day === "number" && !isNaN(secondary_day)) ? secondary_day : null;
        secondary_hour = (typeof secondary_hour === "number" && !isNaN(secondary_hour)) ? secondary_hour : null;
        
        const { game_mode, wipe_schedule, resource_rate, group_limit } = attributes;
        
        // Use Prisma for DB Operations
        if (new_record) {
            // Insert into server_data
            await prisma.server_data.create({
            data: {
                id: parseInt(bm_id, 10),
                rank,
                title,
                region: typeof attributes.region === String ? attributes.region : 'N/A',
                attrs: attributes,
                wipes: wipe_array,
                force_wipes: force_wipe_array
            }
            });
            
            // Insert into server_parsed
            await prisma.server_parsed.create({
                data: {
                    id: parseInt(bm_id, 10),
                    rank,
                    title,
                    region: typeof attributes.region === String ? attributes.region : 'N/A',
                    wipe_schedule,
                    game_mode,
                    resource_rate,
                    group_limit,
                    primary_day,
                    primary_hour,
                    last_primary,
                    secondary_day,
                    secondary_hour,
                    last_secondary,
                    force_hour: force_wipe ? `${force_wipe_time[1]}` : null,
                    last_force: force_wipe ? force_wipe_array[0] : null
                }
            });
        } else if (force_wipe) {
            // Update server_data and server_parsed for force_wipes
            await prisma.server_data.update({
                where: { id: parseInt(bm_id, 10) },
                data: { rank, title, attrs: attributes, wipes: wipe_array, force_wipes: force_wipe_array }
            });
            await prisma.server_parsed.update({
                where: { id: parseInt(bm_id, 10) },
                data: {
                    force_hour: `${force_wipe_time[1]}`,
                    last_force: force_wipe_array[0],
                    wipe_schedule,
                    game_mode,
                    resource_rate,
                    group_limit
                }
            });
        } else {
            // Update server_data and server_parsed for regular wipes
            await prisma.server_data.update({
                where: { id: parseInt(bm_id, 10) },
                data: { rank, title, attrs: attributes, wipes: wipe_array, force_wipes: force_wipe_array }
            });
            await prisma.server_parsed.update({
                where: { id: parseInt(bm_id, 10) },
                data: {
                    primary_day: parseInt(primary_day, 10),
                    primary_hour: parseInt(primary_hour, 10),
                    last_primary,
                    secondary_day: parseInt(secondary_day, 10) || null,
                    secondary_hour: parseInt(secondary_hour, 10) || null,
                    last_secondary: last_secondary || null,
                    wipe_schedule: wipe_schedule || null,
                    game_mode: game_mode || null,
                    resource_rate: resource_rate || null,
                    group_limit: group_limit || null
                }
            });
        }
    }

    async search_existing(bm_id, wipe_time, force_wipe = false) {
        const field_str = force_wipe ? 'force_wipes' : 'wipes';
        const server_data = await prisma.server_data.findUnique({
            where: { id: parseInt(bm_id, 10) },
            select: { wipes: true, force_wipes: true }
        });
    
        let new_record = false;
    
        if (!server_data) {
            console.log(`No existing records found matching Battle Metrics ID: ${bm_id}`);
            new_record = true;
            
            const wipeMoment = moment(wipe_time);
            const wipe = wipeMoment.format(MY_DATE_FORMAT);
            const weekday = wipeMoment.isoWeekday();
            let hour = wipeMoment.hour();
            const minute = wipeMoment.minute();
            if (minute > 45) hour += 1;
    
            return [[wipe_time], [weekday, hour, wipe], [null, null, null], new_record];
        }
    
        console.log(`Found pre-existing data in our DB for Battle Metrics ID: ${bm_id}`);
        console.log(server_data);
    
        var wipe_array = force_wipe ? server_data.force_wipes : server_data.wipes;

        if (!wipe_array) {
            console.log("Wipe array is null. Creating a new array...");
            wipe_array = []; // initialize it as an empty array
        }
    
        if (wipe_array.includes(wipe_time)) {
            console.log("Wipe time already exists in wipe array. Skipping...");
            return [null, null, null, false];
        }
    
        console.log("Wipe time does not exist in wipe array. Adding current wipe time to wipe array...");
        wipe_array.unshift(wipe_time);
    
        const wipe_dict = this.create_wipe_timestamp_dict(wipe_array, false);
        const { most_frequent_wipe, second_frequent_wipe } = this.determine_frequent_wipes(wipe_dict);
    
        return [wipe_array, most_frequent_wipe, second_frequent_wipe, new_record];
    }

    determine_frequent_wipes(wipe_dict) {
        let most_frequent_day = null;
        let most_frequent_hour = null;
        let most_frequent_hour_count = null;
        let most_frequent_timestamp = null;
        
        let second_frequent_day = null;
        let second_frequent_hour = null;
        let second_frequent_hour_count = null;
        let second_frequent_timestamp = null;
        
        for (const [day, hours] of Object.entries(wipe_dict)) {
            const first_timestamp = hours['first_timestamp'];
            
            for (const [hour, hour_count] of Object.entries(hours)) {
                if (hour === "first_timestamp") continue;
                
                if (most_frequent_hour_count === null) {
                    most_frequent_hour_count = hour_count;
                    most_frequent_day = day;
                    most_frequent_hour = hour;
                    most_frequent_timestamp = first_timestamp;
                } else if (hour_count > most_frequent_hour_count) {
                    second_frequent_hour_count = most_frequent_hour_count;
                    second_frequent_day = most_frequent_day;
                    second_frequent_hour = most_frequent_hour;
                    second_frequent_timestamp = most_frequent_timestamp;
                    
                    most_frequent_hour_count = hour_count;
                    most_frequent_day = day;
                    most_frequent_hour = hour;
                    most_frequent_timestamp = first_timestamp;
                } else if (second_frequent_hour_count === null || (hour_count > second_frequent_hour_count && hour !== most_frequent_hour)) {
                    second_frequent_hour_count = hour_count;
                    second_frequent_day = day;
                    second_frequent_hour = hour;
                    second_frequent_timestamp = first_timestamp;
                }
            }
        }
        
        return {
            most_frequent_wipe: [most_frequent_day, most_frequent_hour, most_frequent_timestamp],
            second_frequent_wipe: [second_frequent_day, second_frequent_hour, second_frequent_timestamp]
        };
    }

    parse_grouped_attributes_for_max(serverAttributes) {
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

    parse_server_attributes(title, description) {
        title = title.toLowerCase();
        description = description.toLowerCase();

        const serverAttributes = {};

        for (const [groupKey, attributeKeys] of Object.entries(ATTRIBUTE_GROUPS)) {
            serverAttributes[groupKey] = {};
            this.serverAttributeStats[groupKey] = this.serverAttributeStats[groupKey] || {};

            for (const attribute of attributeKeys) {
                const keywords = ATTRIBUTE_KEYWORDS[attribute];
                const count = count_keywords_in_string(keywords, title) + count_keywords_in_string(keywords, description);
                if (count > 0) {
                    this.serverAttributeStats[groupKey][attribute] = (this.serverAttributeStats[groupKey][attribute] || 0) + count;
                }
            }
        }

        return serverAttributes;
    }

    create_wipe_timestamp_dict(wipe_array = [], logOut = false) {
        const wipeDict = {};
    
        for (const wipe of wipe_array) {
            if (!wipe) continue;
    
            const wipeDate = moment(wipe);
            const weekday = wipeDate.day() + 1;  // Moment's day() gets the day of the week (0 = Sunday, 6 = Saturday). We want 1 = Monday, 7 = Sunday (I think?)
            const hour = wipeDate.hour();
            const minute = wipeDate.minute();
    
            let roundedHour = minute > 45 ? hour + 1 : hour;
            roundedHour = roundedHour > 23 ? 0 : roundedHour;
    
            if (logOut) console.log(`Cur day: ${weekday} | Cur Hour: ${roundedHour}`);
    
            if (!wipeDict[weekday]) {
                wipeDict[weekday] = { [roundedHour]: 1, 'first_timestamp': wipe };
            } else {
                if (!wipeDict[weekday][roundedHour]) {
                    wipeDict[weekday][roundedHour] = 1;
                } else {
                    wipeDict[weekday][roundedHour] += 1;
                }
            }
        }
    
        if (logOut) console.log(`WIPE DICT (NEXT LINE): \n${JSON.stringify(wipeDict)}`);
        return wipeDict;
    }

    create_bm_server_list_api_call_string() {
        var api_call_string = `${BM_API_BASE_URL}?${BASE_FILTER}&${COUNTRY_FILTER}=${this.country}&${DISTANCE_FILTER}=${this.distance}&${PLAYERS_FILTER}=${this.minPlayers}&${PAGE_LEN_FILTER}=${this.pageLength}&${WIPE_FILTER}`;
        console.log(`Server List API Call: ${api_call_string}`);

        return api_call_string
    }
}

module.exports = Scrapper;