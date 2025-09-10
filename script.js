const display = document.getElementById("display");
const statusText = document.getElementById("status");

// Tambah angka/operator ke layar
function appendValue(value) {
  display.value += value;
}

// Hapus layar
function clearDisplay() {
  display.value = "";
}

// Hitung hasil
function calculate() {
  try {
    display.value = eval(display.value);
  } catch {
    display.value = "Error";
  }
}

// Tombol keluar
function exitApp() {
  const simpan = confirm("Yakin mau keluar? Tekan OK untuk Simpan, Cancel untuk keluar tanpa simpan.");

  if (simpan) {
    localStorage.setItem("dimsumCalcData", display.value);
    alert("Data berhasil disimpan!");
  } else {
    localStorage.removeItem("dimsumCalcData"); // buang data kalau tidak disimpan
  }

  // "Keluar" → redirect ke halaman kosong
  window.location.href = "about:blank";
}

// Saat aplikasi dibuka, cek data terakhir
window.onload = () => {
  const savedData = localStorage.getItem("dimsumCalcData");
  if (savedData) {
    display.value = savedData;
    statusText.textContent = "Data terakhir dipulihkan ✅";
  } else {
    statusText.textContent = "Tidak ada data tersimpan";
  }
};
