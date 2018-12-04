import {Player} from "../../model/draftkings/player";
import {Lineup} from "../../model/draftkings/lineup";

var csv = require("fast-csv");

export default class DraftkingsLineupService {

    public csvHeader = ["rank", "id", "name", "team", "position", "opponent", "opponentRank", "opponentPositionRank", "projectedPoints", "fantasyPointsPerDollar", "operator", "salary"];
    public playerSet: Player[] = [];
    public playerSetPositions = {};
    public salaryCap = 50000;
    public salaryRemaining;
    public lineup: Lineup = new Lineup();

    public positionMap = {
        'PG': ['PG', 'SG'],
        'SG': ['PG', 'SG', 'SF'],
        'SF': ['SG', 'SF', 'PF'],
        'PF': ['SF', 'PF', 'C'],
        'C': ['PF', 'C'],
        'G': ['PG', 'SG', 'SF'],
        'F': ['SF', 'PF', 'C'],
        'UTIL': ['PG', 'SG', 'SF', 'PF', 'C']
    };

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
        // this.averagePlayersLineup();
        this.mostPointsUnderCapLineup();
    }

    //      Target Points:  287
    // -    Add top 2 (n) players in different positions
    // -    Fill the rest of the positions with players who's salaries are
    //      under the remaining average per player with the most projected points
    public mostPointsUnderCapLineup() {

        this.salaryRemaining = this.salaryCap;

        for (let position of Object.keys(this.lineup)) {
            for (let player of this.playerSet) {
                if (this.positionMap[position].includes(player.position)) {
                    if (player.salary < this.salaryRemaining) {
                        if (!this.isPlayerInLineup(player)) {
                            this.addPlayerToLineupByPosition(player, position);
                        }
                    }
                }
            }
        }


        console.log(this.lineup);
        console.log('Total Projected Points: ' + this.lineup.totalProjectedPoints());
    }

    public addTopPlayers(numberOfPlayers: number) {
        for (let i = 0; i < numberOfPlayers; i++) {

        }
    }

    public addPlayerToLineupByPosition(player: Player, position: string) {
        if (this.lineup[position].id) {
            let comparePlayer = this.lineup[position];
            if (player.projectedPoints > comparePlayer.projectedPoints) {
                this.lineup[position] = player;
                this.salaryRemaining -= player.salary;
            }
        } else {
            this.lineup[position] = player;
            this.salaryRemaining -= player.salary;
        }
    }

    public isPlayerInLineup(player: Player): boolean {
        for (let position of Object.keys(this.lineup)) {
            let comparePlayer = this.lineup[position];
            if (comparePlayer.id == player.id) {
                return true
            }
        }
        return false;
    }

    public addPlayerToLineup(player: Player) {
        let positions = this.positionMap[player.position];
        for (let position of positions) {
            if (this.lineup[position]) {
                let comparePlayer = this.lineup[position];
                if (player.projectedPoints > comparePlayer.projectedPoints) {
                    this.lineup[position] = player;
                    break;
                }
            } else {
                this.lineup[position] = player;
            }
        }
    }

    public averagePlayersLineup() {
        let lineup = new Lineup();
        let numberOfPositions = Object.keys(lineup).length;
        let averageSalary = this.salaryCap / numberOfPositions;
        for (let position of Object.keys(lineup)) {
            lineup[position] = this.selectPlayer(position, averageSalary);
        }
        console.log(lineup);
        console.log('Total Fantasy Points: ' + lineup.totalProjectedPoints());
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

    public compareProjectedPoints(a: Player, b: Player) {
        if (a.fantasyPointsPerDollar > b.fantasyPointsPerDollar) {
            return -1;
        } else if (a.fantasyPointsPerDollar < b.fantasyPointsPerDollar) {
            return 1;
        }
    }

    public convertStringsToNumbers(data: any[]) {
        for (let player of data) {
            player.id = parseInt(player.id);
            player.salary = parseInt(player.salary);
            player.projectedPoints = parseFloat(player.projectedPoints);
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
                this.addPlayersToPlayerSet('PG', tmpPlayerSet);
                this.addPlayersToPlayerSet('SG', tmpPlayerSet);
                this.addPlayersToPlayerSet('SF', tmpPlayerSet);
                this.addPlayersToPlayerSet('PF', tmpPlayerSet);
                this.addPlayersToPlayerSet('C', tmpPlayerSet);
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