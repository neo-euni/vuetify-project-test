// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Composables
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

// 테마 설정
export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "dark", // 기본 테마
    themes: {
      light: {
        dark: false,
        colors: {
          background: "#E4E4E4",
          borderColor: "#6200EE",
          cancelButton: "#B00020",
        },
      },
      dark: {
        dark: true,
        colors: {
          background: "#121212",
          borderColor: "#BB86FC",
          cancelButton: "#CF6678",
        },
      },
      lightSecondary: {
        dark: false,
        colors: {
          background: "#F5EEDC",
          borderColor: "#97BFB4",
          cancelButton: "#DD4A48",
        },
      },
      darkSecondary: {
        dark: true,
        colors: {
          background: "#121212",
          borderColor: "#57DAB7",
          cancelButton: "#FF0D0A",
        },
      },
      bluePastel: {
        dark: false,
        colors: {
          background: "#C3D2E5",
          borderColor: "#3E4755",
          cancelButton: "#FE5201",
        },
      },
      pinkPastel: {
        dark: false,
        colors: {
          background: "#FFE5E8",
          borderColor: "#FF6577",
          cancelButton: "#6200EE",
        },
      },
    },
  },
});
