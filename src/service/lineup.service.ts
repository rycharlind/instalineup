import {Player} from "../model/player";
import {Lineup} from "../model/lineup";
import firebase from "firebase";
import "firebase/database";

export default class LineupService {

    public lineup: Lineup = new Lineup();
    public playerSet: Player[] = [];
    public remainingSalary: number = 50000;
    public avgRemainingSalaryPerPlayer: number;
    public numberOfStarPlayers = 3;
    public numberOfPositions = 8;

    public db: firebase.database.Database;

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

    public async run() {
        await this.init();
        this.createLineup();
    }

    public initFirebase() {
        const config = {
            apiKey: "AIzaSyDYu_6TrEWdZuCZUWmB7KaI-6qdQa1dhFM",
            authDomain: "instalineup-d7712.firebaseapp.com",
            databaseURL: "https://instalineup-d7712.firebaseio.com",
            projectId: "instalineup-d7712",
            storageBucket: "instalineup-d7712.appspot.com",
            messagingSenderId: "14475899232"
        };
        this.db = firebase.initializeApp(config).database();
    }

    public async init() {
        this.initFirebase();
        let playerSetRef = await this.db
            .ref('playerSet')
            .orderByChild('projectedPoints')
            .once('value');
        this.playerSet = playerSetRef.val();
    }

    //
    public topMix(topNumber: number) {
        let topPlayers = [];
        for (let i = 0; i < topNumber; i++) {
            topPlayers.push(this.getPlayerSetAtIndex(i));
        }
    }

    public getPlayerSetAtIndex(index: number) {
        let count = 0;
        for (let player of this.playerSet) {
            if (count == index) {
                return player;
            }
            count++;
        }
    }

    public createLineup() {
        this.addTopPlayers(this.numberOfStarPlayers);
        this.addRemainingAveragePlayers();
        console.log(this.lineup);
        console.log('Total Projected Points: ' + this.lineup.totalProjectedPoints());
        console.log('Remaining Salary: ' + this.remainingSalary);
        console.log('Avg Remaining Salary Per Player: ' + this.avgRemainingSalaryPerPlayer);
    }

    public addTopPlayers(numberOfPlayers: number) {
        let count = 0;
        for (let key of Object.keys(this.playerSet)) {
            if (count >= numberOfPlayers) {
                break;
            }
            let player = this.playerSet[key];
            if (!this.lineup[player.position].id) {
                this.lineup[player.position] = player;
                this.remainingSalary -= player.salary;
                count++
            }
        }
        this.avgRemainingSalaryPerPlayer = this.remainingSalary / (this.numberOfPositions - this.numberOfStarPlayers);
        console.log('Number of Star Players: ' + this.numberOfStarPlayers);
        console.log('Remaining Salary after Stars: ' + this.remainingSalary);
        console.log('Initial AvgRemSalary: ' + this.avgRemainingSalaryPerPlayer);
    }

    public addRemainingAveragePlayers() {
        for (let lineupPosition of Object.keys(this.lineup)) {
            if (this.isPositionOpen(lineupPosition)) {
                for (let key of Object.keys(this.playerSet)) {
                    let player = this.playerSet[key];
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

}