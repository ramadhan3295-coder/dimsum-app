// ===== Util =====
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function formatRp(n){return "Rp " + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,".");}

// ===== Konstanta Produk =====
const isiBox = {
  3:3,4:4,5:5,6:6,8:8,10:10,12:12,20:20,25:25,
  50:50,100:100,200:200,300:300,500:500,1000:1000
};
const hargaBox = {
  jumbofrozen:{4:8000,6:12000,8:16000,10:20000,50:105000,100:210000,200:400000,300:600000,500:950000,1000:1900000},
  mentai:{3:13000,4:16000,6:24000,8:32000},
  original:{3:10000,4:12000,6:18000,8:24000},
  mediumfrozen:{5:10000,10:20000,20:40000,25:50000,50:90000,100:180000,200:340000,300:510000,500:800000,1000:1600000},
  mediummentai:{5:15000,10:30000,12:35000,20:58000,25:72500},
  mediumoriginal:{5:13000,10:25000,20:50000,25:62500}
};
const hppBox = {
  jumbofrozen:{4:7200,6:10800,8:14400,10:18000,50:90000,100:180000,200:360000,300:540000,500:900000,1000:1800000},
  mentai:{3:10600,4:12500,6:19300,8:25100},
  original:{3:7900,4:9800,6:14400,8:18200},
  mediumfrozen:{5:7500,10:15000,20:30000,25:37500,50:75000,100:150000,200:300000,300:450000,500:750000,1000:1500000},
  mediummentai:{5:10900,10:21400,12:25760,20:42200,25:53700},
  mediumoriginal:{5:9700,10:19000,20:37200,25:45700}
};
const modalPerPcs = { jumbo:1800, medium:1500 };

// ===== State =====
let rekapData = [];
let stok = { jumbo:0, medium:0 };
let currentPage = 1;
const rowsPerPage = 15;
let searchQuery = "";
let pengeluaranData = [];   // ✅ tambahkan ini

// ===== VARIAN KHUSUS BERDASARKAN PEMBELI & PAKET =====
const varianPembeli = {
  enduser: {
    jumbofrozen: { eceran: [4,6,8,10], pack: [50,100,200,300,500,1000] },
    mediumfrozen: { eceran: [5,10,20,25], pack: [50,100,200,300,500,1000] },
  },
  reseller: {
    jumbofrozen: { eceran: [4,6,8,10], pack: [50,100,200,300,500,1000] },
    mediumfrozen: { eceran: [5,10,20,25], pack: [50,100,200,300,500,1000] },
  }
};

// jika pembeli atau paket berubah
function onJenisPembeliChange() {
  document.getElementById("jenisProduk").value = "__placeholder";
  document.getElementById("varian").innerHTML = "";
}

function onJenisPaketChange() {
  populateVarian(document.getElementById("jenisProduk").value);
}

// ===== Varian & Input =====
function populateVarian(jenis) {
  const sel = document.getElementById("varian");
  sel.innerHTML = "";

  if (!jenis || jenis === '__placeholder') return;

  const pembeli = document.getElementById("jenisPembeli").value;
  const paket = document.getElementById("jenisPaket").value;

  let keys = [];

  // 🔸 Khusus produk frozen → ikuti jenis pembeli & paket
  if ((jenis === "jumbofrozen" || jenis === "mediumfrozen") &&
      pembeli && paket && pembeli !== '__placeholder' && paket !== '__placeholder') {
    keys = varianPembeli[pembeli]?.[jenis]?.[paket] || [];
  } 
  // 🔸 Produk lain (mentai/original) → tampil semua varian
  else {
    keys = Object.keys(hargaBox[jenis]);
  }

  keys.forEach(k => {
    const opt = document.createElement("option");
    opt.value = k;
    opt.textContent = `${k} pcs - ${formatRp(hargaBox[jenis][k])}`;
    sel.appendChild(opt);
  });

  if (keys.length > 0) sel.value = keys[0];
}

