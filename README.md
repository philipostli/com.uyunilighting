# Uyuni

[![Validate Homey App](https://github.com/philipostli/com.uyunilighting/actions/workflows/homey-app-validate.yml/badge.svg)](https://github.com/philipostli/com.uyunilighting/actions/workflows/homey-app-validate.yml)
[![Publish Homey App](https://github.com/philipostli/com.uyunilighting/actions/workflows/homey-app-publish.yml/badge.svg)](https://github.com/philipostli/com.uyunilighting/actions/workflows/homey-app-publish.yml)

Adds support for Uyuni candlelight's

Using [Material Web](https://github.com/material-components/material-web) for components.
Import modules in index.js
And bundle using rollup:
```
cd widgets/lights/public &&
npx rollup -p @rollup/plugin-node-resolve index.js -o bundle.js
```