import {  Environment, HistoryEntry } from "../types";



export const environments: Environment[] = [
  { id: "env-local", name: "Local" },
  { id: "env-staging", name: "Staging" },
  { id: "env-prod", name: "Production" },
];

export const historyEntries: HistoryEntry[] = [
  {
    id: "h1",
    method: "POST",
    url: "https://api.example.com/auth/login",
    status: 200,
    timestamp: "10:42 AM",
    durationMs: 124,
  },
  {
    id: "h2",
    method: "GET",
    url: "https://api.example.com/products",
    status: 200,
    timestamp: "10:39 AM",
    durationMs: 88,
  },
  {
    id: "h3",
    method: "DELETE",
    url: "https://api.example.com/products/41",
    status: 204,
    timestamp: "10:31 AM",
    durationMs: 52,
  },
  {
    id: "h4",
    method: "POST",
    url: "https://api.example.com/products",
    status: 422,
    timestamp: "10:20 AM",
    durationMs: 140,
  },
];
