<template>
  <!-- MODE 2: REGISTRASI PROFIL BIOMETRIK -->
  <div class="max-w-5xl mx-auto space-y-4 overflow-y-auto max-h-[calc(100vh-100px)] pr-1 animate-fade">
    
    <!-- PANEL 1: ENROLL NEW BIOMETRIC PROFILE -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden w-full">
      <div class="px-5 py-3 border-b border-slate-100 bg-slate-50/70 select-none">
        <h3 class="text-xs font-black text-slate-900 tracking-wider uppercase">Registrasi Biometric</h3>
      </div>

      <div class="p-4 md:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center w-full">
        <!-- Left Panel: Form Input -->
        <div class="lg:col-span-5 space-y-3.5 w-full">
          <p class="text-[11px] text-slate-500 font-medium leading-relaxed bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-inner select-none">
            💡 Cukup klik kolom di bawah untuk memilih NIK Karyawan. Sistem akan otomatis mencocokkan nama resmi yang terdaftar di database HRD.
          </p>

          <div class="space-y-1.5 w-full">
            <label class="text-[11px] font-black text-slate-600 tracking-wider">Nomor Induk Karyawan (NIK)</label>
            <div class="relative cursor-pointer group" @click="bukaLovKaryawan">
              <input
                v-model="nik"
                type="text"
                placeholder="Klik untuk memilih karyawan..."
                class="w-full pl-3.5 pr-10 py-2.5 text-xs bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer text-slate-900 font-bold transition-all"
                readonly
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                <svg class="w-4 h-4 text-slate-400 transition-colors group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="space-y-1.5 w-full">
            <label class="text-[11px] font-black text-slate-600 tracking-wider ">Nama Karyawan</label>
            <input
              v-model="namaKaryawanTerpilih"
              type="text"
              placeholder="Otomatis terisi setelah memilih NIK..."
              class="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-400 font-bold cursor-not-allowed focus:outline-none select-none"
              readonly
            />
          </div>
          <div class="space-y-1.5 w-full">
            <label class="text-[11px] font-black text-slate-600 tracking-wider ">Kode Store</label>
            <input
              v-model="kodeStoreTerpilih"
              type="text"
              placeholder="Otomatis terisi setelah memilih NIK..."
              class="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-400 font-bold cursor-not-allowed focus:outline-none select-none"
              readonly
            />
          </div>

          <button 
            @click="registerWajah(nik)" 
            class="w-full mt-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-md shadow-blue-600/10 hover:shadow-lg transition-all duration-200 text-xs tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer"
          >
            🔒 SCAN & VERIFIKASI WAJAH
          </button>
        </div>

        <!-- Right Panel: Camera Viewfinder -->
        <div class="lg:col-span-7 w-full flex justify-center">
          <div class="relative w-full aspect-[4/3] max-w-xs rounded-2xl overflow-hidden bg-slate-950 shadow-md border border-slate-800">
            <video
              ref="videoReg"
              @play="onPlayRegistrasi"
              class="w-full h-full object-cover scale-x-[-1]"
              autoplay
              muted
              playsinline
            ></video>
            <canvas ref="canvasReg" class="absolute inset-0 w-full h-full pointer-events-none"></canvas>
          </div>
          <div>
            <button
              @click="toggleKontrolRegistrasiKamera"
              class="px-4 py-1.5 rounded-xl text-xs font-extrabold tracking-wide transition-all duration-200 border cursor-pointer shadow-sm ml-2"
              :class="isKameraManualAktif 
                ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'"
            >
              <span v-if="isKameraManualAktif">📷 ON</span>
              <span v-else>🎥 OFF</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- PANEL 2: REGISTERED FACE PROFILES (DENGAN FILTER REALTIME) -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden w-full">
      <div class="px-5 py-3 border-b border-slate-100 bg-slate-50/70 select-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <h3 class="text-xs font-black text-slate-900 tracking-wider uppercase">REGISTERED FACE PROFILES</h3>
          <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">Total: {{ daftarWajahTersaring.length }}</span>
        </div>

        <div class="relative w-full sm:max-w-xs">
          <input
            v-model="kataKunciCari"
            type="text"
            placeholder="Cari NIK, nama, atau kode pabrik..."
            class="w-full pl-3.5 pr-8 py-1.5 text-xs bg-white border border-slate-300 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-900 transition-all placeholder:font-medium placeholder:text-slate-400"
          />
          <button 
            v-if="kataKunciCari" 
            @click="kataKunciCari = ''"
            class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
          >
            &times;
          </button>
        </div>
      </div>

      <div class="p-4 w-full">
        <div class="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white w-full">
          <div class="h-[220px] max-h-[220px] overflow-y-auto w-full">
            <table class="w-full text-left border-collapse text-xs table-fixed">
              <thead class="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500 font-black tracking-wider uppercase z-10 select-none">
                <tr>
                  <th class="px-4 py-2 w-1/5 text-[10px]">NIK</th>
                  <th class="px-4 py-2 w-2/5 text-[10px]">NAMA KARYAWAN</th>
                  <th class="px-4 py-2 w-1/5 text-[10px] text-center">LOKASI / STATUS</th>
                  <th class="px-4 py-2 w-1/5 text-[10px] text-center">AKSI</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr v-for="profil in daftarWajahTersaring" :key="profil.nik" class="hover:bg-slate-50/80 transition-colors duration-150">
                  <td class="px-4 py-2.5 font-mono font-bold text-slate-400 truncate">{{ profil.nik }}</td>
                  <td class="px-4 py-2.5 font-extrabold text-slate-900 truncate">{{ profil.nama?.toUpperCase() }}</td>
                  <td class="px-4 py-2.5 text-center space-y-1">
                    <span class="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded text-[9px] uppercase font-mono">{{ profil.lokasi || '-' }}</span>
                    <span class="inline-block ml-1 px-2 py-0.5 font-bold rounded text-[9px]" :class="profil.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'">{{ profil.status }}</span>
                  </td>
                  <td class="px-4 py-2.5 text-center">
                    <button @click="picuKonfirmasiHapus(profil.nik)" class="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[10px] font-bold hover:bg-rose-100 transition-colors cursor-pointer">🗑️ HAPUS</button>
                  </td>
                </tr>
                <tr v-if="daftarWajahTersaring.length === 0">
                  <td colspan="4" class="px-4 py-8 text-center text-slate-400 font-medium italic select-none">
                    {{ daftarWajahTerdaftar.length === 0 ? 'Belum ada profil biometrik wajah di database.' : 'Data karyawan yang Anda cari tidak ditemukan.' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- PANEL 3: TRANSFER LOG ABSENSI -->
    <div class="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden w-full">
      <div class="px-5 py-3 border-b border-slate-100 bg-slate-50/70 select-none flex justify-between items-center">
        <h3 class="text-xs font-black text-slate-900 tracking-wider uppercase">TRANSFER DATA</h3>
        <span class="text-[9px] font-bold text-slate-400 tracking-widest uppercase">SYNC ENGINE</span>
      </div>

      <div class="p-4 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div class="space-y-1.5 max-w-md">
            <label class="text-[11px] font-black text-slate-600 tracking-wider uppercase">Mulai Tanggal</label>
            <input type="date" v-model="tanggalMulai" class="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-900 shadow-sm" />
          </div>
          <div class="space-y-1.5 w-full">
            <label class="text-[11px] font-black text-slate-600 tracking-wider uppercase">Sampai Tanggal</label>
            <input type="date" v-model="tanggalSelesai" class="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-900 shadow-sm" />
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between items-center select-none">
            <label class="text-[11px] font-black text-slate-600 tracking-wider uppercase">Pilih Cabang / Pabrik</label>
            <button @click="pilihSemuaCabang" type="button" class="text-[10px] font-extrabold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 transition-colors cursor-pointer">
              {{ cabangTerpilih.length === daftarCabang.length ? '🛑 BATALKAN SEMUA' : '✅ PILIH SEMUA CABANG' }}
            </button>
          </div>

          <div class="border border-slate-200 rounded-xl p-2 bg-slate-50/50 max-h-[42vh] overflow-y-auto shadow-inner">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <label v-for="kode in daftarCabang" :key="kode.kode_cabang" class="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg shadow-xs hover:border-blue-300 transition-all cursor-pointer text-xs font-bold text-slate-700 select-none">
                <input type="checkbox" :value="kode.kode_cabang" v-model="cabangTerpilih" class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                <span class="truncate uppercase tracking-wide text-slate-900">{{ kode.kode_cabang }}</span>
                <span class="text-slate-500 text-[10px] font-bold truncate uppercase">
                    {{ kode.pab_nama || 'Nama Belum Diatur' }}
                  </span>
              </label>
            </div>
            <p v-if="daftarCabang.length === 0" class="text-center text-xs text-slate-400 italic py-2">Memuat kode lokasi cabang...</p>
          </div>
        </div>

        <button @click="prosesTransferData" :disabled="isTransferring" class="max-w-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-2.5 px-4 rounded-xl shadow-md transition-all duration-200 text-xs tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
          <span v-if="isTransferring">⏳ SEDANG MEMPROSES SINKRONISASI...</span>
          <span v-else>🚀 Transfer Data Absensi</span>
        </button>
      </div>
    </div>
  </div>

  <!-- MODAL LOV KARYAWAN -->
  <div v-if="showLovKaryawan" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[75vh] transform transition-all">
      <div class="p-4 border-b border-slate-100 bg-slate-50/70 shrink-0 select-none">
        <div class="flex items-center gap-3">
          <span class="text-xl">🔍</span>
          <div>
            <h3 class="text-xs font-black text-slate-900 uppercase tracking-wider">PILIH KARYAWAN AKTIF</h3>
            <p class="text-[11px] text-slate-500 font-medium mt-0.5">Silakan cari nama atau NIK karyawan untuk registrasi wajah.</p>
          </div>
        </div>
      </div>

      <div class="p-4 flex-1 overflow-y-auto space-y-3 w-full">
        <div class="space-y-1.5 w-full">
          <label class="text-[9px] font-black text-slate-400 tracking-widest uppercase block select-none">PENCARIAN KARYAWAN</label>
          <input
            type="text"
            v-model="searchKaryawan"
            placeholder="Ketik NIK atau nama..."
            class="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 text-xs font-bold text-slate-900 shadow-inner"
            autofocus
          />
        </div>

        <div v-if="isLoadingLov" class="text-center py-6 text-slate-400 text-xs font-bold flex items-center justify-center gap-2 select-none">
          <span class="animate-spin text-base">⏳</span> Memuat data master karyawan...
        </div>

        <div v-else class="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white w-full">
          <div class="max-h-[24vh] overflow-y-auto w-full">
            <table class="w-full text-left border-collapse text-xs table-fixed">
              <thead class="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500 font-black tracking-wider uppercase z-10 select-none">
                <tr>
                  <th class="px-4 py-2.5 w-1/3 text-[10px]">NIK</th>
                  <th class="px-4 py-2.5 text-[10px]">NAMA KARYAWAN</th>
                  <th class="px-4 py-2.5 text-[10px]">KODE STORE</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr
                  v-for="karyawan in filteredKaryawan"
                  :key="karyawan.nik"
                  @click="pilihKaryawan(karyawan)"
                  class="hover:bg-blue-50/70 cursor-pointer transition-colors duration-150 group"
                >
                  <td class="px-4 py-2.5 font-mono font-bold text-slate-400 group-hover:text-blue-600 truncate">{{ karyawan.nik }}</td>
                  <td class="px-4 py-2.5 font-extrabold text-slate-900 group-hover:text-blue-700 truncate">{{ karyawan.nama.toUpperCase() }}</td>
                  <td class="px-4 py-2.5 font-extrabold text-slate-900 group-hover:text-blue-700 truncate">{{ karyawan.pabrik.toUpperCase() }}</td>
                </tr>
                <tr v-if="filteredKaryawan.length === 0">
                  <td colspan="3" class="px-4 py-6 text-center text-slate-400 font-medium italic select-none">
                    Data karyawan tidak ditemukan
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="p-3 border-t border-slate-100 bg-slate-50/70 flex justify-end shrink-0">
        <button 
          @click="tutupLovKaryawan" 
          class="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold py-1.5 px-4 rounded-xl transition-colors duration-150 text-xs tracking-wide cursor-pointer"
        >
          TUTUP
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import axios from "axios";
import { useFaceApi } from "@/composables/useFaceApi";
import { useFaceProfile } from "@/composables/useFaceProfile";
import { useToast } from "@/composables/useToast";

const {
  API_URL,
  faceapi,
  displaySize,
  FACE_REGISTER_INPUT_SIZE,
  isModelLoaded,
  isRegisteringProcess,
  isKameraManualAktif,
  setStatus,
  jalankanKamera,
  hentikanStream,
} = useFaceApi();

const { tampilkanToast } = useToast();

const {
  daftarWajahTerdaftar,
  kataKunciCari,
  daftarWajahTersaring,
  ambilDaftarWajah,
  picuKonfirmasiHapus,
} = useFaceProfile();

const videoReg = ref<HTMLVideoElement | null>(null);
const canvasReg = ref<HTMLCanvasElement | null>(null);
let currentInterval: ReturnType<typeof setInterval> | null = null;

// Config registrasi (rata-rata beberapa frame agar vektor stabil)
const JUMLAH_FRAME_REGISTRASI = 5;
const JEDA_FRAME_REGISTRASI = 250; // ms antar frame
const TOLERANSI_CONSISTENCY = 0.7; // jarak maks antar frame dengan frame pertama

// ==========================================
// STATE LOV KARYAWAN
// ==========================================
const showLovKaryawan = ref(false);
const listKaryawan = ref<any[]>([]);
const searchKaryawan = ref("");
const isLoadingLov = ref(false);
const nik = ref("");
const namaKaryawanTerpilih = ref("");
const kodeStoreTerpilih = ref("");

const filteredKaryawan = computed(() => {
  if (!searchKaryawan.value) return listKaryawan.value;
  const keyword = searchKaryawan.value.toLowerCase();
  return listKaryawan.value.filter(
    (k) =>
      String(k.nik).toLowerCase().includes(keyword) ||
      String(k.nama).toLowerCase().includes(keyword) ||
      String(k.pabrik).toLowerCase().includes(keyword),
  );
});

async function bukaLovKaryawan() {
  showLovKaryawan.value = true;
  searchKaryawan.value = "";

  if (listKaryawan.value.length === 0) {
    await fetchDataKaryawan();
  }
}

async function fetchDataKaryawan() {
  isLoadingLov.value = true;
  try {
    const response = await fetch(`${API_URL}/api/karyawan`);
    if (response.ok) {
      const data = await response.json();
      listKaryawan.value = data;
    } else {
      tampilkanToast("Gagal memuat daftar karyawan", "warning");
    }
  } catch (err) {
    console.error("Error Fetch Karyawan:", err);
    tampilkanToast("Koneksi ke server gagal", "error");
  } finally {
    isLoadingLov.value = false;
  }
}

function pilihKaryawan(karyawan: any) {
  nik.value = karyawan.nik;
  namaKaryawanTerpilih.value = karyawan.nama;
  kodeStoreTerpilih.value = karyawan.pabrik;
  showLovKaryawan.value = false;
}

function tutupLovKaryawan() {
  showLovKaryawan.value = false;
}

// ==========================================
// LOOP DETEKSI REGISTRASI (preview kotak wajah)
// ==========================================
const onPlayRegistrasi = () => {
  if (!canvasReg.value) return;
  faceapi.matchDimensions(canvasReg.value, displaySize);

  currentInterval = setInterval(async () => {
    if (!isModelLoaded.value || isRegisteringProcess.value) return;

    if (
      !isKameraManualAktif.value ||
      !videoReg.value ||
      videoReg.value.paused ||
      videoReg.value.ended ||
      isRegisteringProcess.value
    )
      return;

    const detections = await faceapi.detectAllFaces(
      videoReg.value,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 128 }),
    );
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const ctx = canvasReg.value?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, displaySize.width, displaySize.height);
    if (detections.length > 0) {
      faceapi.draw.drawDetections(canvasReg.value, resizedDetections);
    }
  }, 500);
};

