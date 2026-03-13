const fetcher = (url: string) => fetch(url).then(res => {
  if (res.status === 429) throw new Error("RATE_LIMITED")
  return res.json()
})

export default fetcher
