// ============================================================
// useFaceApi.ts — State & logika face-recognition (singleton)
// Dipakai bersama oleh ScanView (absensi) dan AdminView (registrasi)
// sehingga model, kamera, dan matcher hanya diinisialisasi sekali.
// ============================================================
import { ref } from "vue";

const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

// 🌟 Konfigurasi akurasi face recognition (bisa di-override lewat .env)
// - FACE_THRESHOLD: makin kecil makin ketat/strict (anti salah kenal orang lain).
//   Nilai wajar: 0.3 s/d 0.4. Default 0.35.
// - FACE_INPUT_SIZE: resolusi deteksi saat scan. Makin besar makin akurat tapi lebih berat.
//   Pilihan valid: 128, 160, 224, 320, 416, 512. Default 160.
// - FACE_REGISTER_INPUT_SIZE: resolusi deteksi saat registrasi (kualitas terbaik). Default 224.
const FACE_THRESHOLD = Number(import.meta.env.VITE_FACE_THRESHOLD || 0.35);
const FACE_INPUT_SIZE = Number(import.meta.env.VITE_FACE_INPUT_SIZE || 160);
const FACE_REGISTER_INPUT_SIZE = Number(import.meta.env.VITE_FACE_REGISTER_INPUT_SIZE || 224);

const faceapi: any = (window as any).faceapi;
const displaySize = { width: 640, height: 480 };

const isModelLoaded = ref(false);
const isRegisteringProcess = ref(false);
const isKameraManualAktif = ref(true);
const faceMatcher = ref<any>(null);
const statusScan = ref("System Init...");
const statusType = ref("info");

let activeStream: MediaStream | null = null;
let modelLoadingPromise: Promise<void> | null = null;

function setStatus(pesan: string, tipe = "info") {
  statusScan.value = pesan;
  statusType.value = tipe;
}

function hentikanStream() {
  if (activeStream) {
    activeStream.getTracks().forEach((track) => {
      track.stop();
      track.enabled = false;
    });
    activeStream = null;
  }
}

// 🌟 FUNGSI JALANKAN KAMERA YANG SUDAH DIOPTIMALKAN (ANTI-LOCK)
async function jalankanKamera(videoElement: HTMLVideoElement | null) {
  hentikanStream();

  if (videoElement) {
    videoElement.srcObject = null;
  }

  await new Promise((resolve) => setTimeout(resolve, 50));

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
    });

    activeStream = stream;

    if (videoElement) {
      videoElement.srcObject = stream;
      await videoElement.play().catch((e: any) => console.log("Video play dipending:", e));
    }
  } catch (err) {
    console.error("Camera Access Error:", err);
    throw err;
  }
}

// 🌟 Inisialisasi model face-api.js (hanya sekali, idempotent)
async function inisialisasiModel() {
  if (!faceapi) return;

  if (faceapi.tf && faceapi.tf.ENV) {
    faceapi.tf.ENV.set("WEBGL_VERSION", 0);
    faceapi.tf.ENV.set("HAS_WEBGL", false);
  }

  if (isModelLoaded.value) return;
  if (modelLoadingPromise) return modelLoadingPromise;

  modelLoadingPromise = (async () => {
    setStatus("DOWNLOADING MODELS...", "info");
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
    isModelLoaded.value = true;
  })();

  return modelLoadingPromise;
}

// 🌟 Muat database wajah (matcher) — HANYA wajah sesuai kode toko komputer ini
// Endpoint /api/users-by-store sudah memfilter server-side berdasarkan IP → kode toko.
// Tanpa fallback global /api/users karena itu memuat SELURUH wajah lintas toko.
async function muatDatabaseWajah() {
  if (!faceapi) return;

  try {
    const response = await fetch(`${API_URL}/api/users-by-store`);

    if (response.status === 404) {
      setStatus("BACKEND VERSI LAMA: ENDPOINT DATA PER-TOKO TIDAK ADA. UPDATE BACKEND DIPERLUKAN", "error");
      return;
    }

    if (!response.ok) {
      if (response.status === 403) {
        setStatus("IP KOMPUTER TIDAK TERDAFTAR DI JARINGAN", "error");
        return;
      }
      throw new Error(`HTTP Error ${response.status}`);
    }

    const hasil = await response.json();

    // Endpoint berbentuk { store, data: [...] }
    const users = Array.isArray(hasil)
      ? hasil
      : hasil && Array.isArray(hasil.data)
        ? hasil.data
        : [];

    if (users.length === 0) {
      setStatus("DATABASE WAJAH KOSONG!", "error");
      return;
    }

    const labeledDescriptors = users.map((user: any) => {
      const descArray = new Float32Array(JSON.parse(user.face_vektor));
      return new faceapi.LabeledFaceDescriptors(`${user.nik}||${user.nama}`, [descArray]);
    });

    faceMatcher.value = new faceapi.FaceMatcher(labeledDescriptors, FACE_THRESHOLD);

    // Tampilkan kode toko + jumlah wajah yang TERMUAT sebagai bukti filter per-toko
    const storeInfo =
      !Array.isArray(hasil) && hasil.store && hasil.store !== "LOCAL"
        ? ` — TOKO ${hasil.store} (${users.length} WAJAH)`
        : "";

    setStatus(
      (isKameraManualAktif.value ? "READY TO IDENTIFY" : "KAMERA NONAKTIF (SCAN PAUSED)") + storeInfo,
      isKameraManualAktif.value ? "info" : "warning",
    );
  } catch (err: any) {
    setStatus("DATABASE ERROR: " + (err?.message || err), "error");
  }
}

export function useFaceApi() {
  return {
    API_URL,
    FACE_THRESHOLD,
    FACE_INPUT_SIZE,
    FACE_REGISTER_INPUT_SIZE,
    faceapi,
    displaySize,
    isModelLoaded,
    isRegisteringProcess,
    isKameraManualAktif,
    faceMatcher,
    statusScan,
    statusType,
    setStatus,
    jalankanKamera,
    hentikanStream,
    inisialisasiModel,
    muatDatabaseWajah,
  };
}