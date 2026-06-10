# Contributing

## Branch workflow

`main` is protected. Do not push to it directly.

1. Branch from latest `main`:

```bash
git checkout main
git pull origin main
git checkout -b feat/short-description
```

2. Commit your changes and push the branch:

```bash
git push -u origin feat/short-description
```

3. Open a pull request to `main` and wait for CI to pass.

4. A code owner will review and merge. You cannot merge your own PR into `main`.

```bash
gh pr create --base main
```

## What you can and cannot do

| Action | Collaborators (Write) | Maintainer |
|--------|----------------------|------------|
| Push feature branches | Yes | Yes |
| Open PRs to `main` | Yes | Yes |
| Push directly to `main` | No | Yes |
| Merge PRs into `main` | No | Yes |
| Approve PRs (code owner) | No | Yes |

## Local setup

See [SETUP.md](SETUP.md) for environment variables, Clerk, database, and running the app locally.

## Commit messages

This repo uses [Conventional Commits](https://www.conventionalcommits.org/). CI runs commitlint on pull requests. Examples:

- `feat(music): add project calendar view`
- `fix(auth): handle expired session redirect`
- `chore: update dependencies`
