import {Rounds, Users} from "../models/index.js";
import userPerRound from "../models/userPerRound.js";


const allRounds = await Rounds.findAll({});
for (let i = 0; i < allRounds.length; i++) {
    const round = allRounds[i]

    if (i % 50 === 0) console.log(`${i} / ${allRounds.length}`);

    for (let userId of round.users_ids) {
        const result = await userPerRound.create({
            roundId: round.round_id,
            userId: userId,
        });
    }
}

console.log('-------------------------------------------------------------')
console.log('Splitting users finished');
