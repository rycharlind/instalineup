import {Player} from "../model/player";
import {Lineup} from "../model/lineup";
var csv = require("fast-csv");

export default class LineupService {

    public csvHeader = ["position", "nameId", "name", "id", "rosterPosition", "salary", "gameInfo", "team", "avgPPG"];
    public playerSet: Player[] = [];
    public playerSetPositions = {};
    public salaryCap = 50000;
    
    public run() {
        this.loadCsv('csv/dk-playerset-1.csv');
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

    public averagePlayersLineup() {
        let lineup = new Lineup();
        let numberOfPositions = Object.keys(lineup).length;
        let averageSalary = this.salaryCap / numberOfPositions;

        lineup.PG = this.selectPlayer('PG', averageSalary);
        lineup.SG = this.selectPlayer('SG', averageSalary);
        lineup.SF = this.selectPlayer('SF', averageSalary);
        lineup.PF = this.selectPlayer('PF', averageSalary);
        lineup.C = this.selectPlayer('C', averageSalary);
        lineup.G = this.selectPlayer('G', averageSalary);
        lineup.F = this.selectPlayer('F', averageSalary);
        lineup.UTIL = this.selectPlayer('UTIL', averageSalary);

        console.log(lineup);
    }

    public selectPlayer(_position: string, _salary: number): Player {
        let player: Player;
        let playerSet = this.getPlayerSetByPosition(_position);
        playerSet.sort(this.compareAvePPG);
        player = playerSet[0];
        this.removePlayerFromAllPlayerSets(player);
        return player;
    }


    public getPlayerSetByPosition(_position: string): Player[] {
        let playerSet: Player[] = [];
        switch (_position) {
            case 'PG':
                this.addPlayersToPlayerSet('PG', playerSet);
                this.addPlayersToPlayerSet('SG', playerSet);
                break;
            case 'SG':
                this.addPlayersToPlayerSet('PG', playerSet);
                this.addPlayersToPlayerSet('SG', playerSet);
                this.addPlayersToPlayerSet('SF', playerSet);
                break;
            case 'SF':
                this.addPlayersToPlayerSet('SG', playerSet);
                this.addPlayersToPlayerSet('SF', playerSet);
                this.addPlayersToPlayerSet('PF', playerSet);
                break;
            case 'PF':
                this.addPlayersToPlayerSet('SF', playerSet);
                this.addPlayersToPlayerSet('PF', playerSet);
                this.addPlayersToPlayerSet('C', playerSet);
                break;
            case 'C':
                this.addPlayersToPlayerSet('C', playerSet);
                this.addPlayersToPlayerSet('PF', playerSet);
                break;
            case 'G':
                this.addPlayersToPlayerSet('PG', playerSet);
                this.addPlayersToPlayerSet('SG', playerSet);
                this.addPlayersToPlayerSet('SF', playerSet);
                break;
            case 'F':
                this.addPlayersToPlayerSet('SF', playerSet);
                this.addPlayersToPlayerSet('PF', playerSet);
                this.addPlayersToPlayerSet('C', playerSet);
                break;
            case 'UTIL':
                this.addPlayersToPlayerSet('SG', playerSet);
                this.addPlayersToPlayerSet('SF', playerSet);
                this.addPlayersToPlayerSet('PF', playerSet);
                break;
        }
        return playerSet;
    }

    public addPlayersToPlayerSet(_position: string, _playerSet: Player[]) {
        for (let player of this.playerSetPositions[_position]) {
            _playerSet.push(player);
        }
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
            let positions = player.rosterPosition.split("/");
            for (let position of positions) {
                if (this.playerSetPositions[position]) {
                    this.playerSetPositions[position].push(player);
                } else {
                    this.playerSetPositions[position] = [];
                    this.playerSetPositions[position].push(player);
                }
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

    public compareAvePPG(a: Player, b: Player) {
        if (a.avgPPG > b.avgPPG) {
            return -1;
        } else if (a.avgPPG < b.avgPPG) {
            return 1;
        }
    }

    public convertStringsToNumbers(data: any[]) {
        for (let player of data) {
            player.id = parseInt(player.id);
            player.salary = parseInt(player.salary);
            player.avgPPG = parseInt(player.avgPPG);
        }
    }


}