import {Rounds, Users} from "../models/index.js";
import userPerRound from "../models/userPerRound.js";


const allRounds = await Rounds.findAll({});
for (let round of allRounds) {
    for (let userId of round.users_ids) {
        const result = await userPerRound.create({
            roundId: round.round_id,
            userId: userId,
        });

        console.log(result)
        // console.log(userId)
    }
}
