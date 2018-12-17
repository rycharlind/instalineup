import {Player} from "../player.core.model";

export class Lineup {

    createAt: Date;
    league: string;

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