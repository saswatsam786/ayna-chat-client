import Cookies from "js-cookie";
import axios from "axios";

const STRAPI_URL = "https://ayna-strapi-backend-zo3y.onrender.com/api";

interface User {
  id: string;
  username: string;
}

interface TokenData {
  jwt: string;
  user: User;
}

export const setToken = (data: TokenData, router: any): void => {
  if (typeof window !== "undefined") {
    Cookies.set("id", data.user.id);
    Cookies.set("username", data.user.username);
    Cookies.set("jwt", data.jwt);
    if (Cookies.get("username")) {
      router.push("/");
    }
  }
};

export const unsetToken = (router: any): void => {
  if (typeof window !== "undefined") {
    Cookies.remove("id");
    Cookies.remove("jwt");
    Cookies.remove("username");

    router.push("/login");
  }
};

export const getUserFromLocalCookie = async (): Promise<any | undefined> => {
  const jwt = getTokenFromLocalCookie();
  if (jwt) {
    try {
      const response = await axios.get<User>(`${STRAPI_URL}/users/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
  return undefined;
};

export const getIdFromLocalCookie = async (): Promise<string | undefined> => {
  const jwt = getTokenFromLocalCookie();
  if (jwt) {
    try {
      const response = await axios.get<User>(`${STRAPI_URL}/users/me?populate=messages.sender,messages.receiver`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });
      return response.data.id;
    } catch (error) {
      console.error(error);
    }
  }
  return undefined;
};

export const getTokenFromLocalCookie = (): string | undefined => {
  return Cookies.get("jwt");
};

export const getTokenFromServerCookie = (req: { headers: { cookie?: string } }): string | undefined => {
  if (!req.headers.cookie) {
    return undefined;
  }
  const jwtCookie = req.headers.cookie.split(";").find((c) => c.trim().startsWith("jwt="));
  if (!jwtCookie) {
    return undefined;
  }
  return jwtCookie.split("=")[1];
};

export const getIdFromServerCookie = (req: { headers: { cookie?: string } }): string | undefined => {
  if (!req.headers.cookie) {
    return undefined;
  }
  const idCookie = req.headers.cookie.split(";").find((c) => c.trim().startsWith("id="));
  if (!idCookie) {
    return undefined;
  }
  return idCookie.split("=")[1];
};
