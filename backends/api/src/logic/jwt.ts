import jwt from 'jsonwebtoken'
import fs from 'fs'
import delay from 'delay'

const privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH as string, {
  encoding: 'utf8',
})
const publicKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH as string, {
  encoding: 'utf8',
})

export enum TokenKind {
  USER,
  SERVICE_ACCOUNT,
}

interface GqlUser {
  id: string
  uid: string
  roles: { role: string }[]
  [key: string]: any
}
export interface TokenPayload {
  kind: TokenKind
  exp: number
  iat?: number // TODO: required field
  roles: { role: string }[]
  version: 1
  user?: GqlUser
  'https://hasura.io/jwt/claims': {
    'x-hasura-allowed-roles': string[]
    'x-hasura-default-role': string
    'x-hasura-user-uid'?: string // CAUTION: Be careful! It's not Relay spec's `id` (type: ID), but `uid` (type: Uuid).
  }
  [key: string]: unknown
}

export interface SignOptions extends jwt.SignOptions {
  [key: string]: any
}

export function sign(payload: TokenPayload, options?: SignOptions) {
  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS512',
    ...options,
  })
  return token
}

/**
 * It will throw an error if the token is invalid.
 */
export function verify<T extends { [key: string]: any } = TokenPayload>(
  token: string,
  options?: jwt.VerifyOptions,
): T {
  const verifiedToken = jwt.verify(token, publicKey, {
    algorithms: ['RS512'],
    ...options,
  })
  return verifiedToken as T
}

export function createUserAccessToken(user: GqlUser, options?: SignOptions) {
  return sign({
    exp: Math.floor(Date.now() / 1000) + 1 * 60 * 60, // expires in an hours
    kind: TokenKind.USER,
    user: {
      id: user.id, // Relay spec `id` (type: ID)
      uid: user.uid,
      roles: user.roles,
    }, // duplication of roles vs user.roles is intended
    roles: user.roles,
    version: 1,
    // TODO jwt registerd claims
    'https://hasura.io/jwt/claims': {
      'x-hasura-allowed-roles': user.roles.map((r) => r.role.toLowerCase()),
      'x-hasura-default-role': 'anonymous',
      'x-hasura-user-uid': user.uid, // CAUTION: Be careful! It's not Relay spec `id` (type: ID), but `_id` (type: uuid), prefixed by `_`.
    },
    ...options,
  } as TokenPayload)
}

export function createAdminServiceAccountAccessToken(options?: SignOptions) {
  return sign({
    exp: Math.floor(Date.now() / 1000) + 5 * 60, // expires in 5 minutes
    kind: TokenKind.SERVICE_ACCOUNT,
    roles: [{ role: 'ADMIN' }],
    version: 1,
    // TODO jwt registerd claims
    'https://hasura.io/jwt/claims': {
      'x-hasura-allowed-roles': ['ADMIN'.toLowerCase()],
      'x-hasura-default-role': 'ADMIN'.toLowerCase(),
    },
    ...options,
  })
}

// eslint-disable-next-line no-underscore-dangle
let _adminServiceAccountAccessToken = createAdminServiceAccountAccessToken()

export function adminServiceAccountAccessToken() {
  return _adminServiceAccountAccessToken
}

async function refreshingAccessToken() {
  while (
    process.env.API_REFRESHING_ADMIN_SERVICEACCOUNT_ACCESS_TOKEN === 'true'
  ) {
    await delay(2 * 60 * 1000) // 2 minutes
    _adminServiceAccountAccessToken = createAdminServiceAccountAccessToken()
  }
}

refreshingAccessToken()
