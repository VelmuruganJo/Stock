import axios from "axios";

const API = axios.create({
  baseURL: "http://10.209.203.184:8080/api"
});

export default API;