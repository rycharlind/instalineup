import LineupNbaService from './service/lineup/nba/lineup.nba.service';
import LineupNflService from './service/lineup/nfl/lineup.nfl.service';
import DataImportService from './service/data-import.service';

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
        new DataImportService().loadCsv(myArgs[1]);
        break;
}
