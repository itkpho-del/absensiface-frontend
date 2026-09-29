<template>
  <!-- MAIN CONTAINER -->
  <div class="flex flex-col md:flex-row h-screen w-full bg-slate-100 text-slate-800 antialiased font-sans overflow-hidden">
    
    <!-- SIDEBAR -->
    <aside class="w-full md:w-64 bg-slate-700 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between p-5 shrink-0 shadow-sm z-20 md:h-full">
      <div class="w-full">
        <!-- Logo Area -->
        <div class="flex items-center gap-3 mb-6 w-full">
          <div class="text-3xl select-none drop-shadow-sm">⏱️</div>
          <div class="flex flex-col">
            <h2 class="text-base font-black tracking-wider text-white leading-tight bg-gradient-to-r from-slate-950 to-slate-700 bg-clip-text text-transparent">Kencanaprint</h2>
            <span class="text-[9px] font-bold tracking-widest text-white  leading-none mt-0.5">Attendance System</span>
          </div>
        </div>

        <!-- Live Clock Widget -->
        <div class="w-full bg-emerald-50 from-slate-50 to-slate-100/50 border border-slate-200/80 rounded-xl p-4 mb-6 text-center shadow-sm">
          <div class="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-1 select-none">{{ tanggalRealtime }}</div>
          <div class="text-2xl font-black text-slate-900 tracking-tight font-mono">{{ jamRealtime }}</div>
        </div>

        <!-- Nav Menu -->
        <nav class="space-y-1.5 w-full">
          <button
            @click="klikMenuAbsensi"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer text-left group"
            :class="!isModeRegistrasi ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
          >
            <span class="text-white transition-transform group-hover:scale-110">👤</span> Scan Absensi
          </button>
          <button
            @click="klikMenuAdmin"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer text-left group"
            :class="isModeRegistrasi ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
          >
            <span class="text-white transition-transform group-hover:scale-110">⚙️</span> Menu Admin
          </button>
        </nav>
      </div>

      <!-- Sidebar Footer -->
      <div class="text-[11px] text-slate-400 font-semibold flex items-center gap-2 mt-4 md:mt-0 pt-4 border-t border-slate-100 select-none">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Secure Cloud Connected
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="flex-1 p-4 md:p-6 overflow-y-auto w-full h-[calc(100vh-80px)] md:h-full">
      <!-- VIEW ABSENSI -->
      <ScanView v-if="!isModeRegistrasi" :is-scan-paused="isScanPaused" />

      <!-- VIEW ADMIN (REGISTRASI) -->
      <AdminView v-else />
    </main>

    <!-- MODAL SECURE PASSWORD ADMINISTRATOR -->
    <div v-if="showModalPassword" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
        <div class="p-5 text-center border-b border-slate-100 bg-slate-50/70 select-none">
          <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg mx-auto mb-2 border border-blue-100">🔒</div>
          <h3 class="text-xs font-black text-slate-900 uppercase tracking-wider">ADMINISTRATOR VERIFICATION</h3>
          <p class="text-[11px] text-slate-500 font-medium mt-1">Masukkan password otentikasi untuk membuka akses registrasi.</p>
        </div>

        <div class="p-5 space-y-4">
          <div class="space-y-1.5 w-full">
            <label class="text-[9px] font-black text-slate-400 tracking-widest uppercase block text-center select-none">PASSWORD SECURITY</label>
            <input
              v-model="passwordAdminInput"
              type="password"
              placeholder="••••••••"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-mono text-lg tracking-widest text-slate-900 shadow-inner"
              @keyup.enter="prosesVerifikasiPasswordModal"
            />
          </div>

          <div class="flex gap-3 pt-1">
            <button 
              @click="batalMasukRegistrasi" 
              class="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition-colors duration-150 text-xs tracking-wide cursor-pointer"
            >
              CANCEL
            </button>
            <button 
              @click="prosesVerifikasiPasswordModal" 
              class="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-2.5 px-4 rounded-xl shadow-md shadow-blue-600/10 transition-colors duration-150 text-xs tracking-wide cursor-pointer"
            >
              VERIFY
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TOAST NOTIFICATION -->
    <transition 
      enter-active-class="transform ease-out duration-300 transition-all"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200 transition-all"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="showToast" 
        class="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white border rounded-2xl shadow-xl flex flex-col overflow-hidden border-l-4"
        :class="{
          'border-l-amber-500': toastType === 'warning',
          'border-l-emerald-500': toastType === 'success',
          'border-l-rose-500': toastType === 'error'
        }"
      >
        <div class="p-4 flex items-start">
          <div class="text-xl mr-3 shrink-0 select-none">
            <span v-if="toastType === 'warning'">⚠️</span>
            <span v-if="toastType === 'success'">✅</span>
            <span v-if="toastType === 'error'">❌</span>
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-xs font-black text-slate-900 leading-none mb-0.5 select-none">
              {{
                toastType === "warning"
                  ? (apakahIniProsesHapus ? "Konfirmasi Hapus" : "Perhatian")
                  : toastType === "success"
                    ? "Sukses"
                    : "Gagal"
              }}
            </p>
            <p class="text-[11px] text-slate-500 font-medium leading-normal">{{ toastTeks }}</p>

            <div v-if="toastType === 'warning' && apakahIniProsesHapus" class="flex gap-2 mt-2.5 pt-1">
              <button 
                @click="konfirmasiHapusYa"
                class="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black tracking-wider uppercase shadow-sm transition-colors cursor-pointer"
              >
                YA, HAPUS
              </button>
              <button 
                @click="batalHapus"
                class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200 transition-colors cursor-pointer"
              >
                BATAL
              </button>
            </div>
          </div>

          <button 
            @click="batalHapus" 
            class="ml-4 text-slate-400 hover:text-slate-600 font-bold text-lg leading-none select-none transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>

        <div 
          class="h-[3px] w-full origin-left animate-toast-progress"
          :class="{
            'bg-amber-500': toastType === 'warning',
            'bg-emerald-500': toastType === 'success',
            'bg-rose-500': toastType === 'error'
          }"
          :style="{ animationDuration: toastDurationStyle }"
        ></div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import ScanView from "@/components/scan/ScanView.vue";
