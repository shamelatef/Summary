// ─── State ────────────────────────────────────────────────────────────────────
let rawData = [];       // array of objects (header→value)
let headers  = [];

// ─── DOM ──────────────────────────────────────────────────────────────────────
const dropzone     = document.getElementById('dropzone');
const fileInput    = document.getElementById('fileInput');
const cardMapping  = document.getElementById('card-mapping');
const cardPreview  = document.getElementById('card-preview');
const btnGen       = document.getElementById('btn-gen');
const colSelects   = {
  name:    document.getElementById('col-name'),
  project: document.getElementById('col-project'),
  id:      document.getElementById('col-id'),
  gate:    document.getElementById('col-gate'),
};
let logoBase64  = "data:image/png;base64,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";
document.getElementById('logoInput').addEventListener('change', function() {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    // Strip the data URL prefix — PptxGenJS wants raw base64
    logoBase64 = e.target.result.split(',')[1];
  };
  reader.readAsDataURL(file);
});

// ─── Drag / Drop ─────────────────────────────────────────────────────────────
dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f) handleFile(f);
});
fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });

// ─── Column selects → preview ────────────────────────────────────────────────
Object.values(colSelects).forEach(s => s.addEventListener('change', renderPreview));

// ─── File parsing ─────────────────────────────────────────────────────────────
function handleFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
      if (!json.length) throw new Error('The sheet appears to be empty.');
      rawData = json;
      headers = Object.keys(json[0]);
      showMsg('upload-msg', `✓ Loaded ${json.length} rows from "${file.name}"`, 'info');
      populateSelects();
      cardMapping.classList.remove('hidden');
      renderPreview();
    } catch(err) {
      showMsg('upload-msg', '✗ ' + err.message, 'error');
    }
  };
  reader.readAsArrayBuffer(file);
}

function populateSelects() {
  const hints = {
    name:    ['PM','name','person','employee','staff','who','resource','user','Project Manager'],
    project: ['project name','project','title','pname','proj name','project names'],
    id:      ['project id','proj id','pid','id','case','reference','number','no','ticket'],
    gate:    ['match score','score','gate','approved','status','result','rating','category','type','level','priority','classification','group'],
  };
  Object.entries(colSelects).forEach(([key, sel]) => {
    sel.innerHTML = headers.map(h => `<option value="${h}">${h}</option>`).join('');
    const best = headers.find(h =>
      hints[key].some(hint => h.toLowerCase().includes(hint))
    );
    if (best) sel.value = best;
  });
}

// ─── Preview ──────────────────────────────────────────────────────────────────
function renderPreview() {
  const cols = getColMap();
  const head = document.getElementById('preview-head');
  const body = document.getElementById('preview-body');
  const stats = document.getElementById('stats-bar');

  head.innerHTML = `<tr>${['PM','Project Names','Project ID'].map(h=>`<th>${h}</th>`).join('')}</tr>`;
  const preview = rawData.slice(0, 6);
  body.innerHTML = preview.map(row => `
    <tr>
      <td>${row[cols.name]||'—'}</td>
      <td>${row[cols.project]||'—'}</td>
      <td>${row[cols.id]||'—'}</td>
    </tr>
  `).join('');

  const unique   = new Set(rawData.map(r => r[cols.name])).size;
  const approved = rawData.filter(r => isApproved(r[cols.gate])).length;
  stats.innerHTML = `
    <div class="stat-pill">Rows: <strong>${rawData.length}</strong></div>
    <div class="stat-pill">PMs: <strong>${unique}</strong></div>
    <div class="stat-pill">Match Score: <strong>${approved}</strong></div>
  `;

  cardPreview.classList.remove('hidden');
  btnGen.disabled = false;
}

function gateTag(val) {
  return `<span class="badge badge-neutral">${val||'—'}</span>`;
}

function isApproved(val) {
  if (val === undefined || val === null) return false;
  const v = String(val).toLowerCase().trim();
  const num = parseFloat(v);
  if (!isNaN(num)) return num > 0;
  return ['yes','true','1','approved','y','✓','x'].includes(v);
}

function getColMap() {
  return {
    name:    colSelects.name.value,
    project: colSelects.project.value,
    id:      colSelects.id.value,
    gate:    colSelects.gate.value,
  };
}

// ─── PPTX Generation ──────────────────────────────────────────────────────────
btnGen.addEventListener('click', async () => {
  btnGen.classList.add('loading');
  btnGen.disabled = true;
  document.getElementById('btn-label').textContent = 'Generating…';
  await new Promise(r => setTimeout(r, 50));

  try {
    await buildPPTX();
    showToast();
  } catch(err) {
    alert('Error generating slide: ' + err.message);
    console.error(err);
  }

  btnGen.classList.remove('loading');
  btnGen.disabled = false;
  document.getElementById('btn-label').textContent = '⚡ Generate PowerPoint Slide';
});

