module.exports = async searchparams => {

  const params = Object.fromEntries(new URLSearchParams(searchparams).entries())

  let body = {
    "collection": params.collection,
    "database": params.database,
    "dataSource": params.dataSource,
    "limit": 1,
    "sort": { _id: -1 }
  }

  let options = {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "apiKey": params.apiKey,
      "Access-Control-Request-Headers": "*"
    },
    body: JSON.stringify(body)
  }

  const response = await fetch(params.url, options);

  let r = await response.json()

  return r.documents?.[0]
}