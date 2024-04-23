import { isProduction } from "./isProduction"

/**
 * This helper function returns the current domain of the API.
 * If the environment is production, the production App Engine URL will be returned.
 * Otherwise, the link localhost:8080 will be returned (Spring server default port).
 * @returns {string}
 */

export const getDomain = () => {
  const prodUrl = "https://sopra-fs24-group-27-server.oa.r.appspot.com";
  const devUrl = "http://localhost:8080";
  return isProduction() ? prodUrl : devUrl;
};

export const getWS = (gameId) => {
    const httpUrl = getDomain();
    const protocolPrefix = httpUrl.startsWith("https://") ? "wss://" : "ws://";
    return `${httpUrl.replace(/^http(s?):\/\//, protocolPrefix)}ws/games/${gameId}`;
};