function onJenisChange(){ populateVarian(document.getElementById("jenisProduk").value); hitungDariBox(); }
function onVarianChange(){ hitungDariBox(); }
function hitungDariBox(){
  const v=parseInt(document.getElementById("varian").value)||3;
  const b=parseInt(document.getElementById("jumlahBox").value)||0;
  document.getElementById("jumlahPcs").value=b*isiBox[v];
}
function hitungDariPcs(){
  const v=parseInt(document.getElementById("varian").value)||3;
  const pcs=parseInt(document.getElementById("jumlahPcs").value)||0;
  document.getElementById("jumlahBox").value=Math.floor(pcs/isiBox[v]);
}

// ===== LocalStorage =====
function saveToLocalStorage() {
  localStorage.setItem("rekapData", JSON.stringify(rekapData));
  localStorage.setItem("stok", JSON.stringify(stok));
  localStorage.setItem("pengeluaranData", JSON.stringify(pengeluaranData)); // ✅ simpan pengeluaran juga
}

function loadFromLocalStorage() {
  try {
    const rekap = localStorage.getItem("rekapData");
    const stokData = localStorage.getItem("stok");
    const pengeluaran = localStorage.getItem("pengeluaranData");

    if (rekap) rekapData = JSON.parse(rekap);
    if (stokData) stok = JSON.parse(stokData);
    if (pengeluaran) pengeluaranData = JSON.parse(pengeluaran);

    if (!Array.isArray(rekapData)) rekapData = [];
    if (!Array.isArray(pengeluaranData)) pengeluaranData = [];
    if (typeof stok.jumbo!=="number") stok.jumbo = 0;
    if (typeof stok.medium!=="number") stok.medium = 0;
  } catch (e) {
    console.error("Gagal load data lokal:", e);
    rekapData = [];
    pengeluaranData = [];
    stok = { jumbo:0, medium:0 };
  }
}

function resetLocalStorage() {
  if (confirm("Apakah Anda yakin ingin menghapus seluruh Local Storage? Semua data akan hilang.")) {
    localStorage.clear();
    alert("Local Storage berhasil dihapus. Halaman akan dimuat ulang.");
    location.reload();
  }
}

function hapusPengeluaran(btn) {
  btn.closest("tr").remove();
  hitungProfitBersih();
}

// ===== Transaksi =====
function simpanData() {
  // 🔹 ambil jenis pembeli & jenis paket
  const pembeli = document.getElementById("jenisPembeli").value;
  const paket = document.getElementById("jenisPaket").value;
  if (!pembeli || pembeli === "__placeholder") { 
    alert("Silahkan pilih jenis pembeli!"); 
    return; 
  }
  if (!paket || paket === "__placeholder") { 
    alert("Silahkan pilih jenis paket!"); 
    return; 
  }

  // 🔹 ambil jenis produk
  const jenis = document.getElementById("jenisProduk").value;
  if (!jenis || jenis === "__placeholder") { 
    alert("Silahkan pilih produk!"); 
    return; 
  }

  // hanya wajib pilih pembeli & paket untuk produk frozen
  if (jenis === "jumbofrozen" || jenis === "mediumfrozen") {
    const pembeli = document.getElementById("jenisPembeli").value;
    const paket = document.getElementById("jenisPaket").value;
    if (!pembeli || pembeli === "__placeholder") { 
      alert("Silahkan pilih jenis pembeli!"); 
      return; 
    }
    if (!paket || paket === "__placeholder") { 
      alert("Silahkan pilih jenis paket!"); 
      return; 
    }
  }

  const varian = parseInt(document.getElementById("varian").value) || 0;
  const jumlahBox = parseInt(document.getElementById("jumlahBox").value) || 0;
  if (jumlahBox <= 0) { 
    alert("Jumlah box tidak boleh nol atau kosong."); 
    return; 
  }

  const perBox = isiBox[varian] || 0;
  const jumlahPcs = jumlahBox * perBox;
  const jenisStok = (jenis.includes("medium")) ? "medium" : "jumbo";

  if (stok[jenisStok] <= 0) { 
    alert("Stok " + jenisStok + " habis! Tambah stok dulu."); 
    return; 
  }
  if (stok[jenisStok] < jumlahPcs) { 
    alert("Stok " + jenisStok + " tidak cukup! Sisa: " + stok[jenisStok] + " pcs"); 
    return; 
  }

  stok[jenisStok] -= jumlahPcs;

  const hargaPerBox = hargaBox[jenis][varian];
  const hppPerBox   = hppBox[jenis][varian];
  const omzet   = jumlahBox * hargaPerBox;
  const hppTot  = jumlahBox * hppPerBox;
  const profit  = omzet - hppTot;
  const marginStr = hppTot > 0 ? ((profit / hppTot) * 100).toFixed(1) + "%" : "0%";

  // 🔹 simpan semua ke dalam rekap
  const hasil = {
    id: generateId(),
    tanggal: new Date().toLocaleString("id-ID", { 
      year: "numeric", month: "2-digit", day: "2-digit", 
      hour: "2-digit", minute: "2-digit", second: "2-digit" 
    }),
    jenisPembeli: pembeli,
    jenisPaket: paket,
    jenis, jenisStok,
    varianLabel: varian + " pcs",
    isiPerBox: isiBox[varian],
    jumlahBox, jumlahPcs,
    sisaStok: stok[jenisStok],
    hargaPerBox,
    totalOmzet: omzet,
    totalHPP: hppTot,
    profit,
    marginStr
  };

  rekapData.push(hasil);
  saveToLocalStorage();

  // 🔹 reset input form
  document.getElementById("jumlahBox").value = 0;
  document.getElementById("jumlahPcs").value = 0;
  document.getElementById("jenisProduk").value = "__placeholder";
  document.getElementById("varian").innerHTML = "";
  document.getElementById("jenisPaket").value = "__placeholder";
  document.getElementById("jenisPembeli").value = "__placeholder";

  updateRekapTable();
  updateSummary();
}

