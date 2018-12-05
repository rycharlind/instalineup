import {Player} from "../../model/draftkings/player";
import {Lineup} from "../../model/draftkings/lineup";

var csv = require("fast-csv");

export default class DraftkingsLineupService {

    public lineup: Lineup = new Lineup();
    public csvHeader = ["rank", "id", "name", "team", "position", "opponent", "opponentRank", "opponentPositionRank", "projectedPoints", "fantasyPointsPerDollar", "operator", "salary"];
    public playerSet: Player[] = [];
    public playerSetPositions = {};
    public salaryCap: number = 50000;
    public remainingSalary: number;
    public avgRemainingSalaryPerPlayer: number;
    public numberOfStarPlayers = 1;

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
        // this.createPlayerSetPositions(this.playerSet);
        this.createLineups();
    }

    public createLineups() {
        // this.averagePlayersLineup();
        this.mostPointsUnderCapLineup();
    }

    // Target Points:  287
    public mostPointsUnderCapLineup() {
        this.remainingSalary = this.salaryCap;
        this.addTopPlayers(this.numberOfStarPlayers);
        this.addRemainingAveragePlayers();

        console.log(this.lineup);
        console.log('Total Projected Points: ' + this.lineup.totalProjectedPoints());
        console.log('Remaining Salary: ' + this.remainingSalary);
        console.log('Avg Remaining Salary: ' + this.avgRemainingSalaryPerPlayer);
    }

    public addTopPlayers(numberOfPlayers: number) {
        this.playerSet.sort(this.compareProjectedPoints);
        for (let i = 0; i < numberOfPlayers; i++) {
            let player = this.playerSet[i];
            if (!this.lineup[player.position].id) {
                this.lineup[player.position] = player;
                this.remainingSalary -= player.salary;
            } else {
                numberOfPlayers++;
            }
        }
        this.avgRemainingSalaryPerPlayer = this.remainingSalary / (8 - this.numberOfStarPlayers);
        console.log('Number of Star Players: ' + this.numberOfStarPlayers);
        console.log('Remaining Salary: ' + this.remainingSalary);
        console.log('Initial AvgRemSalary: ' + this.avgRemainingSalaryPerPlayer);
    }

    public addRemainingAveragePlayers() {
        this.playerSet.sort(this.compareProjectedPoints);
        for (let lineupPosition of Object.keys(this.lineup)) {
            if (this.isPositionOpen(lineupPosition)) {
                for (let player of this.playerSet) {
                    if (this.positionMap[lineupPosition].includes(player.position)) {
                        this.addPlayerToLineupByPosition(player, lineupPosition);
                    }
                }
            }
        }
    }

    public addPlayerToLineupByPosition(newPlayer: Player, lineupPosition: string) {
        if (!this.isPlayerInLineup(newPlayer)) {
            if (newPlayer.salary < this.avgRemainingSalaryPerPlayer) {
                if (this.lineup[lineupPosition].id) {
                    let currentPlayer = this.lineup[lineupPosition];
                    if (newPlayer.projectedPoints > currentPlayer.projectedPoints) {
                        this.lineup[lineupPosition] = newPlayer;
                        this.remainingSalary += currentPlayer.salary;
                        this.remainingSalary -= newPlayer.salary;
                        this.avgRemainingSalaryPerPlayer = this.remainingSalary / this.countOpenPositions();
                    }
                } else {
                    this.lineup[lineupPosition] = newPlayer;
                    this.remainingSalary -= newPlayer.salary;
                    this.avgRemainingSalaryPerPlayer = this.remainingSalary / this.countOpenPositions();
                }
            }
        }
    }

    public countOpenPositions(): number {
        let count = 0;
        for (let position of Object.keys(this.lineup)) {
            if (!this.lineup[position].id) {
                count++;
            }
        }
        return count;
    }

    public isPositionOpen(position: string): boolean {
        if (this.lineup[position].id) {
            return false;
        }
        return true;
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

    public removePlayerFromPlayerSet(_player: Player, _playerSet: Player[]) {
        for (let i = 0; i < _playerSet.length; i++) {
            let playerCompare = _playerSet[i];
            if (_player.id === playerCompare.id) {
                _playerSet.splice(i, 1);
            }
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
        if (a.projectedPoints > b.projectedPoints) {
            return -1;
        } else if (a.projectedPoints < b.projectedPoints) {
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

}