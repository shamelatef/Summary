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
    name:    ['PM','name','person','employee','staff','who','resource','user'],
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
    const name = String(row[cols.name] || 'Unknown').trim();
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
        charSpacing: 1.5,
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
          color: C.muted, shrinkText: true,
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