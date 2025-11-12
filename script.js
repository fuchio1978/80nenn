const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const BASE_YEAR = 1984; // 甲子
const GRID_YEARS = 80;
const DEFAULT_DOWNLOAD_LABEL = "PNGとしてダウンロード";
const WORKING_DOWNLOAD_LABEL = "画像を作成中...";
const FALLBACK_FILENAME = "80-years-ganzhi.png";

const form = document.getElementById("birthYearForm");
const birthYearInput = document.getElementById("birthYear");
const yearGrid = document.getElementById("yearGrid");
const downloadBtn = document.getElementById("downloadBtn");

function setDownloadState({ disabled, label }) {
  downloadBtn.disabled = disabled;
  downloadBtn.textContent = label;
}

setDownloadState({ disabled: true, label: DEFAULT_DOWNLOAD_LABEL });

function getGanzhi(year) {
  const diff = year - BASE_YEAR;
  const index = ((diff % 60) + 60) % 60; // wrap negative values
  const stem = stems[index % stems.length];
  const branch = branches[index % branches.length];
  return `${stem}${branch}`;
}

function createCell({ age, year, zodiac }) {
  const cell = document.createElement("div");
  cell.className = "cell";

  const ageEl = document.createElement("div");
  ageEl.className = "cell__age";
  ageEl.textContent = `${age}歳`;

  const yearEl = document.createElement("div");
  yearEl.className = "cell__year";
  yearEl.textContent = `${year}年`;

  const zodiacEl = document.createElement("div");
  zodiacEl.className = "cell__zodiac";
  zodiacEl.textContent = zodiac;

  cell.append(ageEl, yearEl, zodiacEl);
  return cell;
}

function renderGrid(birthYear) {
  const fragment = document.createDocumentFragment();

  for (let age = 0; age < GRID_YEARS; age += 1) {
    const year = birthYear + age;
    const zodiac = getGanzhi(year);
    fragment.appendChild(createCell({ age, year, zodiac }));
  }

  yearGrid.replaceChildren(fragment);
  yearGrid.dataset.startYear = String(birthYear);
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("画像データの作成に失敗しました。"));
        return;
      }

      resolve(blob);
    });
  });
}

async function downloadGridAsPng() {
  setDownloadState({ disabled: true, label: WORKING_DOWNLOAD_LABEL });

  try {
    const canvas = await html2canvas(yearGrid, {
      backgroundColor: "#ffffff",
      scale: Math.min(window.devicePixelRatio, 2),
      useCORS: true,
    });

    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const baseYear = yearGrid.dataset.startYear;
    const fileName = baseYear
      ? `${baseYear}-80years-ganzhi.png`
      : FALLBACK_FILENAME;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    alert(error.message || "PNGの作成に失敗しました。");
  } finally {
    setDownloadState({ disabled: false, label: DEFAULT_DOWNLOAD_LABEL });
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
  setDownloadState({ disabled: false, label: DEFAULT_DOWNLOAD_LABEL });
});

downloadBtn.addEventListener("click", () => {
  if (yearGrid.children.length === 0) {
    return;
  }

  downloadGridAsPng();
});
