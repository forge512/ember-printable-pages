/*global module*/

module.exports = {
  theme: {
    extend: {
      screens: {
        print: { raw: "print" },
      },
    },
    height: (theme) => ({
      auto: "auto",
      ...theme("spacing"),
      full: "100%",
      "full-less-top-bar": "calc(100% - 76px)",
      screen: "100vh",
      page: "1068px",
    }),
  },
  variants: {},
  plugins: [],
};