function tambahStok(){
  const tambahan = parseInt(document.getElementById("stokMasuk").value)||0;
  const jenisStok = document.getElementById("stokJenis").value;
  if(tambahan<=0 || !jenisStok || jenisStok==="__placeholder"){
    alert("Masukkan stok & pilih jenis stok!");
    return;
  }
  stok[jenisStok] += tambahan;
  const modal = tambahan * modalPerPcs[jenisStok];

	const hasil = {
	id: generateId(),
	tanggal: new Date().toLocaleString("id-ID", { 
    year: "numeric", 
    month: "2-digit", 
    day: "2-digit", 
    hour: "2-digit", 
    minute: "2-digit", 
    second: "2-digit" 
	}),
    jenis: "Tambah Stok",
    jenisStok,
    varianLabel:"-",
    isiPerBox:"-",
    jumlahBox:"-",
    jumlahPcs: tambahan,
    sisaStok: stok[jenisStok],
    hargaPerBox: 0,
    totalOmzet: 0,
    totalHPP: modal,
    profit: 0,
    marginStr:"-"
  };
  rekapData.push(hasil);
  saveToLocalStorage();

  document.getElementById("stokMasuk").value=0;
  document.getElementById("stokJenis").value="__placeholder";

  updateRekapTable();
}

function hapusRekap(){
  if(confirm("Yakin hapus semua data?")){
    rekapData = [];
    stok = { jumbo:0, medium:0 };
    localStorage.removeItem("rekapData");
    localStorage.removeItem("stok");
    updateRekapTable();
  }
}

// Hapus 1 baris by ID + kembalikan stok secara benar
function hapusBaris(id) {
  const idx = rekapData.findIndex(r => r.id === id);
  if (idx === -1) return;
  if (!confirm("Hapus data ini?")) return;

  const row = rekapData[idx];
  if (row.jenis !== "Tambah Stok") {
    // menghapus transaksi penjualan -> kembalikan stok
    if (row.jenisStok && typeof row.jumlahPcs === "number") {
      stok[row.jenisStok] = (stok[row.jenisStok]||0) + row.jumlahPcs;
    }
  } else {
    // menghapus penambahan stok -> tarik kembali
    if (row.jenisStok && typeof row.jumlahPcs === "number") {
      stok[row.jenisStok] = Math.max(0, (stok[row.jenisStok]||0) - row.jumlahPcs);
    }
  }

  rekapData.splice(idx,1);
  saveToLocalStorage();
  updateRekapTable();
}

// ===== Pencarian =====
document.getElementById("searchInput").addEventListener("input", function(){
  searchQuery = this.value.toLowerCase();
  currentPage = 1;
  updateRekapTable();
});

