import {PlayerNba} from "../../player/nba/player.nba.model";
import {Lineup} from "../lineup.core.model";

export class LineupNba extends Lineup {
    PG: PlayerNba = new PlayerNba();
    SG: PlayerNba = new PlayerNba();
    SF: PlayerNba = new PlayerNba();
    PF: PlayerNba = new PlayerNba();
    C: PlayerNba = new PlayerNba();
    G: PlayerNba = new PlayerNba();
    F: PlayerNba = new PlayerNba();
    UTIL: PlayerNba = new PlayerNba();

    constructor() {
        super();
    }
}