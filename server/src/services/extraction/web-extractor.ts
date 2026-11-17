import * as cheerio from "cheerio";
import { assertSafeUrl } from "./url-safety.js";

const MAX_RESPONSE_BYTES = 2_000_000;
const MAX_REDIRECTS = 5;

async function readLimitedBody(response: Response): Promise<string> {
  if (response.body === null) {
    throw new Error("URL response did not contain a body");
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    total += value.byteLength;
    if (total > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error("URL response exceeds the maximum allowed size");
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

export async function extractWebPage(
  inputUrl: string,
): Promise<{ title: string; content: string; sourceUrl: string }> {
  let currentUrl = await assertSafeUrl(inputUrl);

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    const response = await fetch(currentUrl, {
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
      headers: { "user-agent": "AI-Knowledge-Inbox/1.0" },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirect === MAX_REDIRECTS) {
        throw new Error("URL redirect chain is invalid or too long");
      }
      currentUrl = await assertSafeUrl(
        new URL(location, currentUrl).toString(),
      );
      continue;
    }

    if (!response.ok) {
      throw new Error(`URL fetch failed with status ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("text/plain")
    ) {
      throw new Error("URL content type is not supported");
    }

    const body = await readLimitedBody(response);
    if (contentType.includes("text/plain")) {
      return {
        title: currentUrl.hostname,
        content: body.trim(),
        sourceUrl: currentUrl.toString(),
      };
    }

    const $ = cheerio.load(body);
    $("script, style, nav, footer, header, iframe, noscript, svg").remove();
    const title = $("title").first().text().trim() || currentUrl.hostname;
    const content = $("main").text().trim() || $("body").text().trim();
    const normalized = content.replace(/\s+/g, " ").trim();

    if (!normalized) {
      throw new Error("URL did not contain readable text");
    }

    return { title, content: normalized, sourceUrl: currentUrl.toString() };
  }

  throw new Error("URL redirect chain is invalid or too long");
}
