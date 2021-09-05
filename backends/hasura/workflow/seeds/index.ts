import faker from 'faker'
import { gql } from 'graphql-tag'
import { gqlClient } from '../client'

import { createIdentityInsertInput, createUserInsertInput } from './insert-user'

// REF: https://github.com/marak/Faker.js/#setting-a-randomness-seed
faker.seed(18927032225828788)

const gqlInsertUserMutation = gql`
  mutation insertUser($objects: [user_insert_input!]!) {
    insert_user(objects: $objects) {
      affected_rows
      returning {
        uid
        name
        identities {
          idp
          idp_id
          props
        }
        roles {
          role
        }
        task_groups {
          uid
          title
          tasks {
            uid
            title
            date
            time
            is_done
          }
        }
      }
    }
  }
`

export default async function seed() {
  const gqlInsertUserMutationVariables = {
    objects: [] as Record<string, unknown>[],
  }
  for (let index = 0; index < 10; index += 1) {
    const userInsertInput = createUserInsertInput()
    userInsertInput.identities.data.push(createIdentityInsertInput())
    for (const taskGroupFields of [
      {
        title: 'Inbox',
        color: 4293652469,
      },
      {
        title: 'Work',
        color: 4284604068,
      },
      {
        title: 'Shopping',
        color: 4294205037,
      },
      {
        title: 'Family',
        color: 4294960993,
      },
      {
        title: 'Personal',
        color: 4290148607,
      },
    ]) {
      userInsertInput.task_groups.data.push({
        uid: faker.datatype.uuid(),
        tasks: {
          data: [
            {
              uid: faker.datatype.uuid(),
              title: faker.lorem.words(),
            },
            {
              uid: faker.datatype.uuid(),
              title: faker.lorem.words(),
            },
          ],
        },
        ...taskGroupFields,
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    gqlInsertUserMutationVariables.objects.push(userInsertInput)
  }

  // eslint-disable-next-line camelcase
  const gqlInsertUserMutationResult = await gqlClient.request(
    gqlInsertUserMutation,
    gqlInsertUserMutationVariables,
  )

  return {
    ...gqlInsertUserMutationResult,
  }
}
