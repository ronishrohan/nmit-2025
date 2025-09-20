import { backend } from "../util/axios";

async function getOrders() {
    try {
        const res = await backend.get("/fetch/manufacturingOrders")
        return res.data
    } catch (error) {
        return null
    }
}


export {getOrders}