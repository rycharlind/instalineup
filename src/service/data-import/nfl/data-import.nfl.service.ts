import DataImportService from "../data-import.core.service";

export default class DataImportNflService extends DataImportService {

    constructor() {
        super();
        this.csvHeader = [
            "rank",
            "id",
            "name",
            "team",
            "position",
            "week",
            "opponent",
            "opponentRank",
            "opponentPositionRank",
            "projectedPoints",
            "fantasyPointsPerDollar",
            "operator",
            "salary"
        ];

    }

}