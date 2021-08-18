/* eslint-disable camelcase */
import axios from 'axios'
import qs from 'qs'
import { Overwrite } from 'utility-types'

/**
 * REF: https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api
 */

const redirectUri = `${process.env.FRONTEND_ENDPOINT_SCHEME}://${process.env.FRONTEND_ENDPOINT_IP}:${process.env.FRONTEND_ENDPOINT_PORT}/oauth2/callback/kakao`

export function getAuthUrl() {
  const params = {
    client_id: process.env.API_OAUTH2_KAKAO_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    // scope 는 querystring 으로 넘기지 않고 내 어플리케이션 설정에서 미리 정해놓는다.
    // TODO: not using state?
    state: 1111,
  }
  return `https://kauth.kakao.com/oauth/authorize?${qs.stringify(params)}`
}

export async function getAccessToken(code: string) {
  const params = {
    grant_type: 'authorization_code',
    client_id: process.env.API_OAUTH2_KAKAO_CLIENT_ID,
    client_secret: process.env.API_OAUTH2_KAKAO_CLIENT_SECRET,
    redirect_uri: redirectUri,
    code,
  }

  interface Response {
    token_type: 'bearer' //	토큰 타입, bearer로 고정
    access_token: string //	사용자 액세스 토큰 값
    expires_in: number //	액세스 토큰 만료 시간(초)
    refresh_token: string //	사용자 리프레시 토큰 값
    refresh_token_expires_in: number //	리프레시 토큰 만료 시간(초)
    scope: string // 인증된 사용자의 정보 조회 권한 범위. 범위가 여러 개일 경우, 공백으로 구분
  }

  const res = await axios.post<Response>(
    `https://kauth.kakao.com/oauth/token`,
    qs.stringify(params),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    },
  )

  return res.data.access_token
}

export interface UserInfo {
  id: string //	회원번호. e.g. 1656134617
  connected_at: string // Datetime (RFC3339 internet date/time format) e.g. '2021-03-10T06:41:45Z'

  kakao_account: {
    profile_needs_agreement: boolean
    profile: {
      nickname: string // e.g. '길병찬'
      thumbnail_image_url?: string
      profile_image_url?: string
    }
    has_email: boolean
    email_needs_agreement: boolean
    is_email_valid: boolean
    is_email_verified: boolean
    email: string
  }
  // properties?: { // JSON 사용자 프로퍼티 (Property)
  //   nickname: string // e.g. '길병찬'
  //   [key: string]: any
  // }
}

export async function getUserInfo(accessToken: string): Promise<UserInfo> {
  /**
   * Why using <Overwrite<UserInfo, { id: number }>> ?
   * => That's because kakao responds id by number.
   *
   * For more detail of Overwrite, refer to https://github.com/piotrwitek/utility-types#overwritet-u
   */
  const res = await axios.get<Overwrite<UserInfo, { id: number }>>(
    'https://kapi.kakao.com/v2/user/me',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
  return { ...res.data, id: res.data.id.toString() }
}
