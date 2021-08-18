import { ApolloServer, AuthenticationError } from 'apollo-server'
// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
import { stitchSchemas } from '@graphql-tools/stitch'
import { introspectSchema } from '@graphql-tools/wrap'
import * as jwt from './logic/jwt'

import { getExecutor, transforms } from './hasura'

async function main() {
  const schema = stitchSchemas({
    subschemas: [
      {
        schema: await introspectSchema(
          getExecutor({
            'x-hasura-admin-secret': process.env
              .HASURA_GRAPHQL_ADMIN_SECRET as string,
          }),
        ),
        executor: getExecutor(),
        transforms,
        // merge:{
        //   User: {

        //   }
        // }
      },
    ],
  })

  const server = new ApolloServer({
    schema,
    introspection: true,
    // eslint-disable-next-line spaced-comment, @typescript-eslint/ban-ts-comment
    //@ts-ignore
    context: ({ req, connection }) => {
      const headers: { [key: string]: any } =
        (connection && connection.context ? connection.context : req.headers) ||
        {}

      const accessToken = (() => {
        if (headers.authorization) {
          try {
            const tokenValue = (headers.authorization as string).replace(
              'Bearer ',
              '',
            )
            return {
              payload: jwt.verify(tokenValue),
              value: tokenValue,
            }
          } catch (error) {
            const message = 'Authorization header is invalid format'
            // logger.error({
            //   from: 'main',
            //   error,
            //   message,
            // })
            throw new AuthenticationError(message)
          }
        }
        return undefined
      })()

      return { headers, accessToken }
    },
  })

  // The `listen` method launches a web server.
  server
    .listen({
      port: process.env.API_ENDPOINT_PORT || process.env.PORT,
    })
    .then(({ url }) => {
      console.log(`🚀  Server ready at ${url}`)
    })
}

main()
