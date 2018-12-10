import LineupService from './service/lineup.service';
import DataImportService from './service/data-import.service'

const myArgs = process.argv.slice(2);
console.log(myArgs);

const command = myArgs[0];
switch (command) {
    case 'lineup':
        new LineupService().run();
        break;
    case 'import':
        let filePath = myArgs[1];
        new DataImportService().loadCsv(filePath);
}
