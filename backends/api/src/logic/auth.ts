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
  idp: 'GOOGLE' | 'FACEBOOK' | 'KAKAO' | 'NAVER'
  platform: 'ANDROID' | 'IOS' | 'WEB'
}

/**
 * throws an error
 *   - if code is invalid
 *   - if identifyUser fails
 *   - if insertUser fails
 */
export async function signInOrUp({ code, idp, platform }: SignInOrUpOptions) {
  const taskerBaseEndpoint = `${process.env.TASKER_ENDPOINT_SCHEME}://${process.env.TASKER_ENDPOINT_IP}:${process.env.TASKER_ENDPOINT_PORT}`
  const userInfo = await (async () => {
    if (idp === 'GOOGLE') {
      const redirectUri = `${taskerBaseEndpoint}/oauth2/callback/google`
      return google.getUserInfo(
        await google.getAccessToken({ code, redirectUri }),
      )
    }
    if (idp === 'FACEBOOK') {
      const redirectUri = `${taskerBaseEndpoint}/oauth2/callback/facebook`
      return facebook.getUserInfo(
        await facebook.getAccessToken({ code, redirect_uri: redirectUri }),
      )
    }
    if (idp === 'NAVER') {
      // let redirectUri = `${taskerBaseEndpoint}/oauth2/callback/naver`
      return naver.getUserInfo(await naver.getAccessToken({ code }))
    }
    if (idp === 'KAKAO') {
      let redirectUri = `${taskerBaseEndpoint}/oauth2/callback/kakao`
      if (platform === 'ANDROID' || platform === 'IOS') {
        redirectUri = `kakao${process.env.TASKER_OAUTH2_KAKAO_CLIENT_ID}://oauth`
      }
      return kakao.getUserInfo(
        await kakao.getAccessToken({ code, redirect_uri: redirectUri }),
      )
    }
    throw new Error('idp is invalid')
  })()

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
