---
trigger: model_decision
description: when trying to run tests, when trying to debug tests
---

I am running most of my developement environment via WSL. Therefore to run tests you have to run WSL commands.

# Running all tests

All tests can be ran with:
```
wsl -e bash -ic "cd /mnt/d/backup/projects/monorepo/typescript/sqlparse && npm run test"
```

# Runnin subset of all tests

Some part of tests can be ran with:
```
wsl -e /mnt/d/backup/projects/monorepo/typescript/sqlparse/test-compat.sh "d:/backup/projects/monorepo/typescript/sqlparse/test/<PATH_TO_TEST>" -c "d:/mnt/d/backup/projects/monorepo/typescript/sqlparse/jest.config.ts" -t "<NAME_PATTERN>"
```
Example:
```
wsl -e /mnt/d/backup/projects/monorepo/typescript/sqlparse/test-compat.sh "d:/backup/projects/monorepo/typescript/sqlparse/test/lexer.spec.ts" -c "d:/mnt/d/backup/projects/monorepo/typescript/sqlparse/jest.config.ts" -t "lexer should lex simple select statement"
```