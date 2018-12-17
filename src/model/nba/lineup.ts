import {Player} from "./player";

export class Lineup {
    PG: Player = new Player();
    SG: Player = new Player();
    SF: Player = new Player();
    PF: Player = new Player();
    C: Player = new Player();
    G: Player = new Player();
    F: Player = new Player();
    UTIL: Player = new Player();

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