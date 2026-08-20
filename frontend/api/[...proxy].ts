export default async function handler(req: any, res: any) {
  const BACKEND = "http://153.75.247.105:8000";

  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") return res.status(200).end();

  const path = req.url?.split("?")[0] || "";
  const target = `${BACKEND}${path}`;

  try {
    let body: string | undefined = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      if (typeof req.body === "string") {
        body = req.body;
      } else if (req.body !== undefined && req.body !== null) {
        body = JSON.stringify(req.body);
      }
    }

    const headers: Record<string, string> = {};
    if (req.headers["content-type"]) headers["Content-Type"] = req.headers["content-type"];
    if (req.headers.authorization) headers["Authorization"] = req.headers.authorization;

    const resp = await fetch(target, {
      method: req.method,
      headers,
      body,
    });

    const text = await resp.text();
    const ct = resp.headers.get("content-type") || "application/json";
    res.setHeader("Content-Type", ct);
    return res.status(resp.status).send(text);
  } catch (err: any) {
    return res.status(502).json({ detail: "Backend unreachable", error: err.message });
  }
}
