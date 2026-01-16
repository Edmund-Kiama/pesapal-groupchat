import { Tokens } from "../typings/auth-typings";

export type ApiResult<T> = {
  data: {
    result: T;
  };
};

export type CreateApiOptions<T> = {
  body: T;
};

export const refreshAuthTokens = async (): Promise<Tokens | undefined> => {
  const endpoint = process.env.NEXT_PUBLIC_SERVER_URL;
  const tokensData = sessionStorage.getItem("session-tokens");
  let tokens: Tokens | null = null;

  try {
    if (tokensData) {
      tokens = JSON.parse(tokensData) as Tokens;
    } else {
      window.location.href = "/?err=must-authenticate";
    }
  } catch (error) {
    sessionStorage.removeItem("session-tokens");
    window.location.href = "/?err=must-authenticate";
    return undefined;
  }

  if (tokens != null) {
    try {
      const result = await fetch(String(endpoint), {
        method: "POST",
        body: JSON.stringify({
          action: "refresh_tokens",
          body: { refreshToken: tokens.refresh.token },
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const response = result.json() as Promise<ApiResult<{ tokens: Tokens }>>;
      const data = await response;

      const {
        data: {
          result: { tokens: refreshedTokens },
        },
      } = data;

      sessionStorage.setItem("session-tokens", JSON.stringify(refreshedTokens));
      return refreshedTokens;
    } catch (error) {
      sessionStorage.removeItem("session-tokens");
      return undefined;
    }
  }

  return undefined;
};

export const makeApiRequest = async <T, U>(
  input: CreateApiOptions<T>
): Promise<ApiResult<U>> => {
  try {
    const endpoint = process.env.NEXT_PUBLIC_SERVER_URL;

    const result = await fetch(String(endpoint), {
      method: "POST",
      body: JSON.stringify(input),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    return (await result.json()) as Promise<ApiResult<U>>;
  } catch (error) {
    throw new Error("Unknown error");
  }
};
