// https://vitepress.dev/guide/custom-theme
import Teek from "vitepress-theme-teek";
import "vitepress-theme-teek/index.css";
import "./styles/custom.css";
import type { Theme } from "vitepress";
import { h } from "vue";
import GithubStarButton from "./components/GithubStarButton.vue";
import BreadcrumbLocaleFix from "./components/BreadcrumbLocaleFix.vue";
import SponsorPageEn from "./components/SponsorPageEn.vue";
import SponsorPageZh from "./components/SponsorPageZh.vue";

const theme: Theme = {
  extends: Teek,
  enhanceApp({ app }) {
    app.component("SponsorPageEn", SponsorPageEn);
    app.component("SponsorPageZh", SponsorPageZh);
  },
  Layout: () => {
    const Layout = Teek.Layout;

    return h(Layout, null, {
      "nav-bar-content-after": () => h(GithubStarButton),
      "doc-before": () => h(BreadcrumbLocaleFix),
    });
  },
};

export default theme;