// ===== Pagination UI (prev / label / next) =====
function renderPagination(totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const div = document.getElementById("pagination");
  div.innerHTML = "";

  if (totalPages <= 1) return;

  const wrap = document.createElement("div");
  wrap.style.display = "inline-flex";
  wrap.style.alignItems = "center";
  wrap.style.gap = "6px";

  const prev = document.createElement("button");
  prev.textContent = "⬅️";
  prev.disabled = currentPage === 1;
  prev.onclick = () => { if (currentPage>1){ currentPage--; updateRekapTable(); } };
  wrap.appendChild(prev);

  const label = document.createElement("span");
  label.textContent = `${currentPage} / ${totalPages}`;
  wrap.appendChild(label);

  const next = document.createElement("button");
  next.textContent = "➡️";
  next.disabled = currentPage === totalPages;
  next.onclick = () => { if (currentPage<totalPages){ currentPage++; updateRekapTable(); } };
  wrap.appendChild(next);

  div.appendChild(wrap);
}

// ===== Hitung ringkasan keuangan (dari penjualan saja) =====
function hitungProfitBersih() {
  const penjualan = rekapData.filter(r => r.jenis !== "Tambah Stok");
  const totalOmzet = penjualan.reduce((a,r)=>a+(r.totalOmzet||0),0);
  const totalHPP   = penjualan.reduce((a,r)=>a+(r.totalHPP||0),0);
  const profitKotor= totalOmzet - totalHPP;

  // total pengeluaran
  const rows = document.querySelectorAll("#pengeluaranBody tr");
  let totalPengeluaran = 0;
  rows.forEach(r=>{
    const val = parseInt(r.querySelector("td:nth-child(2) input").value)||0;
    totalPengeluaran += val;
  });

  const profitBersih = profitKotor - totalPengeluaran;

  document.getElementById("totalPengeluaran").textContent = formatRp(totalPengeluaran);
  document.getElementById("profitBersih").textContent     = formatRp(profitBersih);

  document.getElementById("ringkasanOmzet").textContent        = formatRp(totalOmzet);
  document.getElementById("ringkasanHPP").textContent          = formatRp(totalHPP);
  document.getElementById("ringkasanProfitKotor").textContent  = formatRp(profitKotor);
  document.getElementById("ringkasanBiaya").textContent        = formatRp(totalPengeluaran);
  document.getElementById("ringkasanProfitBersih").textContent = formatRp(profitBersih);
}

