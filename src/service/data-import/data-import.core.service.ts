import firebase from "firebase";
import "firebase/database";
import FirebaseService from "../../firebase/firebase.service";

var csv = require("fast-csv");

export default class DataImportService {

    public csvHeader;
    public db: firebase.database.Database;
    public date: Date;
    public league: string;

    public async loadCsv(filePath: string) {
        this.db = new FirebaseService().db;
        const path = '/' + this.league + '/playerSet';
        await this.db.ref(path).remove();
        csv.fromPath(filePath, {headers: this.csvHeader, renameHeaders: true, objectMode: true})
            .on("data", async (player: any) => {
                await this.db.ref(path).push(this.convertDataTypes(player));
            })
            .on("end", () => {
                console.log('Player Set Loaded Successfully!')
            });
    }

    public convertDataTypes(player: any): any {
        player.id = parseInt(player.id);
        player.salary = parseInt(player.salary);
        player.projectedPoints = parseFloat(player.projectedPoints);
        player.fantasyPointsPerDollar = parseFloat(player.fantasyPointsPerDollar);
        player.rank = parseInt(player.rank);
        if (player.opponentRank != 'null') {
            player.opponentRank = parseInt(player.opponentRank);
        }
        if (player.opponentPositionRank != 'null') {
            player.opponentPositionRank = parseInt(player.opponentPositionRank);
        }
        return player;
    }
}