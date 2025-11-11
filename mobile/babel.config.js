module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@tpfinal/context": "../packages/context",
            "@tpfinal/schemas": "../packages/schemas",
            "@tpfinal/types": "../packages/types",
            "@tpfinal/ui": "../packages/ui",
          },
        },
      ],
      "react-native-reanimated/plugin", // 👈 SIEMPRE debe ir al final
    ],
  };
};
