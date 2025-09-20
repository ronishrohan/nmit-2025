import axios from "axios";

export const backend = axios.create({
    baseURL: "http://172.17.54.86:3000/api"
})