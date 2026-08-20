const BACKEND = "http://153.75.247.105:8000";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const body = req.method !== "GET" && req.method !== "HEAD"
      ? (typeof req.body === "string" ? req.body : JSON.stringify(req.body))
      : undefined;

    const resp = await fetch(`${BACKEND}/api/auth/telegram`, {
      method: req.method,
      headers: {
        "Content-Type": req.headers["content-type"] || "application/json",
        Authorization: req.headers.authorization || "",
      },
      body,
    });

    const text = await resp.text();
    res.setHeader("Content-Type", resp.headers.get("content-type") || "application/json");
    return res.status(resp.status).send(text);
  } catch (err: any) {
    return res.status(502).json({ detail: "Backend unreachable", error: err.message });
  }
}
