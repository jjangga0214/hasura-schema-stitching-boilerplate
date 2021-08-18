import { GraphQLClient } from 'graphql-request'

import { Client } from 'pg'

export const gqlClient = new GraphQLClient(
  `${process.env.HASURA_ENDPOINT_SCHEME_HTTP}://${process.env.HASURA_ENDPOINT_IP}:${process.env.HASURA_ENDPOINT_PORT}${process.env.HASURA_ENDPOINT_PATH_GRAPHQL}`,
  {
    headers: {
      'x-hasura-admin-secret': process.env
        .HASURA_GRAPHQL_ADMIN_SECRET as string,
    },
  },
)

export const pgClient = new Client({
  user: process.env.HASURA_POSTGRES_USERNAME,
  password: process.env.HASURA_POSTGRES_PASSWORD,
  host: process.env.HASURA_POSTGRES_ENDPOINT_IP,
  port: parseInt(process.env.HASURA_POSTGRES_ENDPOINT_PORT as string, 10),
  database: process.env.HASURA_POSTGRES_DATABASE,
  ssl: process.env.HASURA_POSTGRES_SSL === 'true' || false,
})

export async function withPgClient<R>(callback: (client: Client) => R) {
  await pgClient.connect()
  try {
    return await callback(pgClient)
  } catch (error) {
    await pgClient.end()
    throw error
  }
}

export async function querySql(sql: string) {
  return withPgClient(async (client) => client.query(sql))
}
