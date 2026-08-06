---
'@mastra/factory': minor
---

Added automatic branch names for user sessions created without a branch.

Omitting `branch` now gives each session a `user/session-N-<session-id>` branch. The counter advances across deleted sessions and repository relinks. The session ID keeps every generated branch unique, so a new session cannot reopen work from a deleted one.

`POST /web/github/projects/:id/sessions` now accepts a request with no `branch`:

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