function updateRekapTable() {
  const tbody = document.querySelector("#rekapTable tbody");
  tbody.innerHTML = "";

  // Filter by search
  const hasilFilter = rekapData.filter(row =>
    Object.values(row).some(val => String(val).toLowerCase().includes(searchQuery))
  );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(hasilFilter.length / rowsPerPage));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * rowsPerPage;
  const end   = start + rowsPerPage;
  const pageData = hasilFilter.slice(start, end);

  // Render baris tabel
  pageData.forEach((row, index) => {
    const tr = document.createElement("tr");
tr.innerHTML = `
  <td>${start + index + 1}</td>
  <td>${row.tanggal}</td>
  <td>${row.jenisPembeli || '-'}</td>
  <td>${row.jenisPaket || '-'}</td>
  <td>${row.jenis}</td>
  <td>${row.jenisStok}</td>
  <td>${row.varianLabel || '-'}</td>
  <td>${row.jumlahBox || '-'}</td>
  <td>${row.jumlahPcs || '-'}</td>
  <td>${row.sisaStok}</td>
  <td>${row.hargaPerBox ? formatRp(row.hargaPerBox) : '-'}</td>
  <td>${row.totalOmzet ? formatRp(row.totalOmzet) : '-'}</td>
  <td>${row.totalHPP ? formatRp(row.totalHPP) : '-'}</td>
  <td>${row.profit ? formatRp(row.profit) : '-'}</td>
  <td>${row.marginStr || '-'}</td>
  <td class="aksi-cell">
    <div class="action-buttons">
      <button title="Edit" onclick="editRow('${row.id}')">✏️</button>
      <button title="Hapus" onclick="hapusBaris('${row.id}')">🗑️</button>
    </div>
  </td>
`;
    tbody.appendChild(tr);
  });

  // === Hitung total per halaman ===
  const pageOmzet  = pageData.reduce((a,r)=> r.jenis==="Tambah Stok" ? a : a+(r.totalOmzet||0),0);
  const pageHPP    = pageData.reduce((a,r)=> r.jenis==="Tambah Stok" ? a : a+(r.totalHPP||0),0);
  const pageProfit = pageData.reduce((a,r)=> r.jenis==="Tambah Stok" ? a : a+(r.profit||0),0);
  const pageMargin = pageHPP>0 ? ((pageProfit/pageHPP)*100).toFixed(1)+"%" : "0%";

  document.getElementById("pageOmzet").textContent  = formatRp(pageOmzet);
  document.getElementById("pageHPP").textContent    = formatRp(pageHPP);
  document.getElementById("pageProfit").textContent = formatRp(pageProfit);
  document.getElementById("pageMargin").textContent = pageMargin;

  // === Hitung total FILTERED (search) ===
  const filterOmzet  = hasilFilter.reduce((a,r)=> r.jenis==="Tambah Stok" ? a : a+(r.totalOmzet||0),0);
  const filterHPP    = hasilFilter.reduce((a,r)=> r.jenis==="Tambah Stok" ? a : a+(r.totalHPP||0),0);
  const filterProfit = hasilFilter.reduce((a,r)=> r.jenis==="Tambah Stok" ? a : a+(r.profit||0),0);
  const filterMargin = filterHPP>0 ? ((filterProfit/filterHPP)*100).toFixed(1)+"%" : "0%";

  document.getElementById("filterOmzet").textContent  = formatRp(filterOmzet);
  document.getElementById("filterHPP").textContent    = formatRp(filterHPP);
  document.getElementById("filterProfit").textContent = formatRp(filterProfit);
  document.getElementById("filterMargin").textContent = filterMargin;

  // === Hitung total keseluruhan (semua penjualan) ===
  const totalOmzet  = rekapData.reduce((a,r)=> r.jenis==="Tambah Stok" ? a : a+(r.totalOmzet||0),0);
  const totalHPP    = rekapData.reduce((a,r)=> r.jenis==="Tambah Stok" ? a : a+(r.totalHPP||0),0);
  const totalProfit = rekapData.reduce((a,r)=> r.jenis==="Tambah Stok" ? a : a+(r.profit||0),0);
  const totalMargin = totalHPP>0 ? ((totalProfit/totalHPP)*100).toFixed(1)+"%" : "0%";

  document.getElementById("totalJual").textContent   = formatRp(totalOmzet);
  document.getElementById("totalModal").textContent  = formatRp(totalHPP);
  document.getElementById("totalProfit").textContent = formatRp(totalProfit);
  document.getElementById("totalMargin").textContent = totalMargin;

  // === Tampilkan / sembunyikan baris sesuai kondisi pencarian ===
  document.querySelector("#rekapTable tfoot tr:nth-child(1)").style.display = searchQuery ? "none" : "";
  document.querySelector("#rekapTable tfoot tr:nth-child(2)").style.display = searchQuery ? "" : "none";
  document.querySelector("#rekapTable tfoot tr:nth-child(3)").style.display = searchQuery ? "none" : "";

  // === Update stok akhir & modal tertanam ===
  document.getElementById("stokJumbo").textContent  = stok.jumbo;
  document.getElementById("stokMedium").textContent = stok.medium;

  const modalJumbo  = stok.jumbo  * modalPerPcs.jumbo;
  const modalMedium = stok.medium * modalPerPcs.medium;

  const jumboEl = document.getElementById("modalJumbo");
  const mediumEl = document.getElementById("modalMedium");

  jumboEl.textContent  = formatRp(modalJumbo);
  mediumEl.textContent = formatRp(modalMedium);

  jumboEl.className  = "modal-stok " + (modalJumbo>0 ? "hijau" : "abu");
  mediumEl.className = "modal-stok " + (modalMedium>0 ? "hijau" : "abu");

  // === Update ringkasan keuangan ===
  hitungProfitBersih();

  // Pagination UI
  renderPagination(hasilFilter.length);
}


