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
let logoBase64  = "data:image/png;base64,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"
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
