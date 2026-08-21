# Connect Project to GitHub (Two-Way Sync)

## What will happen
Lovable's two-way GitHub sync will create a **new** repository under your GitHub account with this project's code, then keep it in sync automatically — edits in Lovable push to GitHub, and pushes to GitHub sync back to Lovable. It cannot sync with your existing `ivory-gold-inventory` repo directly; a new repo will be created.

## Steps (performed by you in the Lovable editor)

1. Open the **Plus (+)** menu in the chat input (bottom left).
2. Select **GitHub → Connect project**.
3. **Authorize** the Lovable GitHub App on GitHub when prompted.
4. Select your GitHub account/organization (`backuparisanto2-cloud`).
5. Click **Create Repository** — Lovable generates a new repo containing the current project code.
6. Two-way sync activates automatically. There is no manual push/pull needed afterward.

## What I will do after you connect
- Verify the repo was created and the initial sync succeeded.
- Optionally set up the GitHub connector if you later want the app itself to read repo data (issues, commits, etc.).

## Important notes
- Only one GitHub account can be connected to a Lovable account at a time.
- The new repo is separate from `ivory-gold-inventory`. If you want to preserve history from the old repo, you would need to handle that outside Lovable.
- No code changes are required in this project — the code is already in place from the earlier copy.
