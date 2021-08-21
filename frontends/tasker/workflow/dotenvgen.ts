/* eslint-disable import/no-extraneous-dependencies */
import fs from 'fs'
import path from 'path'

// const publicKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH as string, {
//   encoding: 'utf8',
// })

// function compute() {
//   return {
//     HASURA_GRAPHQL_JWT_SECRET: JSON.stringify({
//       type: 'RS512',
//       key: publicKey,
//     }),
//   }
// }

// function toDotenv(computed: { [key: string]: unknown } = compute()) {
//   return (
//     Object.keys(computed)
//       .filter((key) => Object.prototype.hasOwnProperty.call(computed, key))
//       // Don't use JSON.stringify() here, as doublequote should not be escaped.
//       .reduce((prev, curr) => `${prev}${curr}=${computed[curr]}\n`, '')
//   )
// }

// export function genDotenv(dotenv: string = toDotenv()) {
//
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'

const envVars: Record<string, string | boolean | number> = {}

interface Target {
  filename: string
  validate: (key: string, value: string | boolean | number) => boolean
}

for (const { filename, validate } of [
  {
    filename: path.join(__dirname, '..', '..', '..', '.env'),
    validate: (key) =>
      [
        'API_ENDPOINT_IP',
        'API_ENDPOINT_PORT',
        'API_ENDPOINT_SCHEME_HTTP',
        'API_ENDPOINT_PATH_GRAPHQL',
      ].includes(key),
  },
  { filename: path.join(__dirname, '..', '.env'), validate: () => true },
] as Target[]) {
  const result = dotenv.config({
    path: filename,
  })
  if (result.error) {
    throw result.error
  }
  dotenvExpand(result)

  const { parsed } = result
  for (const key in parsed) {
    if (Object.prototype.hasOwnProperty.call(parsed, key)) {
      let value: string | boolean | number = parsed[key]
      value = parseInt(value, 10) || value
      if (value === 'true') {
        value = true
      } else if (value === 'false') {
        value = false
      }
      if (validate(key, value)) {
        envVars[key] = value
      }
    }
  }
}

console.log(envVars)
let dartCode = '// This file is generated. Do not modify by hand.'
for (const key in envVars) {
  if (Object.prototype.hasOwnProperty.call(envVars, key)) {
    const value = envVars[key]
    let dartCodeValue = `${value}`
    if (typeof value === 'string') {
      dartCodeValue = `'${value}'`
    }
    dartCode = `${dartCode}\nconst ${key} = ${dartCodeValue};`
  }
}
fs.writeFileSync(
  path.resolve(__dirname, '..', 'lib', 'generated', 'env.dart'),
  dartCode,
  {
    encoding: 'utf8',
  },
)
