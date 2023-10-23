import rounds from "../models/rounds.js";
import {Op} from "sequelize";

const allRounds = await rounds.findAll();

const roundsMap = {};

// filter unique rounds by round_id
for (let round of allRounds) {
    roundsMap[round.round_id] = {
        ...round.dataValues
    };
}

let promisesArray = [];

// Remove all rounds
for (let round of allRounds) {
    const promise = rounds.destroy({
        where: {
            id: {
                [Op.gt]: 0,
            }
        },
    });

    promisesArray.push(promise);
}

// Add all rounds
Promise.all(promisesArray).then(() => {
    console.log('All rounds removed');
    const localPromisesArray = [];

    for (let key in roundsMap) {
        localPromisesArray.push(rounds.create(roundsMap[key]));
    }

    Promise.all(localPromisesArray).then(() => {

    })
});
