---
'@mastra/factory': minor
---

Added server-side naming for user sessions, so a name is never handed out twice.

Deleting a user session drops its row and its checkout, but not the branch it pushed. A client that names the next session from the sessions still in its list therefore reuses a name that is already spent — and because session creation is idempotent per `(repository, user, branch)`, the new session lands back on the deleted one's work rather than starting clean.

`POST /web/github/projects/:id/sessions` now accepts a request with no `branch` and allocates one from a counter that only ever counts up:

```ts
// before — the caller picked the name, with no way to see which ones were spent
await fetch(`/web/github/projects/${projectRepositoryId}/sessions`, {
  method: 'POST',
  body: JSON.stringify({ branch: 'user/session-2' }),
});

// after — omit the branch and the server names it
await fetch(`/web/github/projects/${projectRepositoryId}/sessions`, {
  method: 'POST',
  body: JSON.stringify({}),
});
```

Passing a branch still works and is unchanged.
