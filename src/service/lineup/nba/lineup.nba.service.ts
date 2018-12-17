import {PlayerNba} from "../../../model/player/nba/player.nba.model";
import {LineupNba} from "../../../model/lineup/nba/lineup.nba.model";
import FirebaseService from "../../../firebase/firebase.service";
import LineupCoreService from "../lineup.core.service";

export default class LineupNbaService extends LineupCoreService {

    constructor() {
        super();
        this.lineup = new LineupNba();
        this.playerSet = [PlayerNba];
        this.positionMap = {
            'PG': ['PG', 'SG'],
            'SG': ['PG', 'SG', 'SF'],
            'SF': ['SG', 'SF', 'PF'],
            'PF': ['SF', 'PF', 'C'],
            'C': ['PF', 'C'],
            'G': ['PG', 'SG', 'SF'],
            'F': ['SF', 'PF', 'C'],
            'UTIL': ['PG', 'SG', 'SF', 'PF', 'C']
        };
        this.numberOfStarPlayers = 3;
        this.numberOfPositions = 8;
    }

    public async run() {
        await this.init();
        this.createLineup();
    }

    public async init() {
        this.db = new FirebaseService().db;
        let playerSetRef = await this.db
            .ref('playerSet')
            .orderByChild('projectedPoints')
            .once('value');
        this.playerSet = playerSetRef.val();
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

}