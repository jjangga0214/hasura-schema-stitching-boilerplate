/* eslint-disable camelcase */
import { google } from 'googleapis'
import axios from 'axios'

const redirectUri = `${process.env.FRONTEND_ENDPOINT_SCHEME}://${process.env.FRONTEND_ENDPOINT_IP}:${process.env.FRONTEND_ENDPOINT_PORT}/oauth2/callback/google`

const oauth2Client = new google.auth.OAuth2(
  process.env.API_OAUTH2_GOOGLE_CLIENT_ID,
  process.env.API_OAUTH2_GOOGLE_CLIENT_SECRET,
  redirectUri,
)

export function getAuthUrl() {
  const url = oauth2Client.generateAuthUrl({
    scope: [
      // For a complete list of Google APIs, see https://developers.google.com/identity/protocols/oauth2/scopes
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'openid',
    ],
  })
  return url
}

export async function getAccessToken(code: string) {
  // This will provide an object with the access_token and refresh_token.
  // Save these somewhere safe so they can be used at a later time.
  const res = await oauth2Client.getToken(code)
  return res.tokens.access_token as string
}

export interface UserInfo {
  id: string // e.g. '108451989866797685788'
  email: string
  verified_email: boolean
  name: string // e.g. 'Byeongchan Gil'
  given_name: string // e.g. 'Byeongchan'
  family_name: string // e.g. 'Gil'
  picture?: string // e.g. 'https://lh6.googleusercontent.com/-mCUOAnsgiU0/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuck5UowYbScR1QxBsORIQIFohQHTxg/s96-c/photo.jpg'
  locale?: string // e.g. 'ko'
}

export async function getUserInfo(accessToken: string): Promise<UserInfo> {
  const res = await axios.get<UserInfo>(
    'https://www.googleapis.com/userinfo/v2/me',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
  return res.data
}
