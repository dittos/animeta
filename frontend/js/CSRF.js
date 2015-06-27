import cookie from "cookie";

export function getToken() {
    return cookie.parse(document.cookie).csrftoken;
}
