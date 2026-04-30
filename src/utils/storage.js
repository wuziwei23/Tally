const KEYS = {
  USER: 'bk_current_user',
  USERS: 'bk_users',
  TRANSACTIONS: 'bk_transactions',
};

export function get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function set(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function remove(key) {
  localStorage.removeItem(key);
}

export { KEYS };
