import { db } from "./db";

// MVP: single workspace owner. There is no auth yet — every request acts as the
// one demo user. Replacing this with real multi-tenant auth (Auth.js) is the
// first roadmap item: swap the body to read the session and return its user.
export async function getCurrentUser() {
  let user = await db.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) {
    user = await db.user.create({
      data: { email: "demo@honestbill.app", name: "Demo Studio" },
    });
  }
  return user;
}