// ===== Edit Baris (Inline di Tabel) =====
function editBaris(id) {
  const idx = rekapData.findIndex(r => r.id === id);
  if (idx === -1) return;

  const row = rekapData[idx];
  const tr = [...document.querySelectorAll("#rekapTable tbody tr")].find(r => 
    r.querySelector("td:last-child button")?.getAttribute("onclick")?.includes(id)
  );
  if (!tr) return;

  // Ganti kolom jumlahBox & jumlahPcs jadi input
  tr.cells[6].innerHTML = `<input type="number" value="${row.jumlahBox}" style="width:70px">`;
  tr.cells[7].innerHTML = `<input type="number" value="${row.jumlahPcs}" style="width:70px">`;

  tr.cells[14].innerHTML = `
    <button type="button" class="btn-aksi simpan" onclick="simpanEditInline('${id}', this)" title="Simpan">💾</button>
    <button type="button" class="btn-aksi batal" onclick="updateRekapTable()" title="Batal">❌</button>
  `;
}

function simpanEditInline(id, btn) {
  const idx = rekapData.findIndex(r => r.id === id);
  if (idx === -1) return;

  const tr = btn.closest("tr");
  const newBox = parseInt(tr.cells[6].querySelector("input").value) || 0;
  const newPcs = parseInt(tr.cells[7].querySelector("input").value) || 0;

  const row = rekapData[idx];

  // hitung selisih stok
  const selisih = newPcs - (row.jumlahPcs || 0);
  if (row.jenis !== "Tambah Stok") {
    stok[row.jenisStok] -= selisih;
    if (stok[row.jenisStok] < 0) {
      alert("Stok tidak cukup untuk perubahan ini!");
      stok[row.jenisStok] += selisih; // rollback
      return;
    }
  } else {
    stok[row.jenisStok] += selisih;
  }

  // hitung ulang omzet, hpp, profit, margin
  const hargaPerBox = hargaBox[row.jenis]?.[parseInt(row.varianLabel)] || row.hargaPerBox || 0;
  const hppPerBox   = hppBox[row.jenis]?.[parseInt(row.varianLabel)] || row.totalHPP/newBox || 0;

  row.jumlahBox   = newBox;
  row.jumlahPcs   = newPcs;
  row.sisaStok    = stok[row.jenisStok];
  row.hargaPerBox = hargaPerBox;
  row.totalOmzet  = newBox * hargaPerBox;
  row.totalHPP    = newBox * hppPerBox;
  row.profit      = row.totalOmzet - row.totalHPP;
  row.marginStr   = row.totalHPP > 0 ? ((row.profit/row.totalHPP)*100).toFixed(1)+"%" : "0%";

  saveToLocalStorage();
  updateRekapTable();
}

// ===== Edit via Modal =====
function editRow(id){
  const row = rekapData.find(r => r.id === id);
  if (!row) return;
  document.getElementById("editId").value = row.id;
  document.getElementById("editJenis").value = row.jenis;
  document.getElementById("editVarian").value = row.varianLabel;
  document.getElementById("editBox").value = row.jumlahBox;
  document.getElementById("editPcs").value = row.jumlahPcs;
  document.getElementById("editHargaBox").value = row.hargaPerBox;
  document.getElementById("editModal").style.display = "block";
}

function closeEditModal(){
  document.getElementById("editModal").style.display = "none";
}

function simpanEditModal(){
  const id = document.getElementById("editId").value;
  const row = rekapData.find(r => r.id === id);
  if (!row) return;
  row.varianLabel = document.getElementById("editVarian").value;
  row.jumlahBox = parseInt(document.getElementById("editBox").value)||0;
  row.jumlahPcs = parseInt(document.getElementById("editPcs").value)||0;
  row.hargaPerBox = parseInt(document.getElementById("editHargaBox").value)||0;
  row.totalOmzet = row.jumlahBox * row.hargaPerBox;
  row.totalHPP   = row.jumlahBox * (hppBox[row.jenis]?.[parseInt(row.varianLabel)]||0);
  row.profit     = row.totalOmzet - row.totalHPP;
  row.marginStr  = row.totalHPP>0 ? ((row.profit/row.totalHPP)*100).toFixed(1)+"%" : "0%";
  saveToLocalStorage();
  updateRekapTable();
  closeEditModal();
}

