const getCookie = (name) => {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
};

const setCookie = (name, value, days) => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  const cookieValue =
    encodeURIComponent(value) +
    (days ? `; expires=${expirationDate.toUTCString()}` : '');
  document.cookie = `${name}=${cookieValue}`;
};

const getLocalStorage = (key) => localStorage.getItem(key);

const setLocalStorage = (key, value) => localStorage.setItem(key, value);

export { getCookie, setCookie, getLocalStorage, setLocalStorage };
