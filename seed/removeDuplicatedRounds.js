import rounds from "../models/rounds.js";
import {Op} from "sequelize";

const removeDuplication = async (model, keyToDelete, condition) => {

    const allRounds = await model.findAll();

    const roundsMap = {};

// filter unique rounds by round_id
    for (let round of allRounds) {
        roundsMap[round[keyToDelete]] = {
            ...round.dataValues
        };
    }

    let promisesArray = [];

    // Remove all rounds
    for (let round of allRounds) {
        const promise = model.destroy({
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
        console.log(`All ${model.tableName} removed`);
        const localPromisesArray = [];

        model.bulkCreate(roundsMap.values())
    });
}

