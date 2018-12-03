var csv = require("fast-csv");

export class Player {
    position: string;
    nameId: string;
    name: string;
    id: number;
    rosterPosition: string;
    salary: number;
    gameInfo: string;
    team: string;
    avgPPG: number;
}

export class Lineup {
    PG: Player = new Player();
    SG: Player = new Player();
    SF: Player = new Player();
    PF: Player = new Player();
    C: Player = new Player();
    G: Player = new Player();
    F: Player = new Player();
    UTIL: Player = new Player();
}

const headers = ["position", "nameId", "name", "id", "rosterPosition", "salary", "gameInfo", "team", "avgPPG"];
let playerSet: Player[] = [];
let playerSetPositions = {};
let salaryCap = 50000;

csv.fromPath("csv/dk-playerset-1.csv", {headers: headers, renameHeaders: true, objectMode: true})
    .on("data", (player: Player) => {
        playerSet.push(player);
    })
    .on("end", () => {
        init();
    });


function init() {
    convertStringsToNumbers(playerSet);
    createPlayerSetPositions(playerSet);
    createLineups();
}


function createLineups() {
    averagePlayersLineup();
}

function averagePlayersLineup() {
    let lineup = new Lineup();
    let numberOfPositions = Object.keys(lineup).length;
    let averageSalary = salaryCap / numberOfPositions;

    lineup.PG = selectPlayer('PG', averageSalary);
    lineup.SG = selectPlayer('SG', averageSalary);
    lineup.SF = selectPlayer('SF', averageSalary);
    lineup.PF = selectPlayer('PF', averageSalary);
    lineup.C = selectPlayer('C', averageSalary);
    lineup.G = selectPlayer('G', averageSalary);
    lineup.F = selectPlayer('F', averageSalary);
    lineup.UTIL = selectPlayer('UTIL', averageSalary);

    console.log(lineup);
}

function selectPlayer(position: string, salary: number): Player {
    let player: Player;
    let playerSet = getPlayerSetByPosition(position);
    playerSet.sort(compareAvePPG);
    player = playerSet[0];
    removePlayerFromAllPlayerSets(player);
    return player;
}


function getPlayerSetByPosition(position: string): Player[] {
    let tmpPlayerSet: Player[] = [];
    switch (position) {
        case 'PG':
            addPlayersToPlayerSet('PG', tmpPlayerSet);
            addPlayersToPlayerSet('SG', tmpPlayerSet);
            break;
        case 'SG':
            addPlayersToPlayerSet('PG', tmpPlayerSet);
            addPlayersToPlayerSet('SG', tmpPlayerSet);
            addPlayersToPlayerSet('SF', tmpPlayerSet);
            break;
        case 'SF':
            addPlayersToPlayerSet('SG', tmpPlayerSet);
            addPlayersToPlayerSet('SF', tmpPlayerSet);
            addPlayersToPlayerSet('PF', tmpPlayerSet);
            break;
        case 'PF':
            addPlayersToPlayerSet('SF', tmpPlayerSet);
            addPlayersToPlayerSet('PF', tmpPlayerSet);
            addPlayersToPlayerSet('C', tmpPlayerSet);
            break;
        case 'C':
            addPlayersToPlayerSet('C', tmpPlayerSet);
            addPlayersToPlayerSet('PF', tmpPlayerSet);
            break;
        case 'G':
            addPlayersToPlayerSet('PG', tmpPlayerSet);
            addPlayersToPlayerSet('SG', tmpPlayerSet);
            addPlayersToPlayerSet('SF', tmpPlayerSet);
            break;
        case 'F':
            addPlayersToPlayerSet('SF', tmpPlayerSet);
            addPlayersToPlayerSet('PF', tmpPlayerSet);
            addPlayersToPlayerSet('C', tmpPlayerSet);
            break;
        case 'UTIL':
            addPlayersToPlayerSet('SG', tmpPlayerSet);
            addPlayersToPlayerSet('SF', tmpPlayerSet);
            addPlayersToPlayerSet('PF', tmpPlayerSet);
            break;
    }
    return tmpPlayerSet;
}

function addPlayersToPlayerSet(_position: string, _playerSet: Player[]) {
    for (let player of playerSetPositions[_position]) {
        _playerSet.push(player);
    }
}

function removePlayerFromPlayerSet(player: Player, playerSet: Player[]) {
    for (let i = 0; i < playerSet.length; i++) {
        let playerCompare = playerSet[i];
        if (player.id === playerCompare.id) {
            playerSet.splice(i, 1);
        }
    }
}

function removePlayerFromAllPlayerSets(player: Player) {
    for (let key in playerSetPositions) {
        let playerSet: Player[] = playerSetPositions[key];
        removePlayerFromPlayerSet(player, playerSet);
    }
}

function createPlayerSetPositions(playerSet: Player[]) {
    for (let player of playerSet) {
        let positions = player.rosterPosition.split("/");
        for (let position of positions) {
            if (playerSetPositions[position]) {
                playerSetPositions[position].push(player);
            } else {
                playerSetPositions[position] = [];
                playerSetPositions[position].push(player);
            }
        }
    }
}

function compareSalary(a: Player, b: Player) {
    if (a.salary > b.salary) {
        return -1;
    } else if (a.salary < b.salary) {
        return 1;
    }
}

function compareAvePPG(a: Player, b: Player) {
    if (a.avgPPG > b.avgPPG) {
        return -1;
    } else if (a.avgPPG < b.avgPPG) {
        return 1;
    }
}

function convertStringsToNumbers(data: any[]) {
    for (let player of data) {
        player.id = parseInt(player.id);
        player.salary = parseInt(player.salary);
        player.avgPPG = parseInt(player.avgPPG);
    }
}