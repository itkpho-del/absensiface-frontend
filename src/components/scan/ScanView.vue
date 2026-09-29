<template>
  <!-- MODE 1: SCAN ABSENSI -->
  <div class="max-w-3xl mx-auto space-y-4 animate-fade">
    <!-- Live Camera Feed Card -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden w-full">
      <div class="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/70 select-none">
        <h3 class="text-xs font-black text-slate-900 tracking-wider uppercase">LIVE RECOGNITION FEED</h3>
        <div class="text-[10px] font-extrabold text-rose-600 px-2.5 py-1 bg-rose-50 rounded-full border border-rose-100 flex items-center gap-1.5 animate-pulse">
          <span class="w-1.5 h-1.5 bg-rose-600 rounded-full"></span> LIVE
        </div>
      </div>

      <div class="p-4 w-full">
        <!-- Camera Controls -->
        <div class="flex items-center justify-between gap-4 mb-4 w-full">
          <div class="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/60 shadow-inner">
            <button
              @click="tipeAbsenAktif = 'I'"
              class="px-5 py-1.5 rounded-lg text-xs font-extrabold tracking-wider transition-all duration-150 cursor-pointer"
              :class="tipeAbsenAktif === 'I' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'"
            >
              📥 IN
            </button>
            <button
              @click="tipeAbsenAktif = 'O'"
              class="px-5 py-1.5 rounded-lg text-xs font-extrabold tracking-wider transition-all duration-150 cursor-pointer"
              :class="tipeAbsenAktif === 'O' ? 'bg-white text-amber-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'"
            >
              📤 OUT
            </button>
          </div>

          <button
            @click="toggleKontrolKamera"
            class="px-4 py-1.5 rounded-xl text-xs font-extrabold tracking-wide transition-all duration-200 border cursor-pointer shadow-sm"
            :class="isKameraManualAktif 
              ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100' 
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'"
          >
            <span v-if="isKameraManualAktif">📷 ON</span>
            <span v-else>🎥 OFF</span>
          </button>
        </div>

        <!-- Status Bar -->
        <div 
          class="w-full text-center py-2.5 px-4 rounded-xl text-xs font-bold mb-4 border transition-all duration-200 tracking-wide uppercase shadow-sm"
          :class="statusClass || 'bg-slate-50 text-slate-500 border-slate-200'"
        >
          {{ statusScan }}
        </div>

        <!-- Viewfinder Area -->
        <div class="relative w-full aspect-[4/3] max-w-md mx-auto rounded-2xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800">
          <video
            ref="videoAbsen"
            @play="onPlayAbsensi"
            class="w-full h-full object-cover scale-x-[-1]"
            autoplay
            muted
            playsinline
          ></video>
          <canvas ref="canvasAbsen" class="absolute inset-0 w-full h-full pointer-events-none"></canvas>
          
          <!-- AI Scanner Target Effect -->
          <div v-if="isKameraManualAktif" class="absolute inset-6 pointer-events-none border border-white/10 rounded-xl">
            <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500 rounded-tl-sm"></div>
            <div class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500 rounded-tr-sm"></div>
            <div class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500 rounded-bl-sm"></div>
            <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500 rounded-br-sm"></div>
          </div>

          <!-- Laser Scanner Animation Effect -->
          <div
            class="absolute left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_12px_rgba(59,130,246,1)] animate-bounce pointer-events-none"
            style="animation-duration: 2.5s;"
            v-if="!isProcessingAbsen && isKameraManualAktif"
          ></div>
        </div>
      </div>
    </div>

    <!-- Last Verified Log Card -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden w-full">
      <div class="px-5 py-3 border-b border-slate-100 bg-slate-50/70 select-none">
        <h3 class="text-xs font-black text-slate-900 tracking-wider uppercase">LAST VERIFIED LOG</h3>
      </div>

      <div class="p-4 w-full">
        <div
          v-if="absenTerakhir && absenTerakhir.nik"
          class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 animate-fade"
        >
          <div class="border-l-4 border-blue-600 pl-4 py-0.5 shrink-0">
            <span class="block text-[9px] font-black text-slate-400 tracking-widest uppercase mb-0.5">TIMESTAMP</span>
            <div class="text-xl font-black text-slate-900 font-mono tracking-tight">{{ absenTerakhir.jam }}</div>
          </div>

          <div
            class="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest self-start sm:self-auto shadow-sm border select-none"
            :class="absenTerakhir.checktype === 'I' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'"
          >
            {{ absenTerakhir.checktype === "I" ? "LOG: IN" : "LOG: OUT" }}
          </div>

          <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div class="min-w-0">
              <span class="block text-[9px] font-black text-slate-400 tracking-widest uppercase mb-0.5">FULL NAME</span>
              <span class="text-sm font-extrabold text-slate-900 block truncate">{{ absenTerakhir.nama }}</span>
            </div>
            <div class="min-w-0">
              <span class="block text-[9px] font-black text-slate-400 tracking-widest uppercase mb-0.5">EMPLOYEE ID / NIK</span>
              <span class="text-sm font-bold text-slate-600 font-mono block truncate">{{ absenTerakhir.nik }}</span>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-6 text-slate-400 text-xs font-semibold flex flex-col items-center justify-center gap-2 select-none">
          <span class="text-xl animate-pulse text-slate-300">📡</span>
          <p class="tracking-wide">Awaiting Identification... Posisikan wajah menatap kamera.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useFaceApi } from "@/composables/useFaceApi";

