// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Composables
import { createVuetify } from "vuetify";

// 테마 설정
export default createVuetify({
  theme: {
    defaultTheme: "dark", // 기본 테마
    themes: {
      light: {
        dark: false,
        colors: {
          primary: "#6200ee",
          secondary: "#03dac6",
          background: "#DDDDDD",
          surface: "#f5f5f5",
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: "#bb86fc",
          secondary: "#03dac6",
          background: "#121212",
          surface: "#1e1e1e",
        },
      },
    },
  },
});
