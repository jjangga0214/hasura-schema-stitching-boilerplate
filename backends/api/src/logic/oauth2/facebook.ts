/* eslint-disable camelcase */
import axios from 'axios'
import qs from 'qs'

/**
 * REF: https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/
 */

const httpClient = axios.create({
  baseURL: 'https://graph.facebook.com/v10.0',
})

interface GetAuthUrlOptions {
  client_id?: string
  redirect_uri: string
  state?: string
  response_type?: string
  scope?: string
}

export function getAuthUrl({
  client_id = process.env.API_OAUTH2_FACEBOOK_CLIENT_ID,
  redirect_uri,
  // TODO: not using state?
  state = '1111',
  response_type = 'code',
  // REF: https://developers.facebook.com/docs/permissions/reference
  scope = ['public_profile', 'email'].join(','),
}: GetAuthUrlOptions) {
  return `https://www.facebook.com/v10.0/dialog/oauth?${qs.stringify({
    client_id,
    redirect_uri,
    // TODO: not using state?
    state,
    response_type,
    // REF: https://developers.facebook.com/docs/permissions/reference
    scope,
  })}`
}

interface GetAccessTokenOptions {
  client_id?: string
  client_secret?: string
  redirect_uri: string
  code: string
}

export async function getAccessToken({
  client_id = process.env.API_OAUTH2_FACEBOOK_CLIENT_ID,
  client_secret = process.env.API_OAUTH2_FACEBOOK_CLIENT_SECRET,
  redirect_uri,
  code,
}: GetAccessTokenOptions) {
  interface Response {
    access_token: string
    token_type: string // type,
    expires_in: number // seconds-til-expiration
  }

  const res = await httpClient.get<Response>(
    `/oauth/access_token?${qs.stringify({
      client_id,
      client_secret,
      redirect_uri,
      code,
    })}`,
  )

  return res.data.access_token
}

export interface UserInfo {
  id: string // e.g. '2209899835809621'
  email: string
  name: string // e.g. 'Byeongchan Gil'
  name_format: string // e.g. '{last}{first}'
  first_name: string // e.g. 'Byeongchan'
  last_name: string // e.g. 'Gil'
  short_name: string // e.g. 'Byeongchan'
  picture: {
    data: {
      width: number // e.g. 50
      height: number // e.g. 50
      is_silhouette: boolean // e.g. true
      url: string // e.g. 'https://scontent-ssn1-1.xx.fbcdn.net/v/t1.30497-1/cp0/c15.0.50.50a/p50x50/84628273_176159830277856_972693363922829312_n.jpg?_nc_cat=1&ccb=1-3&_nc_sid=12b3be&_nc_ohc=gzQVa5-RtlIAX8zb6oI&_nc_ht=scontent-ssn1-1.xx&tp=27&oh=d5ff24bb990d729686166686a568277d&oe=606E8638'
    }
  }
}

export async function getUserInfo(accessToken: string): Promise<UserInfo> {
  const fields = [
    'id',
    'name',
    'short_name',
    'first_name',
    'last_name',
    'middle_name',
    'picture',
    'name_format',
    'email',
  ]

  const params = {
    fields: fields.join(','),
    access_token: accessToken,
  }
  const res = await httpClient.get<UserInfo>(`/me?${qs.stringify(params)}`)
  return res.data
}
