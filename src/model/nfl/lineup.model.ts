import {Player} from "./player.model";

export class Lineup {
    QB: Player = new Player();
    RB1: Player = new Player();
    RB2: Player = new Player();
    WR1: Player = new Player();
    WR2: Player = new Player();
    WR3: Player = new Player();
    TE: Player = new Player();
    FLEX: Player = new Player();
    DST: Player = new Player();

    constructor() {
    }

    public totalProjectedPoints(): number {
        let total = 0;
        for (let key of Object.keys(this)) {
            let player: Player = this[key];
            if (player.id) {
                total += player.projectedPoints;
            }
        }
        return total;
    }
}