# webgame-training
 Training on HTML 5 web dev

# References
* [Isometric math](https://clintbellanger.net/articles/isometric_math/)

# Node + TypeScript

Source: https://khalilstemmler.com/blogs/typescript/node-starter-project/

```shell
mkdir typescript-starter
cd typescript-starter
npm init -y
npm install typescript --save-dev
npm install @types/node --save-dev

npx tsc --init --rootDir src --outDir build \
--esModuleInterop --resolveJsonModule --lib es6 \
--module commonjs --allowJs true --noImplicitAny true

mkdir src
touch src/index.ts

npx tsc

npm install --save-dev ts-node nodemon

```

Config files:
* nodemon.json
* Additional scripts in package.json

# Linting

Source: https://khalilstemmler.com/blogs/typescript/eslint-for-typescript/

```shell
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

Config files:
* .eslintrc
* .eslintignore
* lint script in package.json