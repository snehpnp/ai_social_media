const getCookie = (name: string) => {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  return null;
};

const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;samesite=strict`;
};

const deleteCookie = (name: string) => {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict`;
};

export const getToken = () => {
  return getCookie("token");
};

export const getUser = () => {
  const userStr = getCookie("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const setAuth = (token: string, user: any) => {
  // Store token and user data in secure cookies instead of sessionStorage
  setCookie("token", token, 1); // 1 day
  setCookie("user", JSON.stringify(user), 1);
};

export const clearAuth = () => {
  deleteCookie("token");
  deleteCookie("user");
};
