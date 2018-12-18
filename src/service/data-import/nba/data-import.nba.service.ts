import DataImportService from "../data-import.core.service";

export default class DataImportNbaService extends DataImportService {

    constructor() {
        super();
        this.csvHeader = [
            "rank",
            "id",
            "name",
            "team",
            "position",
            "opponent",
            "opponentRank",
            "opponentPositionRank",
            "projectedPoints",
            "fantasyPointsPerDollar",
            "operator",
            "salary"
        ];
        this.league = 'nba';
    }
}