async function buildPPTX() {
  if (typeof PptxGenJS === 'undefined') {
    throw new Error('PptxGenJS library is not loaded. Please refresh the page and check your internet connection.');
  }

  const cols = getColMap();

  // ── Group data by name and gate approved ──────────────────────────────────
  const grouped = {};
  rawData.forEach(row => {
    const name = String(row[cols.name] || 'Unknown').trim().split(',')[0];
    const gateValue = row[cols.gate];
    const gate = gateValue !== null && gateValue !== undefined ? String(gateValue).trim() : 'Unknown';

    if (!grouped[name]) grouped[name] = {};
    if (!grouped[name][gate]) grouped[name][gate] = [];

    grouped[name][gate].push({
      project: String(row[cols.project] || ''),
      id:      String(row[cols.id]      || ''),
      gate:    row[cols.gate],
    });
  });

  const people     = Object.keys(grouped).sort();
  const grandTotal = rawData.length;

  // ── PptxGenJS Setup ───────────────────────────────────────────────────────
  const pres = new PptxGenJS();
  pres.layout  = 'LAYOUT_WIDE'; // 13.3" × 7.5"
  pres.author  = 'Vodafone Identity Match Generator';
  pres.title   = 'Identity Match Summary';

  const W = 13.3, H = 7.5;

  // ── Palette ───────────────────────────────────────────────────────────────
  const C = {
    bg:       '1a0a0a',   // deep near-black background
    panel:    '240c0c',   // card surface
    border:   '4a1515',   // card / row border (crimson-tinted)
    accent:   '6b1414',   // crimson — badges, stripes, grand total
    mint:     '2d5a2d',   // green — gate approved header strip
    white:    'FFFFFF',
    text:     'e0b8b8',   // warm off-white for row text
    muted:    '8a5555',   // dusty rose for col headers / IDs
    teal:     '6b1414',   // project count badge bg (crimson family)
    red:      '4a1414',   // flagged / alternating row bg
    hdr_bg:   '1e0909',   // panel top-bar / name header bg
    row_alt:  '2d0e0e',   // secondary alternating row bg
  };

  const slide = pres.addSlide();

  // ── Background ────────────────────────────────────────────────────────────
  slide.background = { color: C.bg };

  // Left accent bar
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 0.07, h: H,
    fill: { color: C.accent }, line: { type: 'none' }
  });

  // Header band
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: W, h: 0.82,
    fill: { color: C.hdr_bg }, line: { type: 'none' }
  });

  // Title
  slide.addText('Projects Summary', {
    x: 0.22, y: 0.05, w: 8, h: 0.55,
    fontSize: 20, bold: true, color: C.white,
    fontFace: 'Calibri', charSpacing: 4, valign: 'middle', margin: 0,
  });

  // Grand total badge (top right)
  slide.addShape(pres.ShapeType.rect, {
    x: 10.5, y: 0.1, w: 2.6, h: 0.6,
    fill: { color: C.accent }, line: { type: 'none' },
    rectRadius: 0.06,
  });
  slide.addText(`Grand Total: ${grandTotal}`, {
    x: 10.5, y: 0.1, w: 2.6, h: 0.6,
    fontSize: 12, bold: true, color: C.white,
    fontFace: 'Calibri', align: 'center', valign: 'middle', margin: 0,
  });

  // ── Layout calculation ────────────────────────────────────────────────────
  const numPeople = people.length;
  const maxCols   = numPeople <= 2 ? numPeople : numPeople <= 4 ? 2 : numPeople <= 6 ? 3 : 4;
  const numCols   = Math.min(numPeople, maxCols);
  const numRows   = Math.ceil(numPeople / numCols);

  const marginX  = 0.18;
  const startY   = 0.95;
  const gapX     = 0.14;
  const gapY     = 0.14;
  const totalW   = W - marginX * 2;
  const colW     = (totalW - gapX * (numCols - 1)) / numCols;
  const totalH   = H - startY - 0.1;
  const blockH   = (totalH - gapY * (numRows - 1)) / numRows;

  // ── Per-person cards ──────────────────────────────────────────────────────
  people.forEach((name, idx) => {
    const col = idx % numCols;
    const row = Math.floor(idx / numCols);
    const x   = marginX + col * (colW + gapX);
    const y   = startY  + row * (blockH + gapY);
    const gateGroups = grouped[name];

    let totalProjects = 0;
    Object.keys(gateGroups).forEach(gate => {
      totalProjects += gateGroups[gate].length;
    });

    // Card background
    slide.addShape(pres.ShapeType.rect, {
      x, y, w: colW, h: blockH,
      fill: { color: C.panel }, line: { color: C.border, pt: 0.75 }
    });

    // Left accent stripe on card
    slide.addShape(pres.ShapeType.rect, {
      x, y, w: 0.045, h: blockH,
      fill: { color: C.accent }, line: { type: 'none' }
    });

    // Name header within card
    const nameH = 0.40;
    slide.addShape(pres.ShapeType.rect, {
      x: x + 0.045, y, w: colW - 0.045, h: nameH,
      fill: { color: C.hdr_bg }, line: { type: 'none' }
    });

    slide.addText(name, {
      x: x + 0.16, y: y + 0.01, w: colW - 0.6, h: nameH - 0.02,
      fontSize: 12.5, bold: true, color: C.white,
      fontFace: 'Calibri', valign: 'middle', margin: 0,
    });

    // Count badge inside name header
    slide.addShape(pres.ShapeType.rect, {
      x: x + colW - 0.72, y: y + 0.07, w: 0.60, h: 0.24,
      fill: { color: C.teal }, line: { type: 'none' }
    });
    slide.addText(`${totalProjects} project${totalProjects !== 1 ? 's' : ''}`, {
      x: x + colW - 0.72, y: y + 0.07, w: 0.60, h: 0.24,
      fontSize: 9, bold: true, color: C.white,
      fontFace: 'Calibri', align: 'center', valign: 'middle', margin: 0,
    });

    // Sub-header row: columns
    const subHdrY = y + nameH;
    const subHdrH = 0.22;
    slide.addShape(pres.ShapeType.rect, {
      x, y: subHdrY, w: colW, h: subHdrH,
      fill: { color: C.border }, line: { type: 'none' }
    });

    const projColW = colW * 0.60;
    const idColW   = colW * 0.40;

    [
      ['Project Name', projColW, 0.10],
      ['Project ID',   idColW,   projColW + 0.10],
    ].forEach(([label, w, ox]) => {
      slide.addText(label, {
        x: x + ox, y: subHdrY, w, h: subHdrH,
        fontSize: 7.5, bold: true, color: C.muted,
        fontFace: 'Calibri', valign: 'middle', margin: 0,
        charSpacing: 1.5, align: 'center',
      });
    });

    // Row content — grouped by gate approved
    const rowsAreaY = subHdrY + subHdrH;
    let currentY = rowsAreaY;
    const gateValues = Object.keys(gateGroups).sort();

    gateValues.forEach((gateValue, gateIdx) => {
      const projects = gateGroups[gateValue];
      const gateHeaderH = 0.25;

      if (gateIdx > 0) {
        // Separator between gate groups
        slide.addShape(pres.ShapeType.rect, {
          x, y: currentY + 0.05, w: colW, h: 0.01,
          fill: { color: C.border }, line: { type: 'none' }
        });
        currentY += 0.06;
      }

      // Gate approved header strip — green
      slide.addShape(pres.ShapeType.rect, {
        x: x + 0.045, y: currentY, w: colW - 0.045, h: gateHeaderH,
        fill: { color: C.mint }, line: { type: 'none' }
      });
      slide.addText(`Gate Approved: ${gateValue} (${projects.length})`, {
        x: x + 0.045, y: currentY, w: colW - 0.045, h: gateHeaderH,
        fontSize: 8, bold: true, color: 'b8e8b8',
        fontFace: 'Calibri', align: 'center', valign: 'middle', margin: 0,
      });

      currentY += gateHeaderH + 0.03;

      // Project rows — even: neutral dark, odd: flagged crimson
      const projRowH = 0.18;
      projects.forEach((proj, pi) => {
        const altBg = pi % 2 === 0 ? C.panel : C.red;

        slide.addShape(pres.ShapeType.rect, {
          x: x + 0.045, y: currentY, w: colW - 0.045, h: projRowH,
          fill: { color: altBg }, line: { type: 'none' }
        });

        const textOpts = { fontFace: 'Calibri', fontSize: 7, color: C.text, valign: 'middle', margin: 0 };

        slide.addText(proj.project, {
          ...textOpts, x: x + 0.10, y: currentY, w: projColW, h: projRowH,
          shrinkText: true,
        });

        slide.addText(proj.id, {
          ...textOpts, x: x + projColW + 0.10, y: currentY, w: idColW, h: projRowH,
          color: C.muted, shrinkText: true, align: 'center',
        });

        currentY += projRowH;
      });
    });

    // Bottom accent line on card
    slide.addShape(pres.ShapeType.rect, {
      x, y: y + blockH - 0.01, w: colW, h: 0.01,
      fill: { color: C.accent }, line: { type: 'none' }
    });
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  slide.addText(`Generated ${today}  ·  ${people.length} PMs  ·  ${grandTotal} total matches`, {
    x: 0.2, y: H - 0.28, w: W - 0.4, h: 0.22,
    fontSize: 8, color: C.muted, fontFace: 'Calibri',
    align: 'right', valign: 'middle', margin: 0,
  });
  // ── Logo (bottom-right) ───────────────────────────────────────────────────
// Convert images.png to base64 first, then pass it here.
// If you load the file via an <input type="file">, read it with FileReader
// and store the base64 result in a variable like `logoBase64`.
if (logoBase64) {
  slide.addImage({
    data: `data:image/png;base64,${logoBase64}`,  // ← add the data URI prefix
    x: W - 1.1,
    y: H - 0.65,
    w: 0.9,
    h: 0.45,
  });
}

  await pres.writeFile({ fileName: 'Vodafone_Identity_Match_Slide.pptx' });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = `msg msg-${type}`;
  el.classList.remove('hidden');
}

function showToast() {
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}