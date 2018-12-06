import LineupService from './service/lineup.service';
import DataImportService from './service/data-import.service'

// let dataImporter = new DataImportService();
// dataImporter.loadCsv('csv/fantasy-data-12-05-18.csv');

let lineupService = new LineupService();
lineupService.run();