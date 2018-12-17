import LineupNbaService from './service/lineup/nba/lineup.nba.service';
import LineupNflService from './service/lineup/nfl/lineup.nfl.service';
import DataImportNbaService from "./service/data-import/nba/data-import.nba.service";
import DataImportNflService from "./service/data-import/nfl/data-import.nfl.service";

const myArgs = process.argv.slice(2);

switch (myArgs[0]) {
    case 'lineup':
        switch (myArgs[1]) {
            case 'nba':
                new LineupNbaService().run();
                break;
            case 'nfl':
                new LineupNflService().run();
                break;
        }
        break;
    case 'import':
        switch (myArgs[1]) {
            case 'nba':
                new DataImportNbaService().loadCsv(myArgs[2]);
                break;
            case 'nfl':
                new DataImportNflService().loadCsv(myArgs[2]);
                break;
        }
        break;
}
