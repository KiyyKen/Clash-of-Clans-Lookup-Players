export async function requestApi(url) {
  const response = await fetch(url);
  const data = await response.json();
  return { response, data };
}

