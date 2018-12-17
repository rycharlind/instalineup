import firebase from "firebase";
import "firebase/database";

var csv = require("fast-csv");

export default class DataImportService {

    public csvHeader;
    public db: firebase.database.Database;

    public async loadCsv(filePath: string) {
        this.initFirebase();
        await this.db.ref('/playerSet').remove();
        csv.fromPath(filePath, {headers: this.csvHeader, renameHeaders: true, objectMode: true})
            .on("data", async (player: any) => {
                await this.db.ref('/playerSet').push(this.convertDataTypes(player));
            })
            .on("end", () => {
                console.log('Player Set Loaded Successfully!')
            });
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