// ============================================================
// useToast.ts — State notifikasi toast (singleton)
// Dipakai bersama oleh App.vue (render) dan semua view
// ============================================================
import { ref } from "vue";

const toastTeks = ref("");
const showToast = ref(false);
const toastType = ref("warning");
const toastDurationStyle = ref("0s");
const apakahIniProsesHapus = ref(false);

function tampilkanToast(pesan: string, tipe = "warning") {
  const durasiInternal = 4000;

  toastTeks.value = pesan;
  toastType.value = tipe;

  // 🌟 Jika bukan dipicu dari tombol konfirmasi hapus, pastikan flag hapus di-reset
  if (apakahIniProsesHapus.value !== true) {
    apakahIniProsesHapus.value = false;
  }

  toastDurationStyle.value = "0s";
  showToast.value = false;

  if ((window as any).toastTimeout) {
    clearTimeout((window as any).toastTimeout);
  }

  setTimeout(() => {
    toastDurationStyle.value = `${durasiInternal / 1000}s`;
    showToast.value = true;

    // 🌟 Jika ini proses konfirmasi hapus, JANGAN auto-close (tunggu tombol)
    if (apakahIniProsesHapus.value === true) {
      return;
    }

    (window as any).toastTimeout = setTimeout(() => {
      showToast.value = false;
    }, durasiInternal);
  }, 10);
}

function tutupToast() {
  showToast.value = false;
  if ((window as any).toastTimeout) {
    clearTimeout((window as any).toastTimeout);
  }
}

export function useToast() {
  return {
    toastTeks,
    showToast,
    toastType,
    toastDurationStyle,
    apakahIniProsesHapus,
    tampilkanToast,
    tutupToast,
  };
}