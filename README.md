# quote-fetcher
fetches quotes from nasdaq.com

## Setup
`npm install`

To use in cron mode, copy .env.example, rename the copy to .env, and supply variable values.

## Usage

`npm run debug`

Runs once, uses SQLite.

---

`npm run cron`

Runs on default timing (every hour on the 15th minute), uses MS SQL Server.

---

`npm run cron {1 to 5 cron timing values}`

Runs on supplied timing (see [crontab](https://crontab.guru/) for format; missing spots will be filled in with *).

For example,
`npm run cron 30 20`
is equivalent to `npm run cron 30 20 * * *` and will run every day on 20:30.
