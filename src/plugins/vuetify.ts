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
          borderColor: "#1064A4",
          background: "#DFD5C0",
          button: "#A0E0CC",
          cancelButton: "#FF968F",
        },
      },
      dark: {
        dark: true,
        colors: {
          background: "#121212",
          borderColor: "#03dac6",
          button: "#03dac6",
          cancelButton: "#FF968F",
        },
      },
    },
  },
});
