import rounds from "../models/rounds.js";
import {Op} from "sequelize";

const allRounds = await rounds.findAll();

const roundsMap = {};

// filter unique rounds by round_id
for (let round of allRounds) {
    roundsMap[round.round_id] = round;
}

// Remove all rounds
for (let round of allRounds) {
    await rounds.destroy({
        where: {
            id: {
                [Op.gt]: 0,
            }
        },
    });
}

// Add all rounds
for (let round of allRounds) {
    await rounds.create(round);
}