import AdminView from "@/components/admin/AdminView.vue";
import { useFaceApi } from "@/composables/useFaceApi";
import { useToast } from "@/composables/useToast";
import { useFaceProfile } from "@/composables/useFaceProfile";

const { API_URL } = useFaceApi();
const {
  toastTeks,
  showToast,
  toastType,
  toastDurationStyle,
  apakahIniProsesHapus,
  tampilkanToast,
  tutupToast,
} = useToast();
const { nikYangAkanDihapus, eksekusiHapusWajah } = useFaceProfile();

const isModeRegistrasi = ref(false);
const isScanPaused = ref(false);
const showModalPassword = ref(false);
const passwordAdminInput = ref("");

const jamRealtime = ref("--:--");
const tanggalRealtime = ref("---, -- --- ----");

let timeOffset = 0;
let clockAnimationId: number | null = null;

async function startLiveClock() {
  try {
    const response = await fetch(`${API_URL}/api/server-time`);
    const data = await response.json();

    const waktuServer = data.serverTime;
    const waktuLokal = new Date().getTime();

    timeOffset = waktuServer - waktuLokal;
  } catch (err) {
    console.error("Gagal mengambil jam server, menggunakan waktu lokal:", err);
    timeOffset = 0;
  }

  let lastSecond = -1;

  const updateWaktu = () => {
    const sekarangLokal = new Date().getTime();
    const sekarangServer = new Date(sekarangLokal + timeOffset);

    const detikSekarang = sekarangServer.getSeconds();

    if (detikSekarang !== lastSecond) {
      lastSecond = detikSekarang;

      jamRealtime.value = sekarangServer.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      tanggalRealtime.value = sekarangServer
        .toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "short",
          day: "numeric",
        })
        .toUpperCase();
    }

    clockAnimationId = requestAnimationFrame(updateWaktu);
  };

  if (clockAnimationId) {
    cancelAnimationFrame(clockAnimationId);
    clockAnimationId = null;
  }

  clockAnimationId = requestAnimationFrame(updateWaktu);
}

// ==========================================
// NAVIGASI MENU
// ==========================================
function klikMenuAdmin() {
  if (isModeRegistrasi.value) return;

  // Hentikan sementara scan absensi lewat prop isScanPaused
  isScanPaused.value = true;
  passwordAdminInput.value = "";
  showModalPassword.value = true;
}

function klikMenuAbsensi() {
  if (!isModeRegistrasi.value) return;
  isModeRegistrasi.value = false;
}

// ==========================================
// MODAL PASSWORD ADMIN
// ==========================================
async function prosesVerifikasiPasswordModal() {
  if (!passwordAdminInput.value) {
    tampilkanToast("Password tidak boleh kosong!", "warning");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/admin/verify-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwordAdminInput.value }),
    });

    const result = await response.json();

    if (response.ok) {
      showModalPassword.value = false;
      isScanPaused.value = false;
      passwordAdminInput.value = "";
      isModeRegistrasi.value = true; // AdminView yang menggantikan ScanView
    } else {
      tampilkanToast(`❌ Akses Ditolak: ${result.message}`, "warning");
    }
  } catch (err) {
    tampilkanToast("❌ Gagal terhubung ke server autentikasi!", "warning");
  }
}

function batalMasukRegistrasi() {
  showModalPassword.value = false;
  isScanPaused.value = false;
  passwordAdminInput.value = "";
}

// ==========================================
// TOAST KONFIRMASI HAPUS
// ==========================================
function konfirmasiHapusYa() {
  eksekusiHapusWajah();
  tutupToast();
}

function batalHapus() {
  tutupToast();
  nikYangAkanDihapus.value = null;
  apakahIniProsesHapus.value = false;
}

onMounted(() => {
  startLiveClock();
});

onUnmounted(() => {
  if (clockAnimationId) {
    cancelAnimationFrame(clockAnimationId);
    clockAnimationId = null;
  }
});
</script>