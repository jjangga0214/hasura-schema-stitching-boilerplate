import path from 'path'
import { loadSchema } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { addResolversToSchema } from '@graphql-tools/schema'
import { signInOrUp } from './logic/auth'

const resolvers = {
  Mutation: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    signInOrUp: async (_, { input: { code, idp } }) => {
      console.log(code, idp)
      return signInOrUp({ code, idp })
    },
  },
  Query: {
    ping: () => new Date().toISOString(),
  },
}

export async function getAdditionalSchema() {
  const schema = await loadSchema(
    path.join(__dirname, '..', 'schema.additional.graphql'),
    {
      // load from a single schema file
      loaders: [new GraphQLFileLoader()],
    },
  )
  return addResolversToSchema({
    schema,
    resolvers,
  })
}
