import axios from "axios";

export const backend = axios.create({
    baseURL: "http://172.17.54.64:3000/api"
})