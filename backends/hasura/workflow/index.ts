// import fs from 'fs'
// import path from 'path'
import { program } from 'commander'
// import { query } from '#hasura/client/postgres'
import seed from './seeds'
// import { genCommonSdl } from './gqlsdlgen'
import { genDotenv } from './dotenvgen'

// program
//   .command('drop')
//   .description('drop every tables')
//   .action(async () => {
//     const sql = fs.readFileSync(path.resolve(__dirname, 'drop.sql'), {
//       encoding: 'utf8',
//     })
//     const res = await query(sql)
//     console.log(JSON.stringify(res, null, 2))
//   })

// program
//   .command('truncate')
//   .description('truncate every tables except enum data')
//   .action(async () => {
//     const sql = fs.readFileSync(
//       path.resolve(__dirname, 'seed', 'truncate.sql'),
//       {
//         encoding: 'utf8',
//       },
//     )
//     const res = await query(sql)
//     console.log(JSON.stringify(res, null, 2))
//   })

program
  .command('seed')
  .description('seed data into tables')
  .action(async () => {
    const res = await seed()
    console.log(JSON.stringify(res, null, 2))
  })

// program
//   .command('gqlsdlgen')
//   .description(
//     'extract common sdl(e.g. Node, PageInfo, enums) for other implementing services',
//   )
//   .action(async () => {
//     genCommonSdl()
//   })

program
  .command('dotenvgen')
  .description('generate .env.generated')
  .action(async () => {
    genDotenv()
  })

async function main() {
  // REF: https://github.com/tj/commander.js#action-handler
  await program.parseAsync(process.argv)
}

main()
