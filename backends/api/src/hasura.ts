import { fetch } from 'cross-fetch'
import { print, GraphQLFieldConfig } from 'graphql'
import { AsyncExecutor } from '@graphql-tools/utils'
import {
  RenameTypes,
  RenameRootTypes,
  RenameRootFields,
  RenameObjectFields,
  RenameInterfaceFields,
  RenameInputObjectFields,
  TransformEnumValues,
} from '@graphql-tools/wrap'
//

import { isUpperCase } from 'is-upper-case'
import { camelCase, pascalCase } from 'change-case'

import { GraphQLClient } from 'graphql-request'

export const gqlHasuraAdminClient = new GraphQLClient(
  `${process.env.HASURA_ENDPOINT_SCHEME_HTTP}://${process.env.HASURA_ENDPOINT_IP}:${process.env.HASURA_ENDPOINT_PORT}${process.env.HASURA_ENDPOINT_PATH_GRAPHQL}`,
  {
    headers: {
      'x-hasura-admin-secret': process.env
        .HASURA_GRAPHQL_ADMIN_SECRET as string,
    },
  },
)

export const getExecutor: (
  defaultHeaders?: Record<string, string>,
) => AsyncExecutor =
  (defaultHeaders?: Record<string, string>) =>
  async ({ document, variables, context }) => {
    console.log(JSON.stringify(context?.headers, null, 2))
    const query = print(document)
    const fetchResult = await fetch(
      `${process.env.HASURA_ENDPOINT_SCHEME_HTTP}://${process.env.HASURA_ENDPOINT_IP}:${process.env.HASURA_ENDPOINT_PORT}${process.env.HASURA_ENDPOINT_PATH_GRAPHQL}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...defaultHeaders,
          ...context?.headers,
        },
        body: JSON.stringify({ query, variables }),
      },
    )
    return fetchResult.json()
  }

function changeCase(
  target: string,
  change: (arg: string) => string = camelCase,
) {
  // Checking regex for preserving prefix underscore(s), which Hasura also generates.
  // If you want to remove those prefix underscores,
  // just use plain `camelCase` or `pascalCase` functions, instead of this function.
  return `${target.match(/^_+/g) || ''}${change(target)}`
}

function transformFieldConfig(fieldConfig: GraphQLFieldConfig<any, any>) {
  const newArgs: { [key: string]: any } = {}
  for (const argName in fieldConfig.args) {
    if (Object.prototype.hasOwnProperty.call(fieldConfig.args, argName)) {
      newArgs[changeCase(argName)] = fieldConfig.args[argName]
    }
  }

  // eslint-disable-next-line no-param-reassign
  fieldConfig.args = newArgs
}

export const transforms = [
  new RenameTypes((name) => changeCase(name, pascalCase)), // By convention, type name is PascalCase.
  new RenameRootTypes((name) => {
    switch (name) {
      case 'query_root':
        return 'Query'
      case 'mutation_root':
        return 'Mutation'
      case 'subscription_root':
        return 'Subscription'
      default:
        throw new Error('Root type name is not expected.')
    }
  }),
  new RenameRootFields((_operationName, fieldName, fieldConfig) => {
    transformFieldConfig(fieldConfig)
    return changeCase(fieldName)
  }),
  new RenameObjectFields((_typeName, fieldName, fieldConfig) => {
    transformFieldConfig(fieldConfig)
    return changeCase(fieldName)
  }),
  new RenameInterfaceFields((_typeName, fieldName, fieldConfig) => {
    transformFieldConfig(fieldConfig)
    return changeCase(fieldName)
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  new RenameInputObjectFields((_typeName, fieldName, _inputFieldConfig) =>
    changeCase(fieldName),
  ),
  new TransformEnumValues((_typeName, enumValue, enumValueConfig) => {
    // According to the official specification, all-caps case is recommended for enums values.
    // REF: http://spec.graphql.org/June2018/#EnumValue
    // However, hasura generates enums that represents columns
    // (ex: `user_update_column`), whose values are same as columns.
    // Thus, hereby leaving an exception.
    // If enum Value is already upper case, leave it as is.
    // If not, then change it to camel case (as column names are already modified
    // to camel case from `RenameObjectFields` above)
    const newEnumValue = isUpperCase(enumValue)
      ? enumValue
      : changeCase(enumValue)
    return [newEnumValue, enumValueConfig]
  }),
]
