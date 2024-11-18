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
          borderColor: "#6200ee",
          background: "dddddd",
          button: "6200ee",
        },
      },
      dark: {
        dark: true,
        colors: {
          borderColor: "#03dac6",
          button: "03dac6",
        },
      },
    },
  },
});
