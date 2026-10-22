import axios from "axios";
import { env } from "@/config/env";

export const api = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});