// ===== Init =====
loadFromLocalStorage();
updateRekapTable();

// ===== Pengeluaran (LocalStorage & UI) =====
function togglePengeluaran(){
  const wrap = document.getElementById("pengeluaranWrapper");
  wrap.style.display = (wrap.style.display === "none" || wrap.style.display === "") ? "block" : "none";
}

// ===== Pengeluaran LocalStorage =====
function savePengeluaranToLocalStorage() {
  const rows = document.querySelectorAll("#pengeluaranBody tr");
  const data = [];
  rows.forEach(r => {
    const item = r.querySelector("td:nth-child(1) input").value;
    const biaya = parseInt(r.querySelector("td:nth-child(2) input").value)||0;
    const tanggal = r.dataset.tanggal || new Date().toLocaleDateString("id-ID");
    data.push({ id: generateId(), item, biaya, tanggal });
  });
  localStorage.setItem("pengeluaranData", JSON.stringify(data));
}

function loadPengeluaranFromLocalStorage() {
  const data = localStorage.getItem("pengeluaranData");
  if (!data) return;
  try {
    const arr = JSON.parse(data);
    const tbody = document.getElementById("pengeluaranBody");
    tbody.innerHTML = "";
    arr.forEach(row => {
      const tr = document.createElement("tr");
      tr.dataset.tanggal = row.tanggal;
      tr.innerHTML = `
        <td><input type="text" value="${row.item}" oninput="savePengeluaranToLocalStorage();hitungProfitBersih()" /></td>
        <td><input type="number" value="${row.biaya}" oninput="savePengeluaranToLocalStorage();hitungProfitBersih()" /></td>
        <td>${row.tanggal}<br><button onclick="hapusPengeluaran(this)">🗑️</button></td>
      `;
      tbody.appendChild(tr);
    });
    hitungProfitBersih();
  } catch(e) { console.error("Gagal load pengeluaran:", e); }
}

// ====== Pengeluaran ======
function tambahPengeluaran() {   // ✅ versi baru dipakai
  const desc = document.getElementById("descInput").value.trim();
  const amount = parseInt(document.getElementById("amountInput").value);
  if (!desc || isNaN(amount) || amount<=0){alert("Isi pengeluaran dengan benar!");return;}
  pengeluaranData.push({id:generateId(), item:desc, biaya:amount, tanggal:new Date().toLocaleDateString("id-ID")});
  saveToLocalStorage();
  renderPengeluaran();
  updateSummary();
  document.getElementById("descInput").value="";
  document.getElementById("amountInput").value="";
}

