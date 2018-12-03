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
        for (let key of Object.keys(lineup)) {
            lineup[key] = this.selectPlayer(key, averageSalary);
        }
        console.log(lineup);
        console.log('Total Average PPG: ' + lineup.totalAvgPPG());
    }

    public selectPlayer(_position: string, _salary: number): Player {
        let player: Player;
        let playerSet = this.playerSetPositions[_position];
        playerSet.sort(this.compareAvePPG);
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
            return 1;
        } else if (a.avgPPG < b.avgPPG) {
            return -1;
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