// ==========================================
// TOGGLE KAMERA (REGISTRASI)
// ==========================================
async function toggleKontrolRegistrasiKamera() {
  isKameraManualAktif.value = !isKameraManualAktif.value;

  if (!isKameraManualAktif.value) {
    if (currentInterval) {
      clearInterval(currentInterval);
      currentInterval = null;
    }

    hentikanStream();

    if (videoReg.value) videoReg.value.srcObject = null;

    const ctx = canvasReg.value?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, displaySize.width, displaySize.height);
  } else {
    try {
      await jalankanKamera(videoReg.value);

      setTimeout(() => {
        if (isKameraManualAktif.value) {
          onPlayRegistrasi();
        }
      }, 300);
    } catch (error) {
      isKameraManualAktif.value = false;
      if (videoReg.value) videoReg.value.srcObject = null;
    }
  }
}

// ==========================================
// REGISTRASI WAJAH (AVERAGE BEBERAPA FRAME)
// ==========================================
async function registerWajah(nikValue: string) {
  if (!nikValue) {
    tampilkanToast("Masukkan NIK terlebih dahulu!", "warning");
    return;
  }

  if (!isModelLoaded.value) {
    tampilkanToast("Model belum siap, harap tunggu sebentar.", "warning");
    return;
  }

  isRegisteringProcess.value = true;
  setStatus("MENGANALISIS WAJAH (5 FRAME)... JANGAN BERGERAK", "info");

  try {
    const daftarDeskriptor: number[][] = [];
    let deskriptorPertama: number[] | null = null;

    for (let i = 0; i < JUMLAH_FRAME_REGISTRASI; i++) {
      const deteksi = await faceapi
        .detectSingleFace(
          videoReg.value,
          new faceapi.TinyFaceDetectorOptions({ inputSize: FACE_REGISTER_INPUT_SIZE }),
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!deteksi) {
        setStatus("✅ Siap Scan", "info");
        tampilkanToast(
          "⚠️ Wajah tidak konsisten terdeteksi. Pastikan wajah selalu terlihat kamera.",
          "warning",
        );
        isRegisteringProcess.value = false;
        return;
      }

      const deskriptor = Array.from(deteksi.descriptor) as unknown as number[];

      // Cek orang di frame masih SAMA dengan frame pertama
      if (deskriptorPertama) {
        const jarak = faceapi.euclideanDistance(deskriptorPertama, deskriptor);
        if (jarak > TOLERANSI_CONSISTENCY) {
          setStatus("✅ Siap Scan", "info");
          tampilkanToast(
            "⚠️ Wajah berubah di tengah perekaman! Ulangi, jangan ada orang lain masuk frame.",
            "warning",
          );
          isRegisteringProcess.value = false;
          return;
        }
      } else {
        deskriptorPertama = deskriptor;
      }

      daftarDeskriptor.push(deskriptor);

      if (i < JUMLAH_FRAME_REGISTRASI - 1) {
        await new Promise((resolve) => setTimeout(resolve, JEDA_FRAME_REGISTRASI));
      }
    }

    // Rata-rata semua vektor 128-dimensi
    const vektorRataRata = daftarDeskriptor[0].map((_, index) => {
      const jumlah = daftarDeskriptor.reduce((total, d) => total + d[index], 0);
      return jumlah / daftarDeskriptor.length;
    });

    setStatus("✅ Siap Scan", "info");

    const response = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nik: nikValue,
        face_vektor: vektorRataRata,
        kode_pabrik: kodeStoreTerpilih.value,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      tampilkanToast(
        `🎉 SUKSES!\nWajah atas nama: ${result.detail.nama} (${result.detail.nik}) berhasil didaftarkan.`,
        "success",
      );

      ambilDaftarWajah();

      nik.value = "";
      namaKaryawanTerpilih.value = "";
      kodeStoreTerpilih.value = "";
      isRegisteringProcess.value = false;
    } else {
      tampilkanToast(`❌ Gagal Mendaftar:\n${result.message}`, "error");
      isRegisteringProcess.value = false;
    }
  } catch (err: any) {
    setStatus("✅ Siap Scan", "info");
    tampilkanToast("Error Sistem: " + (err?.message || err), "error");
    isRegisteringProcess.value = false;
  }
}

