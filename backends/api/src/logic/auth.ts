import assert from 'assert'
import { gql } from 'graphql-tag'
import { google, facebook, kakao, naver } from './oauth2'
import * as jwt from './jwt'
import { gqlHasuraAdminClient } from '../hasura'

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
      }
    }
  }
`

const gqlIdentityUserQuery = gql`
  query identifyUser($idp: idp_enum!, $idp_id: String!) {
    identity_connection(
      where: { idp: { _eq: $idp }, idp_id: { _eq: $idp_id } }
    ) {
      edges {
        node {
          idp
          idp_id
          user {
            uid
            roles {
              role
            }
          }
        }
      }
    }
  }
`

interface SignInOrUpOptions {
  code: string
  idp: string
}

/**
 * throws an error
 *   - if code is invalid
 *   - if identifyUser fails
 *   - if insertUser fails
 */
export async function signInOrUp({ code, idp }: SignInOrUpOptions) {
  const oauth2Client = (() => {
    switch (idp) {
      case 'GOOGLE':
        return google
      case 'FACEBOOK':
        return facebook
      case 'NAVER':
        return naver
      case 'KAKAO':
        return kakao
      default:
        throw new Error('idp is invalid')
    }
  })()

  const idpAccessToken = await oauth2Client.getAccessToken(code)
  const userInfo = await oauth2Client.getUserInfo(idpAccessToken)

  const {
    identity_connection: { edges },
  } = await gqlHasuraAdminClient.request(gqlIdentityUserQuery, {
    idp,
    idp_id: userInfo.id,
  })

  const { result, user } = await (async () => {
    if (edges.length) {
      assert(
        edges.length === 1,
        `idp_id, ${userInfo.id}, is not unique for ${idp}.`,
      )
      const { user } = edges[0].node
      return { result: 'SIGN_IN', user }
    }

    // eslint-disable-next-line camelcase
    const { insert_user } = await gqlHasuraAdminClient.request(
      gqlInsertUserMutation,
      {
        objects: [
          {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            name: userInfo.name || userInfo.kakao_account?.profile?.nickname,
            roles: {
              data: [
                {
                  role: 'USER',
                },
              ],
            },
            identities: {
              data: [
                {
                  idp,
                  idp_id: userInfo.id,
                  props: userInfo,
                },
              ],
            },
          },
        ],
      },
    )

    const user = insert_user?.returning[0]
    assert(user, 'user is not inserted.')
    return { result: 'SIGN_UP', user }
  })()

  /**
   * In graphql, role is enum, which is uppercase by default.
   * In hasura's permission system, role should be lowercase.
   * Thus, case should be transformed.
   */
  const accessToken = jwt.createUserAccessToken(user)

  // const refreshToken = jwt.sign({ // TODO
  //   exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60, // expires in 2 weeks
  //   id: user.id, // Relay spec `id` (type: ID)
  //   _id: user._id,
  //   role: user.role,
  //   version: 1,
  //   ip: '',
  //   region:'',
  //   os: '',
  //   browser: '',
  // })

  return {
    result,
    // user: {
    //   id: user.id,
    // },
    id: user.id,
    accessToken,
    // refresh_token: refreshToken, // TODO
  }
}
