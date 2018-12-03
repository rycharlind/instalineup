import {Player} from "../../model/draftkings/player";
import {Lineup} from "../../model/lineup";

var csv = require("fast-csv");

export default class DraftkingsLineupService {

    public csvHeader = ["rank", "id", "name", "team", "position", "opponent", "opponentRank", "opponentPositionRank", "fantasyPoints", "fantasyPointsPerDollar", "operator", "salary"];
    public playerSet: Player[] = [];
    public playerSetPositions = {};
    public salaryCap = 50000;

    public run() {
        this.loadCsv('csv/fantasy-data-12-03-2018.csv');
    }

    public loadCsv(filePath: string) {
        csv.fromPath(filePath, {headers: this.csvHeader, renameHeaders: true, objectMode: true})
            .on("data", (player: Player) => {
                this.playerSet.push(player);
            })
            .on("end", () => {
                this.init();
            });
    }

    public init() {
        this.convertStringsToNumbers(this.playerSet);
        this.createPlayerSetPositions(this.playerSet);
        this.createLineups();
    }

    public createLineups() {
        this.averagePlayersLineup();
    }

    // TODO:  Top 2 players then the rest average salary

    public averagePlayersLineup() {
        let lineup = new Lineup();
        let numberOfPositions = Object.keys(lineup).length;
        let averageSalary = this.salaryCap / numberOfPositions;
        for (let key of Object.keys(lineup)) {
            lineup[key] = this.selectPlayer(key, averageSalary);
        }
        console.log(lineup);
        console.log('Total Average PPG: ' + lineup.totalAvgPPG());
    }

    public selectPlayer(_position: string, _salary: number): Player {
        let player: Player;
        let playerSet = this.getPlayerSetByPosition(_position);
        playerSet.sort(this.compareFantasyPointsPerDollar);
        for (let playerCompare of playerSet) {
            if (playerCompare.salary < _salary) {
                player = playerCompare;
            }
        }
        this.removePlayerFromAllPlayerSets(player);
        return player;
    }

    public removePlayerFromPlayerSet(_player: Player, _playerSet: Player[]) {
        for (let i = 0; i < _playerSet.length; i++) {
            let playerCompare = _playerSet[i];
            if (_player.id === playerCompare.id) {
                _playerSet.splice(i, 1);
            }
        }
    }

    public removePlayerFromAllPlayerSets(_player: Player) {
        for (let key in this.playerSetPositions) {
            let playerSet: Player[] = this.playerSetPositions[key];
            this.removePlayerFromPlayerSet(_player, playerSet);
        }
    }

    public createPlayerSetPositions(_playerSet: Player[]) {
        for (let player of _playerSet) {
            if (this.playerSetPositions[player.position]) {
                this.playerSetPositions[player.position].push(player);
            } else {
                this.playerSetPositions[player.position] = [];
                this.playerSetPositions[player.position].push(player);
            }
        }
    }

    public compareSalary(a: Player, b: Player) {
        if (a.salary > b.salary) {
            return -1;
        } else if (a.salary < b.salary) {
            return 1;
        }
    }

    public compareFantasyPointsPerDollar(a: Player, b: Player) {
        if (a.fantasyPointsPerDollar > b.fantasyPointsPerDollar) {
            return 1;
        } else if (a.fantasyPointsPerDollar < b.fantasyPointsPerDollar) {
            return -1;
        }
    }

    public convertStringsToNumbers(data: any[]) {
        for (let player of data) {
            player.id = parseInt(player.id);
            player.salary = parseInt(player.salary);
            player.fantasyPoints = parseFloat(player.fantasyPoints);
            player.fantasyPointsPerDollar = parseFloat(player.fantasyPointsPerDollar);
            player.rank = parseInt(player.rank);
            player.opponentPositionRank = parseInt(player.opponentPositionRank);
            player.opponentRank = parseInt(player.opponentRank);
        }
    }

    public getPlayerSetByPosition(position: string): Player[] {
        let tmpPlayerSet: Player[] = [];
        switch (position) {
            case 'PG':
                this.addPlayersToPlayerSet('PG', tmpPlayerSet);
                this.addPlayersToPlayerSet('SG', tmpPlayerSet);
                break;
            case 'SG':
                this.addPlayersToPlayerSet('PG', tmpPlayerSet);
                this.addPlayersToPlayerSet('SG', tmpPlayerSet);
                this.addPlayersToPlayerSet('SF', tmpPlayerSet);
                break;
            case 'SF':
                this.addPlayersToPlayerSet('SG', tmpPlayerSet);
                this.addPlayersToPlayerSet('SF', tmpPlayerSet);
                this.addPlayersToPlayerSet('PF', tmpPlayerSet);
                break;
            case 'PF':
                this.addPlayersToPlayerSet('SF', tmpPlayerSet);
                this.addPlayersToPlayerSet('PF', tmpPlayerSet);
                this.addPlayersToPlayerSet('C', tmpPlayerSet);
                break;
            case 'C':
                this.addPlayersToPlayerSet('C', tmpPlayerSet);
                this.addPlayersToPlayerSet('PF', tmpPlayerSet);
                break;
            case 'G':
                this.addPlayersToPlayerSet('PG', tmpPlayerSet);
                this.addPlayersToPlayerSet('SG', tmpPlayerSet);
                this.addPlayersToPlayerSet('SF', tmpPlayerSet);
                break;
            case 'F':
                this.addPlayersToPlayerSet('SF', tmpPlayerSet);
                this.addPlayersToPlayerSet('PF', tmpPlayerSet);
                this.addPlayersToPlayerSet('C', tmpPlayerSet);
                break;
            case 'UTIL':
                this.addPlayersToPlayerSet('SG', tmpPlayerSet);
                this.addPlayersToPlayerSet('SF', tmpPlayerSet);
                this.addPlayersToPlayerSet('PF', tmpPlayerSet);
                break;
        }
        return tmpPlayerSet;
    }

    public addPlayersToPlayerSet(_position: string, _playerSet: Player[]) {
        for (let player of this.playerSetPositions[_position]) {
            _playerSet.push(player);
        }
    }

}