// ==========================================
// TRANSFER DATA ABSENSI
// ==========================================
const dapatkanTanggalHariIni = () => {
  const d = new Date();
  const tahun = d.getFullYear();
  const bulan = String(d.getMonth() + 1).padStart(2, "0");
  const tanggal = String(d.getDate()).padStart(2, "0");

  return `${tahun}-${bulan}-${tanggal}`;
};

const tanggalMulai = ref(dapatkanTanggalHariIni());
const tanggalSelesai = ref(dapatkanTanggalHariIni());
const daftarCabang = ref<any[]>([]);
const cabangTerpilih = ref<string[]>([]);
const isTransferring = ref(false);

const ambilDaftarCabang = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/cabang`);
    daftarCabang.value = response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar cabang:", error);
  }
};

const pilihSemuaCabang = () => {
  if (cabangTerpilih.value.length === daftarCabang.value.length) {
    cabangTerpilih.value = [];
  } else {
    cabangTerpilih.value = daftarCabang.value.map((c) => c.kode_cabang);
  }
};

const prosesTransferData = async () => {
  if (!tanggalMulai.value || !tanggalSelesai.value || cabangTerpilih.value.length === 0) {
    tampilkanToast("Mohon lengkapi tanggal dan pilih minimal satu cabang!", "warning");
    return;
  }

  isTransferring.value = true;
  try {
    const response = await axios.post(`${API_URL}/api/absensi/transfer`, {
      tanggalMulai: tanggalMulai.value,
      tanggalSelesai: tanggalSelesai.value,
      cabang: cabangTerpilih.value,
    });

    if (response.data.success) {
      tampilkanToast(response.data.message, "success");
      cabangTerpilih.value = [];
    }
  } catch (error: any) {
    tampilkanToast(error.response?.data?.message, "error");
  } finally {
    isTransferring.value = false;
  }
};

// ==========================================
// VISIBILITY + LIFECYCLE
// ==========================================
function handleVisibilityChange() {
  if (document.hidden) {
    if (currentInterval) {
      clearInterval(currentInterval);
      currentInterval = null;
    }
  } else {
    if (isModelLoaded.value && isKameraManualAktif.value && videoReg.value) {
      if (currentInterval) clearInterval(currentInterval);
      onPlayRegistrasi();
    }
  }
}

onMounted(async () => {
  document.addEventListener("visibilitychange", handleVisibilityChange);

  if (!faceapi) return;

  if (isModelLoaded.value && isKameraManualAktif.value) {
    try {
      await jalankanKamera(videoReg.value);
      onPlayRegistrasi();
    } catch (err) {
      console.error("Gagal menyalakan kamera registrasi:", err);
    }
  }

  ambilDaftarWajah();
  ambilDaftarCabang();
});

onUnmounted(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = null;
  }
});
</script>