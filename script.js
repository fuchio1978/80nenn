// 十干・十二支
const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

// DOM
const form = document.getElementById("birthYearForm");
const input = document.getElementById("birthYear");
const grid = document.getElementById("yearGrid");
const downloadBtn = document.getElementById("downloadBtn");

// 干支を求める（1984年=甲子 を基準）
function etoOf(year) {
  const base = 1984; // 甲子
  const idx60 = ((year - base) % 60 + 60) % 60;
  const stem = STEMS[idx60 % 10];
  const branch = BRANCHES[idx60 % 12];
  return stem + branch;
}

// 80セルを描画
function buildGrid(startYear) {
  grid.innerHTML = ""; // リセット
  const y0 = Number(startYear);

  for (let i = 0; i < 80; i++) {
    const y = y0 + i;

    const cell = document.createElement("div");
    cell.className = "cell";

    const ageEl = document.createElement("div");
    ageEl.className = "cell__age";
    ageEl.textContent = `${i}歳`;

    const yearEl = document.createElement("div");
    yearEl.className = "cell__year";
    yearEl.textContent = `${y}年`;

    const zodiacEl = document.createElement("div");
    zodiacEl.className = "cell__zodiac";
    zodiacEl.textContent = etoOf(y);

    cell.appendChild(ageEl);
    cell.appendChild(yearEl);
    cell.appendChild(zodiacEl);
    grid.appendChild(cell);
  }

  // 80個できていればダウンロード許可
  downloadBtn.disabled = grid.children.length !== 80;
}

// フォーム送信 → 表生成
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const v = input.value.trim();
  if (!/^\d{3,4}$/.test(v)) {
    alert("0歳となる西暦（例：1978）を入力してください");
    return;
  }
  buildGrid(v);
  // フォーカスを外してモバイルのキーボードを下げる
  input.blur();
});

// PNG保存（html2canvas）
downloadBtn.addEventListener("click", async () => {
  if (downloadBtn.disabled) return;
  // 表だけをキャプチャ
  const canvas = await html2canvas(grid, {
    backgroundColor: "#ffffff",
    scale: 2,          // 解像度アップ
    useCORS: true
  });
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "80year-table.png";
  a.click();
});

// お好みで：初期描画（今年を0歳とする）
(function init() {
  const thisYear = new Date().getFullYear();
  input.placeholder = `例: ${thisYear}`;
})();

