#!/bin/bash

if [ "$CI" = true ] && [ ! -d "$(pwd)/lib" ] || [[ "contract-addresses" =~ $CHANGED_MODULES ]] || [ ! "$CI" = true ]; then
    echo "Re-building dev bundle";
    yarn clean && babel --copy-files --out-dir ./lib --root-mode upward ./src;
fi
