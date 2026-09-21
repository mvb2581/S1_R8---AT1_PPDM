const BASE_URL = 'https://dattebayo-api.onrender.com';

async function request(path) {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Não foi possível acessar a API (status ${response.status})`);
  }
  return response.json();
}

export async function getCharacters(page = 1, limit = 50) {
  return request(`/characters?page=${page}&limit=${limit}`);
}

export async function searchCharacters(name, limit = 200) {
  return request(`/characters?name=${encodeURIComponent(name)}&limit=${limit}`);
}

export async function getCharacterById(id) {
  return request(`/characters/${id}`);
}