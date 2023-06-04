# GiP

_Git Politely_

A `git clone` that doesn't include the `.git` folder, doesn't put it's code in a sub-directory, and, if an existing file will be replaced,
asks for permission to proceed (can be bypassed with the `--yes` or `--no` flags).

## Installation

```shell
deno install --allow-run --allow-env --allow-write --allow-read --name gip -f https://denopkg.com/Vehmloewff/gip@1.0.0/main.ts
```

## Usage

```
Git Politely

USAGE:
  gip <user>/<repo> [...options]
  gip <http_url> [...options]
  gip <ssh_url> [...options]

OPTIONS:
  -y, --yes          Always replace files that already exist
  -n, --no           Never replace files that already exist
  -h, --help         Show this message
```