function renderPengeluaran(){
  const tbody=document.getElementById("pengeluaranBody");
  tbody.innerHTML="";
  let totalPengeluaran = 0;

  pengeluaranData.forEach(p=>{
    totalPengeluaran += p.biaya;
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${p.item}</td>
                  <td>${formatRp(p.biaya)}</td>
                  <td>${p.tanggal}</td>
                  <td><button onclick="hapusPengeluaran('${p.id}')">❌</button></td>`;
    tbody.appendChild(tr);
  });

  // Update total di tabel pengeluaran
  document.getElementById("totalPengeluaran").textContent = formatRp(totalPengeluaran);

  // Update profit bersih di tabel pengeluaran (profit kotor - pengeluaran)
  let totalProfitKotor = rekapData.reduce((sum, r) => sum + r.profit, 0);
  let profitBersih = totalProfitKotor - totalPengeluaran;
  document.getElementById("profitBersih").textContent = formatRp(profitBersih);
}

function hapusPengeluaran(id){
  pengeluaranData= pengeluaranData.filter(p=>p.id!==id);
  saveToLocalStorage();
  renderPengeluaran();
  updateSummary();
}

function updateSummary() {
  let totalOmzet=0, totalHPP=0, totalProfit=0;

  rekapData.forEach(r=>{
    totalOmzet+=r.totalOmzet;
    totalHPP+=r.totalHPP;
    totalProfit+=r.profit;
  });

  // Hitung total pengeluaran
  let totalPengeluaran = pengeluaranData.reduce((sum,p)=> sum+p.biaya, 0);

  // Profit bersih = profit kotor - total pengeluaran
  let profitBersih = totalProfit - totalPengeluaran;

  // Update ringkasan keuangan
  document.getElementById("ringkasanOmzet").textContent = formatRp(totalOmzet);
  document.getElementById("ringkasanHPP").textContent = formatRp(totalHPP);
  document.getElementById("ringkasanProfitKotor").textContent = formatRp(totalProfit);
  document.getElementById("ringkasanBiaya").textContent = formatRp(totalPengeluaran);   // ✅ sekarang muncul
  document.getElementById("ringkasanProfitBersih").textContent = formatRp(profitBersih); // ✅ sekarang otomatis
}

// ====== Export Excel ======
function downloadExcel() {
  // ===== Sheet 1: Rekap Penjualan =====
const dataRekap = [
  ["No","Tanggal","Jenis Pembeli","Jenis Paket","Jenis","Varian","Box","Pcs","Harga/Box","Omzet","HPP","Profit","Margin"]
];
  let totalOmzet=0, totalHPP=0, totalProfit=0;
  rekapData.forEach((r,i)=>{
dataRekap.push([
  i+1,
  r.tanggal,
  r.jenisPembeli || "-",
  r.jenisPaket || "-",
  r.jenis,
  r.varianLabel,
  r.jumlahBox,
  r.jumlahPcs,
  r.hargaPerBox,
  r.totalOmzet,
  r.totalHPP,
  r.profit,
  r.marginStr
]);
    totalOmzet += r.totalOmzet;
    totalHPP   += r.totalHPP;
    totalProfit+= r.profit;
  });
  // ✅ Tambahkan baris total
  dataRekap.push(["","","","","","","TOTAL", totalOmzet, totalHPP, totalProfit,""]);
  const ws1 = XLSX.utils.aoa_to_sheet(dataRekap);

  // ===== Sheet 2: Catatan Pengeluaran =====
  const dataPengeluaran = [["No","Deskripsi","Nominal","Tanggal"]];
  let totalPengeluaran=0;
  pengeluaranData.forEach((p,i)=>{
    dataPengeluaran.push([i+1, p.item, p.biaya, p.tanggal]);
    totalPengeluaran += p.biaya;
  });
  // ✅ Tambahkan total pengeluaran
  dataPengeluaran.push(["","","TOTAL", totalPengeluaran]);
  const ws2 = XLSX.utils.aoa_to_sheet(dataPengeluaran);

  // ===== Sheet 3: Ringkasan Keuangan =====
  let profitBersih = totalProfit - totalPengeluaran;
  let marginRata = totalHPP > 0 ? ((totalProfit / totalHPP) * 100).toFixed(1) + "%" : "0%";

  const dataSummary = [
    ["Ringkasan Keuangan"],
    ["Omzet Kotor", totalOmzet],
    ["Total HPP / Modal", totalHPP],
    ["Profit Kotor", totalProfit],
    ["Total Biaya Operasional", totalPengeluaran],
    ["Profit Bersih Penjual", profitBersih],
    ["Margin Rata-rata", marginRata],
    [],
    // ✅ Ringkasan akhir
    ["TOTAL OMZET", totalOmzet],
    ["TOTAL PENGELUARAN", totalPengeluaran],
    ["TOTAL PROFIT BERSIH", profitBersih],
    ["MARGIN RATA-RATA", marginRata]
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(dataSummary);

  // ===== Buat workbook & simpan =====
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, "Rekap Penjualan");
  XLSX.utils.book_append_sheet(wb, ws2, "Pengeluaran");
  XLSX.utils.book_append_sheet(wb, ws3, "Ringkasan");

  // Tambahkan tanggal ke nama file (DD-MM-YYYY)
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const dateStr = `${dd}-${mm}-${yyyy}`;

  XLSX.writeFile(wb, `Laporan_Dimsum_${dateStr}.xlsx`);
}

// ===== Init =====
renderPengeluaran();
updateSummary();
updateRekapTable();

// ===== Inisialisasi =====
window.onload = function() {
  loadFromLocalStorage();
  loadPengeluaranFromLocalStorage();
  updateRekapTable();
  hitungProfitBersih();
};