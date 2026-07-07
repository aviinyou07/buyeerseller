import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = 'fake_token';

  if (token) {
    // Force set headers by spreading
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }

  return config;
});

axiosClient.interceptors.request.use((config) => {
  console.log('Headers sent:', config.headers);
  return config;
});

async function test() {
  try {
    await axiosClient.post('/test', new FormData(), {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  } catch (err) {
    // Ignore error
  }
}

test();
