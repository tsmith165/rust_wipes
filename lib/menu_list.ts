export type MenuItem = [string, string, boolean, string];

export const menu_list: MenuItem[] = [
    ['recent', 'Recent', false, '/recent?page=1&numServers=25&minPlayers=2&maxDist=5000&country=US'],
    ['upcoming', 'Upcoming', false, '/upcoming'],
    ['networks', 'Networks', false, '/networks'],
];

const menuListExport = { menu_list };
export default menuListExport;
