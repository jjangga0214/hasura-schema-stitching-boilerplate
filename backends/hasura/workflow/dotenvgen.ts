import fs from 'fs'
import path from 'path'

const publicKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH as string, {
  encoding: 'utf8',
})

function compute() {
  return {
    HASURA_GRAPHQL_JWT_SECRET: JSON.stringify({
      type: 'RS512',
      key: publicKey,
    }),
  }
}

function toDotenv(computed: { [key: string]: unknown } = compute()) {
  return (
    Object.keys(computed)
      .filter((key) => Object.prototype.hasOwnProperty.call(computed, key))
      // Don't use JSON.stringify() here, as doublequote should not be escaped.
      .reduce((prev, curr) => `${prev}${curr}=${computed[curr]}\n`, '')
  )
}

export function genDotenv(dotenv: string = toDotenv()) {
  fs.writeFileSync(path.resolve(__dirname, '..', '.env.generated'), dotenv, {
    encoding: 'utf8',
  })
}
