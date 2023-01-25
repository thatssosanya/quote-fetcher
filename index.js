import {getSymbols, getRecentQuotes} from "./fetchers.js";
import {debugConf, cronConf} from "./knexfile.js";
import knex from "knex";
import cron from "node-cron";
import dotenv from "dotenv";
dotenv.config();

const debug = process.argv?.[2] === "debug"

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
  log("Started fetching.");

  const dbQuotes = await db
    .select("Symbol", "Date")
    .from("Quotes")
    .groupBy("Symbol");
  const dbSymbols = dbQuotes.map(q => q.Symbol);
  const webSymbols = await getSymbols();

  const reqs = dbSymbols.map(s => [s]).concat(
    webSymbols.filter(s => !dbSymbols.includes(s)).map(s => [s, 30])
  );
  log(reqs.length, "symbols to process.");

  const recentQuoteResults = await Promise.allSettled(
    reqs.map(req => getRecentQuotes(...req))
  );
  const recentQuotes = recentQuoteResults
    .filter(r => r.status === "fulfilled" && r.value?.length)
    .map(r => r.value.filter(quote => {
      const dbQuote = dbQuotes.find(dbQuote => dbQuote.Symbol === quote.Symbol);
      return !dbQuote || dbQuote.Date < quote.Date;
    }))
    .flat(1)
    .sort((a, b) => b.Date - a.Date);

  log("Inserting", recentQuotes.length, "new quotes.");
  await Promise.all(recentQuotes.map(quote => db.insert(quote).into("Quotes")));

  log("Done for today.");
};

if (debug) {
  await fetchQuotes();
} else {
  cron.schedule("16 7 * * *", fetchQuotes, {scheduled: true, timezone: "UTC"});
}
