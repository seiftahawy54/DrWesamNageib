import {Discounts} from "../../models/index.js";

const createNewCoupon = async () => {
    return Discounts.create({
        percentage: 10,
        discountCode: "test",
        status: true,
    })
}


export default createNewCoupon
