import crypto from "crypto";

const DEFAULT_BASE = "https://test-api.sandbox.co.in";

let tokenCache = { token: null, expiresAt: 0 };

export function getSandboxConfig() {
  const apiKey =
    process.env.SANDBOX_API_KEY ||
    process.env.sandbox_api_key ||
    process.env.SANDBOX_API_HEY;
  const apiSecret =
    process.env.SANDBOX_API_SECRET || process.env.sandbox_api_secret;
  const baseUrl = (process.env.SANDBOX_API_BASE_URL || DEFAULT_BASE).replace(
    /\/$/,
    ""
  );
  return { apiKey, apiSecret, baseUrl };
}

/** HTTPS origin DigiLocker redirects to (Sandbox rejects http://). */
export function getDigilockerRedirectBase(request) {
  const fromEnv =
    process.env.SANDBOX_REDIRECT_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "development" && request) {
    const host =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host");
    if (
      host &&
      (host.startsWith("localhost:") ||
        host.startsWith("127.0.0.1:") ||
        host === "localhost" ||
        host === "127.0.0.1")
    ) {
      // shortcut: only works if you run `npm run dev:https` and open https://localhost:…
      return `https://${host}`;
    }
  }
  return null;
}

export function isDigilockerDevBypassEnabled() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.DIGILOCKER_DEV_BYPASS === "true"
  );
}

async function getAccessToken() {
  const now = Date.now();
  if (tokenCache.token && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.token;
  }

  const { apiKey, apiSecret, baseUrl } = getSandboxConfig();
  if (!apiKey || !apiSecret) {
    throw new Error(
      "Missing SANDBOX_API_KEY and SANDBOX_API_SECRET in environment"
    );
  }

  const res = await fetch(`${baseUrl}/authenticate`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "x-api-secret": apiSecret,
      "x-api-version": "1.0",
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.data?.access_token) {
    throw new Error(json?.message || "Sandbox authentication failed");
  }

  tokenCache = {
    token: json.data.access_token,
    expiresAt: now + 23 * 60 * 60 * 1000,
  };
  return tokenCache.token;
}

export async function sandboxRequest(path, options = {}) {
  const { apiKey, baseUrl } = getSandboxConfig();
  const token = await getAccessToken();
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "x-api-key": apiKey,
      authorization: token,
      "x-api-version": "1.0",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json?.message || `Sandbox API error (${res.status})`);
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json;
}

export function hashAadhaarSubject(rawSubject) {
  const secret =
    process.env.AADHAAR_HASH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "bloodbond-aadhaar-hash";
  return crypto.createHmac("sha256", secret).update(rawSubject).digest("hex");
}
