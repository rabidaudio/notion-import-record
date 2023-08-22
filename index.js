require('dotenv/config')

const { NotionApi } = require('./api')
const { parseBandcampUrl, parseSpotifyUrl } = require('./import')

async function run (parser, { urls, key, dbid, dryRun }) {
  const api = new NotionApi(key, dbid)
  for (const url of urls) {
    const info = await parser(url)
    if (dryRun) {
      console.log(`[DRY RUN] "${info.Album}" by ${info.Artist} (${info['Release Date']}):`)
      console.log(info)
    } else {
      const res = await api.insertRelease(info)
      console.log(`Uploaded "${info.Album}" by ${info.Artist} (${info['Release Date']}): ${res.id}`)
      console.log(res.url)
    }
  }
}

// eslint-disable-next-line no-unused-expressions
require('yargs')
  .scriptName('notion-record-import')
  .usage('$0 <cmd> [args]')
  .option('dryRun', {
    alias: 'dry-run',
    type: 'boolean',
    default: false,
    describe: 'Fetch data but do not actually update Notion'
  })
  .option('key', {
    alias: 'K',
    default: process.env.NOTION_API_KEY,
    describe: 'API key for accessing Notion. Defaults to `NOTION_API_KEY` env var',
    type: 'string'
  })
  .option('dbid', {
    alias: 'd',
    default: process.env.DATABASE_ID,
    describe: 'The UUID of the database. Defaults to `DATABASE_ID` env var',
    type: 'string'
  })
  .command('bandcamp <urls...>', 'Import URL(s) from Bandcamp', (yargs) => {
    yargs.positional('urls', {
      type: 'array',
      describe: 'Link(s) to the record(s) in Bandcamp'
    })
  }, async (argv) => await run(parseBandcampUrl, argv))
  .command('spotify <urls...>', 'Import URL(s) from Spotify', (yargs) => {
    yargs.positional('urls', {
      type: 'array',
      describe: 'Link(s) to the record(s) in Spotify'
    })
  }, async (argv) => await run(parseSpotifyUrl, argv))
  .help()
  .argv
