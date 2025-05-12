import type { Account, ClientOptions, Discussion } from "@hiveio/dhive";
import { Client } from "@hiveio/dhive";

export interface HivePost {
  author: string;
  permlink: string;
  title: string;
  body: string;
  json_metadata: string; // Podrías parsearlo si necesitas acceder a las tags, etc.
  created: string; // Fecha en formato ISO
  // Añade más campos según necesites (ej. net_votes, children, etc.)
}

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

/**
 * Obtiene las últimas publicaciones de un usuario.
 * @param username El nombre de usuario de Hive.
 * @param limit El número de publicaciones a obtener.
 * @returns Una promesa que se resuelve con un array de publicaciones.
 */
export async function getUserPosts(
  username: string,
  limit: number = 10
): Promise<HivePost[]> {
  try {
    const query = {
      tag: username,
      limit: limit,
    };
    // Usamos 'any' temporalmente para la respuesta de getDiscussions si los tipos de dhive no son perfectos
    const result: Discussion[] = await client.database.getDiscussions(
      "blog",
      query
    );

    // Mapeamos a nuestra interfaz HivePost simplificada
    return result.map((post: Discussion) => ({
      author: post.author,
      permlink: post.permlink,
      title: post.title,
      body: post.body,
      json_metadata: post.json_metadata,
      created: post.created,
    }));
  } catch (error) {
    console.error(`Error al obtener publicaciones para ${username}:`, error);
    throw error; // Re-lanza el error para que el componente que llama pueda manejarlo
  }
}
