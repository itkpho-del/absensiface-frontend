// ============================================================
// useFaceProfile.ts — Daftar profil wajah terdaftar + hapus (singleton)
// ============================================================
import { ref, computed } from "vue";
import axios from "axios";
import { useFaceApi } from "./useFaceApi";
import { useToast } from "./useToast";

const daftarWajahTerdaftar = ref<any[]>([]);
const kataKunciCari = ref("");
const nikYangAkanDihapus = ref<string | null>(null);

const daftarWajahTersaring = computed(() => {
  if (!daftarWajahTerdaftar.value) return [];

  const query = kataKunciCari.value.trim().toLowerCase();
  if (!query) return daftarWajahTerdaftar.value;

  return daftarWajahTerdaftar.value.filter((profil) => {
    const nik = (profil.nik || "").toLowerCase();
    const nama = (profil.nama || "").toLowerCase();
    const lokasi = (profil.lokasi || "").toLowerCase();
    return nik.includes(query) || nama.includes(query) || lokasi.includes(query);
  });
});

async function ambilDaftarWajah() {
  const { API_URL } = useFaceApi();
  try {
    const response = await axios.get(`${API_URL}/api/facekaryawan`);
    daftarWajahTerdaftar.value = response.data;
  } catch (error) {
    console.error("Gagal memuat data wajah terdaftar:", error);
  }
}

function picuKonfirmasiHapus(nik: string) {
  const { toastType, toastTeks, showToast, apakahIniProsesHapus } = useToast();

  nikYangAkanDihapus.value = nik;
  apakahIniProsesHapus.value = true;
  toastType.value = "warning";
  toastTeks.value = `Apakah Anda yakin ingin menghapus profil biometrik NIK ${nik}?`;
  showToast.value = true;
}

async function eksekusiHapusWajah() {
  const { API_URL } = useFaceApi();
  const { tampilkanToast, apakahIniProsesHapus } = useToast();

  if (!nikYangAkanDihapus.value) return;

  try {
    const response = await axios.delete(`${API_URL}/api/facekaryawan/${nikYangAkanDihapus.value}`);

    if (response.data.success) {
      tampilkanToast(response.data.message, "success");
      nikYangAkanDihapus.value = null;
      apakahIniProsesHapus.value = false;
      ambilDaftarWajah();
    }
  } catch (error: any) {
    console.error("Gagal menghapus wajah:", error);
    const pesanGagal = error.response?.data?.message || "Gagal menghapus profil wajah.";
    tampilkanToast(pesanGagal, "error");
    nikYangAkanDihapus.value = null;
    apakahIniProsesHapus.value = false;
  }
}

export function useFaceProfile() {
  return {
    daftarWajahTerdaftar,
    kataKunciCari,
    daftarWajahTersaring,
    nikYangAkanDihapus,
    ambilDaftarWajah,
    picuKonfirmasiHapus,
    eksekusiHapusWajah,
  };
}