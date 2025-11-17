// 十干・十二支
const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

// 60干支テーブル（大運計算用）
const SIXTY_ETOS = [];
const ETO_INDEX_MAP = new Map();
for (let i = 0; i < 60; i++) {
  const eto = STEMS[i % 10] + BRANCHES[i % 12];
  SIXTY_ETOS.push(eto);
  if (!ETO_INDEX_MAP.has(eto)) {
    ETO_INDEX_MAP.set(eto, i);
  }
}

// DOM
const form = document.getElementById("birthYearForm");
const input = document.getElementById("birthYear");
const grid = document.getElementById("yearGrid");
const downloadBtn = document.getElementById("downloadBtn");
const daiunStartAgeInput = document.getElementById("daiunStartAge");
const daiunStartEtoSelect = document.getElementById("daiunStartEto");
const daiunDirectionRadios = document.querySelectorAll("input[name='daiunDirection']");

// 干支を求める（1984年=甲子 を基準）
function etoOf(year) {
  const base = 1984; // 甲子
  const idx60 = ((year - base) % 60 + 60) % 60;
  const stem = STEMS[idx60 % 10];
  const branch = BRANCHES[idx60 % 12];
  return stem + branch;
}

// 大運の装飾をリセット
function clearDaiun() {
  const cells = Array.from(grid.children);
  cells.forEach((cell) => {
    cell.classList.remove("cell--daiun");
    for (let i = 0; i < 8; i++) {
      cell.classList.remove(`cell--daiun-${i}`);
    }
    const label = cell.querySelector(".cell__daiun-label");
    if (label) label.remove();
  });
}

// 大運を計算してグリッドに反映
function applyDaiunFromInputs() {
  if (grid.children.length !== 80) return;

  clearDaiun();

  const startAgeStr = daiunStartAgeInput?.value.trim();
  const startEto = daiunStartEtoSelect?.value || "";
  const directionRadio = Array.from(daiunDirectionRadios).find((r) => r.checked);
  const direction = directionRadio ? directionRadio.value : "forward";

  if (!startAgeStr || !startEto) return;

  const startAge = Number(startAgeStr);
  if (!Number.isFinite(startAge) || startAge < 0 || startAge > 79) return;

  const startIndex = ETO_INDEX_MAP.get(startEto);
  if (startIndex == null) return;

  const cells = Array.from(grid.children);
  const step = direction === "backward" ? -1 : 1;

  let block = 0;
  for (let age = startAge; age < 80; age += 10) {
    const daiunIndex = (startIndex + step * block + 60 * 10) % 60;
    const daiunName = SIXTY_ETOS[daiunIndex];

    // 該当10年分にクラス付与
    const endAge = Math.min(age + 10, 80);
    for (let a = age; a < endAge; a++) {
      const cell = cells[a];
      if (!cell) continue;
      cell.classList.add("cell--daiun", `cell--daiun-${block}`);
    }

    // ブロック先頭のマスにラベル表示
    const labelCell = cells[age];
    if (labelCell) {
      const label = document.createElement("div");
      label.className = "cell__daiun-label";
      label.textContent = daiunName;
      labelCell.appendChild(label);
    }

    block++;
    if (block >= 8) break; // 0〜79歳まで最大8ブロック
  }
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

  // 入力されていれば大運を適用
  applyDaiunFromInputs();
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

// 大運入力の変更で即反映
if (daiunStartAgeInput) {
  daiunStartAgeInput.addEventListener("change", applyDaiunFromInputs);
}
if (daiunStartEtoSelect) {
  daiunStartEtoSelect.addEventListener("change", applyDaiunFromInputs);
}
if (daiunDirectionRadios.length) {
  daiunDirectionRadios.forEach((radio) => {
    radio.addEventListener("change", applyDaiunFromInputs);
  });
}

// PNG保存（html2canvas）
downloadBtn.addEventListener("click", async () => {
  if (downloadBtn.disabled) return;

  // --- 干支をキャプチャ用レイアウトに一時変換 ---
  const zodiacNodes = Array.from(grid.getElementsByClassName("cell__zodiac"));
  const originalStates = zodiacNodes.map((node) => ({
    text: node.textContent,
    html: node.innerHTML,
    className: node.className,
  }));

  zodiacNodes.forEach((node) => {
    const text = node.textContent || "";
    node.innerHTML = "";
    node.className = originalStates[0].className + " zodiac-capture";
    for (const ch of text) {
      const span = document.createElement("span");
      span.textContent = ch;
      node.appendChild(span);
    }
  });

  try {
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
  } finally {
    // --- 干支レイアウトを元に戻す ---
    zodiacNodes.forEach((node, i) => {
      node.innerHTML = originalStates[i].html;
      node.className = originalStates[i].className;
    });
  }
});

// お好みで：初期描画（今年を0歳とする）
(function init() {
  const thisYear = new Date().getFullYear();
  input.placeholder = `例: ${thisYear}`;
})();

