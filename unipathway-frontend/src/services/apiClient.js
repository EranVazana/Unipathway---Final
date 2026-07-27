const BASE_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:3000/api'
  : '/api';


function getAuthHeaders() {
  const stored = sessionStorage.getItem('unipathway_user');
  if (!stored) return {};

  try {
    const user = JSON.parse(stored);
    return {
      'x-user-id': String(user.userId),
      'x-user-role': user.userRole
    };
  } catch {
    return {};
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error('Could not reach the server. Please check your connection and try again.');
  }

  // Backend may return non-JSON on network-level failures; guard against that
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Server returned an invalid response.');
  }

  if (!payload.success) {
    const message = payload.error?.message || 'Request failed.';
    const error = new Error(message);
    error.code = payload.error?.code;
    error.details = payload.error?.details;
    error.status = response.status;
    throw error;
  }

  return payload.data;
}

export const apiClient = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' })
};