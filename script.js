const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const form = document.getElementById("birthYearForm");
const birthYearInput = document.getElementById("birthYear");
const yearGrid = document.getElementById("yearGrid");
const downloadBtn = document.getElementById("downloadBtn");

const BASE_YEAR = 1984; // 甲子

function updateGridMetrics() {
  if (yearGrid.children.length === 0) {
    yearGrid.removeAttribute("aria-colcount");
    yearGrid.removeAttribute("aria-rowcount");
    return;
  }

  const columnCount = window
    .getComputedStyle(yearGrid)
    .gridTemplateColumns.split(" ")
    .filter(Boolean).length;
  const safeColumnCount = columnCount > 0 ? columnCount : 1;
  const rowCount = Math.ceil(yearGrid.children.length / safeColumnCount);
  yearGrid.setAttribute("aria-colcount", String(safeColumnCount));
  yearGrid.setAttribute("aria-rowcount", String(rowCount));
}

function getGanzhi(year) {
  const diff = year - BASE_YEAR;
  const index = ((diff % 60) + 60) % 60;
  const stem = stems[index % stems.length];
  const branch = branches[index % branches.length];
  return `${stem}${branch}`;
}

function createCell(age, year, zodiac) {
  const cell = document.createElement("div");
  cell.className = "year-grid__cell";
  cell.setAttribute("role", "gridcell");

  const ageEl = document.createElement("div");
  ageEl.className = "year-grid__age";
  ageEl.textContent = `${age}歳`;

  const yearEl = document.createElement("div");
  yearEl.className = "year-grid__year";
  yearEl.textContent = `${year}年`;

  const zodiacEl = document.createElement("div");
  zodiacEl.className = "year-grid__zodiac";
  zodiacEl.textContent = zodiac;

  cell.append(ageEl, yearEl, zodiacEl);
  return cell;
}

function renderGrid(birthYear) {
  yearGrid.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (let age = 0; age < 80; age += 1) {
    const year = birthYear + age;
    const zodiac = getGanzhi(year);
    fragment.append(createCell(age, year, zodiac));
  }

  yearGrid.append(fragment);
  yearGrid.dataset.startYear = String(birthYear);
  updateGridMetrics();
}

async function downloadGridAsPng() {
  downloadBtn.disabled = true;
  const defaultLabel = "PNGとしてダウンロード";
  downloadBtn.textContent = "画像を作成中...";

  try {
    const canvas = await html2canvas(yearGrid, {
      backgroundColor: "#ffffff",
      scale: Math.min(window.devicePixelRatio, 2),
      useCORS: true,
    });

    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error("画像データの作成に失敗しました。");
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const baseYear =
        yearGrid.dataset.startYear ||
        yearGrid
          .querySelector(".year-grid__year")
          ?.textContent?.replace(/[^0-9]/g, "");
      link.download = baseYear
        ? `${baseYear}-80years-ganzhi.png`
        : "80-years-ganzhi.png";
      link.click();
      URL.revokeObjectURL(url);
    });
  } catch (error) {
    alert(error.message || "PNGの作成に失敗しました。");
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.textContent = defaultLabel;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const birthYear = Number(birthYearInput.value);

  if (!Number.isInteger(birthYear) || birthYear <= 0) {
    alert("正しい西暦を入力してください。");
    return;
  }

  renderGrid(birthYear);
  downloadBtn.disabled = false;
});

downloadBtn.addEventListener("click", () => {
  if (yearGrid.children.length === 0) {
    return;
  }

  downloadGridAsPng();
});

window.addEventListener("resize", () => {
  if (yearGrid.children.length === 0) {
    return;
  }

  updateGridMetrics();
});
