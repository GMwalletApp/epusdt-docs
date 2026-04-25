// https://vitepress.dev/guide/custom-theme
import Teek from "vitepress-theme-teek";
import "vitepress-theme-teek/index.css";
import "./styles/custom.css";
import type { Theme } from "vitepress";
import { h } from "vue";
import GithubStarButton from "./components/GithubStarButton.vue";

const theme: Theme = {
  extends: Teek,
  Layout: () => {
    const Layout = Teek.Layout;

    return h(Layout, null, {
      "nav-bar-content-after": () => h(GithubStarButton),
    });
  },
};

export default theme;
