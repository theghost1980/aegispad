import type { Account, ClientOptions } from "@hiveio/dhive";
import { Client } from "@hiveio/dhive";

const clientOptions: ClientOptions = {
  timeout: 5000,
};

const client = new Client(
  [
    "https://api.hive.blog",
    "https://api.deathwing.me",
    "https://rpc.ausbit.dev",
  ],
  clientOptions
);

export const getDHiveClient = () => client;

export async function getAccountByUsername(
  username: string
): Promise<Account | null> {
  try {
    const accounts = await client.database.getAccounts([username]);

    if (accounts && accounts.length > 0) {
      return accounts[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching account "${username}":`, error);
    return null;
  }
}

export async function searchHiveAccounts(
  prefix: string,
  limit = 5
): Promise<string[]> {
  if (!/^[a-z][a-z0-9\-\.]{2,15}$/.test(prefix)) return [];
  const accounts = await client.database.call("lookup_accounts", [
    prefix,
    limit,
  ]);
  return accounts;
}
