/* eslint-disable camelcase */
import axios from 'axios'
import qs from 'qs'

/**
 * REF: https://developers.naver.com/docs/login/api/
 */

const redirectUri = `${process.env.FRONTEND_ENDPOINT_SCHEME}://${process.env.FRONTEND_ENDPOINT_IP}:${process.env.FRONTEND_ENDPOINT_PORT}/oauth2/callback/naver`

export function getAuthUrl() {
  const params = {
    client_id: process.env.API_OAUTH2_NAVER_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    // TODO: state as uuid
    state: 1111, //
    // scope 는 querystring 으로 넘기지 않고 내 어플리케이션 설정에서 미리 정해놓는 것이 default 이다.
    // scope: ['name', 'email', 'profile', 'profile_image'].join(','), //
  }
  return `https://nid.naver.com/oauth2.0/authorize?${qs.stringify(params)}`
}

export async function getAccessToken(code: string) {
  const params = {
    /* grant_type
    인증 과정에 대한 구분값
    1) 발급:'authorization_code'
    2) 갱신:'refresh_token'
    3) 삭제: 'delete'
    */
    grant_type: 'authorization_code',
    client_id: process.env.API_OAUTH2_NAVER_CLIENT_ID,
    client_secret: process.env.API_OAUTH2_NAVER_CLIENT_SECRET,
    code,
    state: 1111, // TODO: state as uuid
  }

  interface Response {
    access_token: string
    refresh_token: string
    token_type: string // e.g."bearer",
    expires_in: number // e.g. 3600
    // error?: string // 	string 	에러 코드
    // error_description?: string // 	에러 메시지
  }

  const res = await axios.get<Response>(
    `https://nid.naver.com/oauth2.0/token?${qs.stringify(params)}`,
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
