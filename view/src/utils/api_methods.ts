export const get = async (url: string) => {
  const res: unknown = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json())
  return res
}
