#!/usr/bin/env bash

# Double, triple check that this only runs on the develop branch
if [ "$CIRCLE_BRANCH" != "develop" ]; then
  echo "Artifact orchestration should occur only on the \"develop\" branch"
  exit 0
fi

PKG=@aztec/protocol yarn compile:contracts
yarn script:build:artifacts

git status -s

if [[ -z $(git status -s) ]]; then
  echo "Smart contracts have not changed, so do not redeploy them to testnets"
  exit 0
fi

# Set author email and name
git config credential.helper "cache --timeout=120"
git config user.email "$AZTEC_BOT_EMAIL"
git config user.name "$AZTEC_BOT_NAME"

# Commit contract artifacts
git add packages/contract-artifacts
git commit -m "feat(contract-artifacts): sync with develop 🤖"

# Run testnet deployment scripts in parallel
cd packages/protocol
yarn deploy:kovan > /dev/null &
yarn deploy:rinkeby > /dev/null &
yarn deploy:ropsten > /dev/null &
wait

# Extract addresses from the newly generated truffle artifacts
cd ../../
yarn script:update:addresses

# Commit contract addresses
if [[ -z $(git status -s) ]]; then
  echo "Artifacts have changed but script:update:addresses hasn't modified the files"
  exit 1
fi

git add packages/contract-addresses
git commit -m "feat(contract-addresses): sync with develop 🤖"

# Push quietly to prevent showing the GitHub token in log
git push --quiet https://${GH_TOKEN}@github.com/AztecProtocol/AZTEC.git develop > /dev/null 2>&1
