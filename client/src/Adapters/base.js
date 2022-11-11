const base_url = process.env.REACT_APP_API_URI;

export function get(path, payload) {
  path = path || '';
  payload = payload ? '?' + new URLSearchParams(payload) : '';
  return fetch(base_url + path + payload, {
    method: 'GET',
  })
    .then((response) => {
      return response.json().then((data) => {
        return data.data;
      });
    })
    .catch((error) => {
      // create toast then throw error { status: 400 };
      throw new Error(error);
    });
}

export function postFile(path, blob, musicId) {
  const form = new FormData();
  form.append('file', blob, 'query_audio_file');
  form.append('music_id', musicId);
  return fetch(base_url + path, {
    method: 'POST',
    body: form,
  })
    .then((response) => {
      return response.json().then((data) => {
        return data.data;
      });
    })
    .catch((error) => {
      // create toast then throw error { status: 400 };
      throw new Error(error);
    });
}
