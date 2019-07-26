module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: [
    "prettier/standard",
    "plugin:prettier/recommended"
  ],
  plugins: ["prettier"],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-unused-vars": 0,
    "prettier/prettier": [
      "warn",
      {
        printWidth: 160,
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
        semi: true,
        trailingComma: "none",
        bracketSpacing: true,
        jsxBracketSameLine: false
      }
    ]
  },
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
      modules: true,
      experimentalObjectRestSpread: true
    }
  }
};