const props = defineProps<{
  isScanPaused?: boolean;
}>();

const {
  faceapi,
  displaySize,
  FACE_INPUT_SIZE,
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
} = useFaceApi();

const videoAbsen = ref<HTMLVideoElement | null>(null);
const canvasAbsen = ref<HTMLCanvasElement | null>(null);
const tipeAbsenAktif = ref("I");

const dataLokal = localStorage.getItem("absen_terakhir");
const absenTerakhir = ref(
  dataLokal
    ? JSON.parse(dataLokal)
    : {
        nik: "",
        nama: "",
        checktype: "",
        jam: "--:--:--",
      },
);

const tantanganAktif = ref("");
const sudahLolosTantangan = ref(false);
let isProcessingAbsen = false;
let currentInterval: ReturnType<typeof setInterval> | null = null;

const audioSuccess = new Audio("/sounds/success.mp3");
const audioError = new Audio("/sounds/error.mp3");
audioSuccess.volume = 0.8;
audioError.volume = 0.8;

const statusClass = computed(() => {
  switch (statusType.value) {
    case "success":
      return "bg-blue-50 text-blue-700 border-blue-200 st-success";
    case "warning":
      return "bg-amber-50 text-amber-700 border-amber-200 st-warning";
    case "error":
      return "bg-red-50 text-red-700 border-red-200 st-error";
    case "info":
    default:
      return "bg-slate-50 text-slate-500 border-slate-200 st-info";
  }
});

// ==========================================
// BANTUAN MATEMATIKA (larva/anti-foto)
// ==========================================
function hitungJarakLandmark(p1: any, p2: any) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function cekArahMenoleh(landmarks: any) {
  const outline = landmarks.getJawOutline();
  const nose = landmarks.getNose();

  const jarakKeKiri = hitungJarakLandmark(nose[6], outline[0]);
  const jarakKeKanan = hitungJarakLandmark(nose[6], outline[16]);

  const rasioToleh = jarakKeKiri / jarakKeKanan;

  if (rasioToleh > 1.8) return "KIRI";
  if (rasioToleh < 0.55) return "KANAN";

  return "LURUS";
}

function acakTantangan() {
  const opsi = ["KIRI", "KANAN"];
  tantanganAktif.value = opsi[Math.floor(Math.random() * opsi.length)];
}

