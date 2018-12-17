import {PlayerNfl} from "../../player/nfl/player.nfl.model";
import {Lineup} from "../lineup.core.model";

export class LineupNfl extends Lineup{
    QB: PlayerNfl = new PlayerNfl();
    RB1: PlayerNfl = new PlayerNfl();
    RB2: PlayerNfl = new PlayerNfl();
    WR1: PlayerNfl = new PlayerNfl();
    WR2: PlayerNfl = new PlayerNfl();
    WR3: PlayerNfl = new PlayerNfl();
    TE: PlayerNfl = new PlayerNfl();
    FLEX: PlayerNfl = new PlayerNfl();
    DST: PlayerNfl = new PlayerNfl();

    constructor() {
        super();
    }
}