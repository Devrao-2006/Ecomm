// With httpOnly cookies, JWT is not accessible to JS.
// This file can hold helper utilities if you later switch to non-httpOnly storage.

export function isAdmin(user) {
  return user && Array.isArray(user.roles) && user.roles.includes('admin');
}