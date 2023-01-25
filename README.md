# quote-fetcher
fetches quotes from nasdaq.com

## Setup

1. Install Node.js.

2. Clone repo.

3. `npm install` in repo's root.

## Usage

`npm run {"debug" or "cron"} {symbol count - optional} {1 to 5 cron timing values - optional}`

---

debug - runs once.

cron - runs repeatedly.

---

Symbol count determines how many symbols will be processed. 100 by default.

---

Cron timing determines when the cron job runs. 15 * * * * by default.

See [crontab](https://crontab.guru/) for format; missing spots will be filled in with *.

For example,
`npm run cron 100 30 20`
is equivalent to `npm run cron 100 30 20 * * *` and will run every day on 20:30.
