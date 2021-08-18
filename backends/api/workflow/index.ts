/* eslint-disable import/no-extraneous-dependencies */
import clipboardy from 'clipboardy'
import * as jwt from '../src/logic/jwt'

export function createAccessToken() {
  const adminAccessToken = jwt.createAdminServiceAccountAccessToken({
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // expires in a week
  })
  console.log(`Access token with admin role:\n\n${adminAccessToken}`)

  const userAccessToken = jwt.createUserAccessToken({
    id: 'WzEsICJwdWJsaWMiLCAidXNlciIsICJiNDU1NGRmZi1mMjE3LTQ4M2ItYjY2OC0xOWE5YTdkYTg3NzkiXQ==',
    roles: [{ role: 'USER' }],
    uid: 'b4554dff-f217-483b-b668-19a9a7da8779',
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // expires in a week
  })
  console.log()
  console.log(
    `Access token with user role (copied to your clipboard):\n\n${userAccessToken}`,
  )
  clipboardy.writeSync(userAccessToken)
}

async function main() {
  createAccessToken()
}

main()