// ==========================================
// LOOP DETEKSI ABSENSI
// ==========================================
const onPlayAbsensi = () => {
  if (!canvasAbsen.value) return;
  faceapi.matchDimensions(canvasAbsen.value, displaySize);

  sudahLolosTantangan.value = false;
  tantanganAktif.value = "";

  currentInterval = setInterval(async () => {
    if (!isModelLoaded.value) return;
    if (props.isScanPaused || isRegisteringProcess.value) return;

    if (
      !isKameraManualAktif.value ||
      !videoAbsen.value ||
      videoAbsen.value.paused ||
      videoAbsen.value.ended ||
      isProcessingAbsen
    )
      return;

    const detections = await faceapi
      .detectAllFaces(
        videoAbsen.value,
        new faceapi.TinyFaceDetectorOptions({ inputSize: FACE_INPUT_SIZE }),
      )
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const ctx = canvasAbsen.value?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, displaySize.width, displaySize.height);

    // RESET JIKA KARYAWAN PERGI
    if (detections.length === 0) {
      sudahLolosTantangan.value = false;
      tantanganAktif.value = "";
      setStatus("Posisikan wajah menatap kamera.", "info");
      return;
    }

    // 🌟 ANTI-SALAH KENAL: Tolak bila lebih dari satu wajah dalam satu frame
    if (detections.length > 1 && !isProcessingAbsen) {
      sudahLolosTantangan.value = false;
      tantanganAktif.value = "";
      setStatus("⚠️ Terlalu banyak wajah! Satu orang dalam satu frame.", "warning");
      return;
    }

    if (detections.length > 0 && faceMatcher.value && !isProcessingAbsen) {
      const mainDetection = detections[0];

      if (!tantanganAktif.value) {
        acakTantangan();
      }

      // PROTEKSI ANTI-FOTO: Challenge-Response (menoleh)
      if (!sudahLolosTantangan.value) {
        setStatus(`⚠️ VERIFIKASI: SILAKAN MENOLEH KE ${tantanganAktif.value}!`, "warning");

        const arahWajahSaatIni = cekArahMenoleh(mainDetection.landmarks);

        if (arahWajahSaatIni === tantanganAktif.value) {
          sudahLolosTantangan.value = true;
          setStatus("✅ LIVENESS VERIFIED! MENCARI DATA...", "success");
        } else {
          resizedDetections.forEach((det: any) => {
            new faceapi.draw.DrawBox(det.detection.box, {
              label: `TOLEH KE ${tantanganAktif.value}...`,
              boxColor: "#f59e0b",
            }).draw(canvasAbsen.value);
          });
          return;
        }
      }

      // JIKA TANTANGAN LOLOS, PROSES ABSENSI NORMAL
      resizedDetections.forEach((detection: any) => {
        const bestMatch = faceMatcher.value.findBestMatch(detection.descriptor);
        let labelTeks = "UNKNOWN TARGET";

        if (bestMatch.label !== "unknown" && !isProcessingAbsen) {
          isProcessingAbsen = true;
          const [nikKaryawan, namaKaryawan] = bestMatch.label.split("||");
          labelTeks = namaKaryawan.toUpperCase();
          triggerAbsensiMasuk(nikKaryawan, namaKaryawan, tipeAbsenAktif.value);

          sudahLolosTantangan.value = false;
          tantanganAktif.value = "";
        }

        const boxColor = bestMatch.label !== "unknown" ? "#10b981" : "#ef4444";
        new faceapi.draw.DrawBox(detection.detection.box, {
          label: labelTeks,
          boxColor: boxColor,
        }).draw(canvasAbsen.value);
      });
    }
  }, 600);
};

