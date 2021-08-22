/* eslint-disable camelcase */
import axios from 'axios'
import qs from 'qs'

/**
 * REF: https://developers.naver.com/docs/login/api/
 */

interface GetAuthUrlOptions {
  client_id?: string
  redirect_uri: string
  response_type?: string
  // TODO: state as uuid
  state?: string //
}

export function getAuthUrl({
  client_id = process.env.API_OAUTH2_NAVER_CLIENT_ID,
  redirect_uri,
  response_type = 'code',
  // TODO: state as uuid
  state = '1111',
}: GetAuthUrlOptions) {
  return `https://nid.naver.com/oauth2.0/authorize?${qs.stringify({
    client_id,
    redirect_uri,
    response_type,
    // TODO: state as uuid
    state, //
    // scope 는 querystring 으로 넘기지 않고 내 어플리케이션 설정에서 미리 정해놓는 것이 default 이다.
    // scope: ['name', 'email', 'profile', 'profile_image'].join(','), //
  })}`
}

interface GetAccessTokenOptions {
  grant_type?: string
  client_id?: string
  client_secret?: string
  state?: string
  code: string
}

export async function getAccessToken({
  grant_type = 'authorization_code',
  client_id = process.env.API_OAUTH2_NAVER_CLIENT_ID,
  client_secret = process.env.API_OAUTH2_NAVER_CLIENT_SECRET,
  state = '1111',
  code,
}: GetAccessTokenOptions) {
  interface Response {
    access_token: string
    refresh_token: string
    token_type: string // e.g."bearer",
    expires_in: number // e.g. 3600
    // error?: string // 	string 	에러 코드
    // error_description?: string // 	에러 메시지
  }

  const res = await axios.get<Response>(
    `https://nid.naver.com/oauth2.0/token?${qs.stringify({
      /* grant_type
    인증 과정에 대한 구분값
    1) 발급:'authorization_code'
    2) 갱신:'refresh_token'
    3) 삭제: 'delete'
    */
      grant_type,
      client_id,
      client_secret,
      state, // TODO: state as uuid
      code,
    })}`,
  )

  return res.data.access_token
}

export interface UserInfo {
  id: string // e.g.'31029063' The id is unique by application by user. So in another application, it's different even if it's from the same user.
  profile_image: string // e.g.'https://ssl.pstatic.net/static/pwe/address/img_profile.png'
  email: string
  name: string // e.g.'길병찬'
}

export async function getUserInfo(accessToken: string): Promise<UserInfo> {
  interface Response {
    resultcode: string // e.g '00'
    message: string // e.g. 'success'
    response: UserInfo
  }

  const res = await axios.get<Response>('https://openapi.naver.com/v1/nid/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return res.data.response
}
