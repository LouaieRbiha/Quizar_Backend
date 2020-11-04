# Test Plateform

Server for Test plateform.

## 📖 Table of Contents

- [✨ Getting started](#%e2%9c%a8-getting-started)
  - [Prerequisites](#prerequisites)
  - [Bootstrap](#bootstrap)
- [📜 Scripts](#%f0%9f%93%9c-scripts)
  - [Build](#build)
  - [Test](#test)
  - [Analyze](#analyze)
  - [Development](#development)
- [📚 Documentation](#%f0%9f%93%9a-documentation)
  - [Commit Message Guideline](#commit-message-guideline)

## ✨ Getting started

### Prerequisites

You need to have installed the following software:

- [nodejs](https://nodejs.org/en/) (>=v12.18.4)
- [npm](https://npmjs.com/) (>= 6.14.6)

### Bootstrap

```bash
  git clone git@github.com/LouaieRbiha/Quiz_server.git
  cd Server
  npm i
```

**Please remember that `config/*.json` must be implemented for proper work.**

## 📜 Scripts

### Test

- `test`: Run `jest`.

### Analyze

- `format`: Run `prettier` to format all files. Gets invoked by the pre-commit hook.
- `lint`: Run `eslint` and `prettier`. Output any errors.

### Development

- `start`: Start app in development mode.
- `version`: Generates `CHANGELOG` file based on commit messages.

## 📚 Documentation

### Commit Message Guideline

- For easier commit type recognition commit messages are prefixed with an emoji
- See available [commit-emojis](https://github.com/sebald/commit-emojis#available-emojis)