// ==========================================
// KIRIM DATA ABSENSI KE BACKEND
// ==========================================
async function triggerAbsensiMasuk(nikKaryawan: string, _namaKaryawan: string, typeValue: string) {
  const { API_URL } = useFaceApi();

  isProcessingAbsen = true;
  setStatus("AUTHENTICATING DATA...", "info");

  try {
    const response = await fetch(`${API_URL}/api/absensi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nik: nikKaryawan,
        checktype: typeValue,
        liveness_status: "VERIFIED",
      }),
    });

    const result = await response.json();

    if (response.ok) {
      setStatus("ABSENSI BERHASIL", "success");

      audioSuccess.currentTime = 0;
      audioSuccess.play().catch((err) => console.log(err));

      const dataBaru = {
        nik: String(result.detail.nik),
        nama: String(result.detail.nama),
        checktype: String(result.detail.checktype),
        jam: result.detail.jam,
      };

      absenTerakhir.value = dataBaru;
      localStorage.setItem("absen_terakhir", JSON.stringify(dataBaru));

      sudahLolosTantangan.value = false;
      tantanganAktif.value = "";

      setTimeout(() => {
        setStatus(
          isKameraManualAktif.value ? "READY TO IDENTIFY" : "KAMERA NONAKTIF (SCAN PAUSED)",
          isKameraManualAktif.value ? "info" : "warning",
        );
        isProcessingAbsen = false;
      }, 4000);
    } else {
      throw new Error(result.message || "Gagal verifikasi data");
    }
  } catch (err: any) {
    setStatus(String(err.message || err).toUpperCase(), "error");

    audioError.currentTime = 0;
    audioError.play().catch((e) => console.log(e));

    sudahLolosTantangan.value = false;
    tantanganAktif.value = "";

    setTimeout(() => {
      setStatus(
        isKameraManualAktif.value ? "READY TO IDENTIFY" : "KAMERA NONAKTIF (SCAN PAUSED)",
        isKameraManualAktif.value ? "info" : "warning",
      );
      isProcessingAbsen = false;
    }, 3000);
  }
}

// ==========================================
// TOGGLE KAMERA (SCAN)
// ==========================================
async function toggleKontrolKamera() {
  isKameraManualAktif.value = !isKameraManualAktif.value;

  if (!isKameraManualAktif.value) {
    if (currentInterval) {
      clearInterval(currentInterval);
      currentInterval = null;
    }

    hentikanStream();

    if (videoAbsen.value) videoAbsen.value.srcObject = null;

    const ctx = canvasAbsen.value?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, displaySize.width, displaySize.height);

    setStatus("KAMERA NONAKTIF (SCAN PAUSED)", "warning");
  } else {
    setStatus("RECONNECTING CAMERA...", "info");

    try {
      await jalankanKamera(videoAbsen.value);

      setTimeout(() => {
        if (isKameraManualAktif.value && !props.isScanPaused) {
          onPlayAbsensi();
        }
      }, 300);
    } catch (error) {
      isKameraManualAktif.value = false;
      setStatus("GAGAL MENGAKSES KAMERA!", "error");
      if (videoAbsen.value) videoAbsen.value.srcObject = null;
    }
  }
}

function handleVisibilityChange() {
  if (document.hidden) {
    if (currentInterval) {
      clearInterval(currentInterval);
      currentInterval = null;
    }
  } else {
    if (
      isModelLoaded.value &&
      isKameraManualAktif.value &&
      !props.isScanPaused &&
      videoAbsen.value
    ) {
      if (currentInterval) clearInterval(currentInterval);
      onPlayAbsensi();
    }
  }
}

// ==========================================
// LIFECYCLE
// ==========================================
onMounted(async () => {
  document.addEventListener("visibilitychange", handleVisibilityChange);

  if (!faceapi) return;

  try {
    if (!isModelLoaded.value) {
      await inisialisasiModel();
    }

    // 🌟 Selalu muat ulang database wajah setiap ScanView muncul kembali
    // (misal setelah registrasi/hapus di menu admin) agar matcher selalu terbaru
    await muatDatabaseWajah();

    if (isKameraManualAktif.value) {
      await jalankanKamera(videoAbsen.value);
      onPlayAbsensi();
    }
  } catch (err: any) {
    setStatus("MODEL LOADING FAILED: " + (err?.message || err), "error");
  }
});

onUnmounted(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = null;
  }
});

watch(
  () => props.isScanPaused,
  (v) => {
    if (v) {
      setStatus("AUTHENTICATING ADMIN (SCAN PAUSED)", "warning");
    } else if (isKameraManualAktif.value && !isProcessingAbsen) {
      setStatus("READY TO IDENTIFY", "info");
    } else if (!isKameraManualAktif.value) {
      setStatus("KAMERA NONAKTIF (SCAN PAUSED)", "warning");
    }
  },
);
</script>