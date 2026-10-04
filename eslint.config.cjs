const nextConfig = require("eslint-config-next/core-web-vitals");

module.exports = [
  ...nextConfig,

  {
    files: ["**/*.{js,jsx,mjs,ts,tsx}"],
    rules: {
      "import/no-anonymous-default-export": "warn",
      "react/no-unknown-property": "off",
      "react/prop-types": "off",
      "jsx-a11y/alt-text": ["warn", { elements: ["img"], img: ["Image"] }],
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      globals: require("globals").node,
      parserOptions: { ecmaVersion: "latest", sourceType: "commonjs" },
    },
  },
];
