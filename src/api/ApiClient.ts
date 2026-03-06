import { serializeBigInt } from "lib/utils";
import { ResponseError } from "./types";

/**
 * Generic ApiClient base class
 */
export class ApiClient<P extends string = string> {
  protected url: string;

  constructor(url: string) {
    this.url = url;
  }

  private _endpoint(path: P | `${P}/${string}`): string {
    return `${this.url}${path}`;
  }

  /*******************************/
  /*    GENERIC FETCH METHODS    */
  /*******************************/

  /**
   * Generic GET request
   */
  protected async get<T = unknown>(
    path: P | `${P}/${string}`,
    headers: Record<string, string> = {}
  ): Promise<T> {
    const response = await fetch(this._endpoint(path), {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new ResponseError(
        `GET ${path} failed: ${response.status} ${response.statusText}`,
        await response.json(),
        response.status
      );
    }
    return await response.json();
  }

  /**
   * Generic POST request
   */
  protected async post<T = unknown, U = unknown>(
    path: P,
    props: T,
    headers: Record<string, string> = {}
  ): Promise<U> {
    const response = await fetch(this._endpoint(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(props, serializeBigInt),
    });
    if (!response.ok) {
      throw new ResponseError(
        `POST ${path} failed: ${response.status} ${response.statusText}`,
        await response.json(),
        response.status
      );
    }
    // TODO: Move this back to:
    // return response.json() once the response is always in JSON!
    const responseText = await response.text();
    try {
      return JSON.parse(responseText) as U;
    } catch {
      return responseText as U;
    }
  }
}
