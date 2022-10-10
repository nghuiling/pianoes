const base_url = process.env.REACT_APP_API_URI;

export function get(path) {
  path = path || '';
  return fetch(base_url + path, { method: 'GET' })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      }
      throw new Error('Something went wrong');
    })
    .catch((error) => {
      // create toast then throw error { status: 400 };
      throw new Error(error);
    });
}
