import { copyToClipboard, useQuasar } from "quasar";
import { useUiStore } from "stores/ui";
import { Clipboard } from "@capacitor/clipboard";
import { SafeArea } from "capacitor-plugin-safe-area";
import { Capacitor } from "@capacitor/core";

declare global {
  interface Window {
    LOCALE: string;
    windowMixin: any;
    allowedThemes?: string[];
    Capacitor?: any;
  }
}

interface VueWithQuasar {
  $q: ReturnType<typeof useQuasar>;
}
window.LOCALE = "en";

const windowMixin = {
  data() {
    return {
      g: {
        offline: !navigator.onLine,
        visibleDrawer: false,
        extensions: [],
        user: null,
        wallet: null,
        payments: [],
        allowedThemes: null,
      },
    };
  },
  methods: {
    changeColor(newValue: string) {
      document.body.setAttribute("data-theme", newValue);
      useQuasar().localStorage.set("cashu.theme", newValue);
    },
    toggleDarkMode() {
      useQuasar().dark.toggle();
      useQuasar().localStorage.set("cashu.darkMode", useQuasar().dark.isActive);
    },
    copyText(
      text: string,
      message?: string,
      position?:
        | "top"
        | "top-left"
        | "top-right"
        | "bottom-left"
        | "bottom-right"
        | "bottom"
        | "left"
        | "right"
        | "center"
    ) {
      const notify = useQuasar().notify;
      copyToClipboard(text).then(() => {
        notify({
          message: message || "Copied to clipboard!",
          position: position || "bottom",
        });
      });
    },
    async pasteFromClipboard(): Promise<string> {
      let text = "";
      if (window?.Capacitor) {
        const { value } = await Clipboard.read();
        text = value;
      } else {
        text = await navigator.clipboard.readText();
      }
      return text;
    },
    formatCurrency(
      value: number,
      currency: string = "sat",
      showBalance: boolean = false
    ): string {
      if (useUiStore().hideBalance && !showBalance) {
        return "****";
      }
      if (currency === "sat") return this.formatSat(value);
      if (currency === "msat") return this.fromMsat(value);
      if (currency === "usd" || currency === "eur") value = value / 100;
      return new Intl.NumberFormat(window.LOCALE, {
        style: "currency",
        currency: currency,
      }).format(value);
    },
    formatSat(value: number): string {
      value = parseInt(value.toString());
      return new Intl.NumberFormat(window.LOCALE).format(value) + " sat";
    },
    fromMsat(value: number): string {
      value = parseInt(value.toString());
      return new Intl.NumberFormat(window.LOCALE).format(value) + " msat";
    },
    notifyApiError(error: any) {
      const types: { [key: number]: string } = {
        400: "warning",
        401: "warning",
        500: "negative",
      };
      useQuasar().notify({
        timeout: 5000,
        type: types[error.response.status] || "warning",
        message:
          error.message ||
          error.response.data.message ||
          error.response.data.detail ||
          null,
        caption:
          [error.response.status, " ", error.response.statusText]
            .join("")
            .toUpperCase() || undefined,
        icon: undefined,
      });
    },
    async notifySuccess(message: string, position: string = "top") {
      useQuasar().notify({
        timeout: 5000,
        type: "positive",
        message: message,
        position: position as
          | "top-left"
          | "top-right"
          | "bottom-left"
          | "bottom-right"
          | "top"
          | "bottom"
          | "left"
          | "right"
          | "center"
          | undefined,
        progress: true,
        actions: [
          {
            icon: "close",
            color: "white",
            handler: () => {},
          },
        ],
      });
    },
    async notifyRefreshed(message: string, position: string = "top") {
      useQuasar().notify({
        timeout: 500,
        type: "positive",
        message: message,
        position: position as
          | "top"
          | "top-left"
          | "top-right"
          | "bottom-left"
          | "bottom-right"
          | "bottom"
          | "left"
          | "right"
          | "center"
          | undefined,
        actions: [
          {
            color: "white",
            handler: () => {},
          },
        ],
      });
    },
    async notifyError(
      message: string,
      caption: string | undefined = undefined
    ) {
      useQuasar().notify({
        color: "red",
        message: message,
        caption: caption,
        position: "top",
        progress: true,
        actions: [
          {
            icon: "close",
            color: "white",
            handler: () => {},
          },
        ],
      });
    },
    async notifyWarning(
      message: string,
      caption: string | undefined = undefined,
      timeout: number = 5000
    ) {
      useQuasar().notify({
        timeout: timeout,
        type: "warning",
        message: message,
        caption: caption,
        position: "top",
        progress: true,
        actions: [
          {
            icon: "close",
            color: "black",
            handler: () => {},
          },
        ],
      });
    },
    async notify(
      message: string,
      type: string = "null",
      position: string = "top",
      caption: string | undefined = undefined,
      color: string | null = null
    ) {
      useQuasar().notify({
        timeout: 5000,
        type: type,
        color: color || "grey",
        message: message,
        caption: caption,
        position: position as
          | "top-left"
          | "top-right"
          | "bottom-left"
          | "bottom-right"
          | "top"
          | "bottom"
          | "left"
          | "right"
          | "center"
          | undefined,
        actions: [
          {
            icon: "close",
            color: "white",
            handler: () => {},
          },
        ],
      });
    },
  },
  created(this: { g: { allowedThemes: string[] | null; offline: boolean } }) {
    if (
      useQuasar().localStorage.getItem("cashu.darkMode") === true ||
      useQuasar().localStorage.getItem("cashu.darkMode") === false
    ) {
      const darkMode = useQuasar().localStorage.getItem("cashu.darkMode");
      if (darkMode !== null) {
        useQuasar().dark.set(
          darkMode === "true" ? true : darkMode === "false" ? false : "auto"
        );
      }
    } else {
      useQuasar().dark.set(true);
    }
    this.g.allowedThemes = window.allowedThemes ?? ["classic"];

    addEventListener("offline", () => {
      this.g.offline = true;
    });

    addEventListener("online", () => {
      this.g.offline = false;
    });

    if (useQuasar().localStorage.getItem("cashu.theme")) {
      document.body.setAttribute(
        "data-theme",
        useQuasar().localStorage.getItem("cashu.theme") || "default-theme"
      );
    } else {
      windowMixin.methods.changeColor("monochrome");
    }

    // only for iOS
    if (window.Capacitor && Capacitor.getPlatform() === "ios") {
      SafeArea.getStatusBarHeight().then(({ statusBarHeight }) => {
        document.documentElement.style.setProperty(
          `--safe-area-inset-top`,
          `${statusBarHeight}px`
        );
      });

      SafeArea.removeAllListeners();

      // when safe-area changed
      SafeArea.addListener("safeAreaChanged", (data) => {
        const { insets } = data;
        for (const [key, value] of Object.entries(insets)) {
          document.documentElement.style.setProperty(
            `--safe-area-inset-${key}`,
            `${value}px`
          );
        }
      });
    }
  },
};

export default windowMixin;
