// import LineupService from './service/lineup.service';
import LineupService from './service/nfl/lineup.service';
import DataImportService from './service/data-import.service';

const myArgs = process.argv.slice(2);

switch (myArgs[0]) {
    case 'lineup':
        new LineupService().run();
        break;
    case 'import':
        new DataImportService().loadCsv(myArgs[1]);
        break;
}
