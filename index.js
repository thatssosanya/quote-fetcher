import {getSymbols, getRecentQuotes} from "./fetchers.js";
import {debugConf, cronConf} from "./knexfile.js";
import knex from "knex";
import cron from "node-cron";

const MS_PER_DAY = (1000 * 60 * 60 * 24);

const symbols_count = parseInt(process.argv?.[3] || 100);

const debug = process.argv?.[2] === "debug";

const db = knex(debug ? debugConf : cronConf);

if (!(await db.schema.hasTable("Quotes"))) {
  await db.schema.createTable("Quotes", table => {
    table.increments();
    table.string("Symbol");
    table.date("Date");
    table.decimal("Open");
    table.decimal("High");
    table.decimal("Low");
    table.decimal("Close");
    table.decimal("Volume");
  });
};

const log = (...args) =>
  console.log(`[${new Date().toLocaleString()}]`, ...args);

const fetchQuotes = async () => {
  log("Started processing.");

  const dbQuotes = await db
    .select("Symbol", "Date")
    .from("Quotes")
    .groupBy("Symbol");
  const dbSymbols = dbQuotes.map(q => q.Symbol);
  const webSymbols = await getSymbols(symbols_count);

  const reqs =
    dbQuotes
      .map(s => [s.Symbol, new Date(s.Date + MS_PER_DAY)])
      .concat(
        webSymbols.filter(s => !dbSymbols.includes(s)).map(s => [s, new Date(0)])
      );
  log(reqs.length, "symbols to process.");

  const promises = [];
  for (const [i, req] of reqs.entries()) {
    promises.push(
      getRecentQuotes(...req)
        .then(quotes => {
          if (!quotes?.length) {
            log(`[${i + 1}/${reqs.length}]`, `No new ${req[0]} quotes.`);
            return;
          }
          db.batchInsert("Quotes", quotes, 100)
            .then(() => log(`[${i + 1}/${reqs.length}]`,
              `Inserted ${quotes.length} new ${req[0]} quotes.`));
        })
    )
    await new Promise(r => setTimeout(r, 250));
  }
  Promise.all(promises).then(() => log("All done for today."));
};

if (debug) {
  await fetchQuotes();
} else {
  const argTiming = process.argv?.slice(4);
  if (argTiming.length === 0) {
    argTiming.push(15);
  }
  const timing = [...argTiming, ...Array(5 - argTiming.length).fill("*")].join(" ");
  cron.schedule(timing, fetchQuotes, {scheduled: true, timezone: "UTC"});
}
