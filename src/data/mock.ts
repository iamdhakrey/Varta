import { Collection, Environment, HistoryEntry, ApiRequest } from "../types";

function emptyRequest(
  id: string,
  name: string,
  method: ApiRequest["method"],
  url: string,
): ApiRequest {
  return {
    id,
    name,
    method,
    url,
    params: [{ id: "p1", key: "", value: "", enabled: true }],
    headers: [
      {
        id: "h1",
        key: "Content-Type",
        value: "application/json",
        enabled: true,
      },
    ],
    cookies: [],
    auth: { type: "none" },
    body: { raw: "{\n  \n}" },
  };
}

export const collections: Collection[] = [
  {
    id: "col-user",
    name: "User service",
    folders: [
      {
        id: "f-user",
        name: "Auth",
        requests: [
          emptyRequest(
            "r-login",
            "Login",
            "POST",
            "https://api.example.com/auth/login",
          ),
          emptyRequest(
            "r-register",
            "Register",
            "POST",
            "https://api.example.com/auth/register",
          ),
          emptyRequest(
            "r-refresh",
            "Refresh token",
            "POST",
            "https://api.example.com/auth/refresh",
          ),
        ],
      },
    ],
  },
  {
    id: "col-product",
    name: "Product service",
    folders: [
      {
        id: "f-product",
        name: "Products",
        requests: [
          emptyRequest(
            "r-create",
            "Create product",
            "POST",
            "https://api.example.com/products",
          ),
          emptyRequest(
            "r-list",
            "List products",
            "GET",
            "https://api.example.com/products",
          ),
          emptyRequest(
            "r-delete",
            "Delete product",
            "DELETE",
            "https://api.example.com/products/:id",
          ),
        ],
      },
    ],
  },
];

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
