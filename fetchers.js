const headers = {
  "accept": "application/json, text/plain, */*",
  "accept-language": "en-US,en;q=0.9,ru;q=0.8,tr;q=0.7",
  "cache-control": "no-cache",
  "pragma": "no-cache",
  "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": "\"Linux\"",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site"
};

export const getSymbols = (count = 1) => {
  const url = "https://api.nasdaq.com/api/screener/stocks?download=true";
  return fetch(url, {headers})
    .then(r => r.json())
    .then(r =>
      r.data.rows
        .map(stock => ({
          symbol: stock.symbol,
          marketCap: parseFloat(stock.marketCap)
        }))
        .filter(stock => stock.marketCap)
        .sort((a, b) => parseFloat(b.marketCap) - parseFloat(a.marketCap))
        .slice(0, count)
        .map(stock => stock.symbol)
    )
    .catch(e => {
      console.error("Failed to get symbol names.");
      throw e;
    });
};

const encodeSymbol = (symbol) => symbol.replace("\/", "%25sl%25");

const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate();
  return [yyyy, mm, dd].join("-");
};

const getQuotes = (symbol, fromDate, toDate) => {
  const url = `https://api.nasdaq.com/api/quote/${encodeSymbol(symbol)}/chart`
  + `?assetclass=stocks&fromdate=${formatDate(fromDate)}&todate=${formatDate(toDate)}`;
  return fetch(url, {headers})
    .then(r => r.json())
    .then(r =>
      r.data.chart
        .map(day => {
          const {dateTime, value, ...z} = day.z;
          const quote = Object.fromEntries(
            Object.entries(z)
              .map(([k, v]) => [
                k.substring(0, 1).toUpperCase() + k.substring(1),
                parseFloat(v)
              ])
          );
          quote.Symbol = symbol;
          quote.Date = new Date(day.x);
          return quote;
        })
        .reverse()
    )
    .catch(e => console.error(`Failed to get quotes for ${symbol}:\n`, e));
};

export const getRecentQuotes = (symbol, days = 1) => {
  const to = new Date();
  const from = new Date(new Date().setDate(to.getDate() - days));
  return getQuotes(symbol, from, to);
};
