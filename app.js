// 1. Photo Upload Logic
function loadPhoto(event) {
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById('f-photo').src = reader.result;
  };
  if (event.target.files[0]) {
    reader.readAsDataURL(event.target.files[0]);
  }
}

// 2. Dynamic Land Records (Add Rows)
function addLandRow() {
  const container = document.getElementById('land-inputs');
  const div = document.createElement('div');
  div.className = 'land-row';
  div.innerHTML = `
        <input type="text" placeholder="Village" class="l-vill" oninput="updateCard()">
        <input type="text" placeholder="Surve No" class="l-sno" oninput="updateCard()">
        <input type="number" step="0.0001" placeholder="Area" class="l-area" oninput="updateCard()">
    `;
  container.appendChild(div);
}

// 3. Live Card Update Logic (Address Section Removed)
function updateCard() {
  // Basic Details
  document.getElementById('v-name').innerText = document.getElementById('in-name').value || 'Tara Tekchand Katre';
  document.getElementById('v-nameLocal').innerText = document.getElementById('in-nameLocal').value || 'तारा टेकचंद कटरे';
  document.getElementById('v-dob').innerText = document.getElementById('in-dob').value || '01/01/1977';
  document.getElementById('v-gender').innerText = document.getElementById('in-gender').value || 'Female';
  document.getElementById('v-mobile').innerText = document.getElementById('in-mobile').value || '8459729470';

  // Aadhaar Number (Middle Section)
  let aadharVal = document.getElementById('in-aadhaar').value.replace(/\s/g, '');
  let formattedAadhar = aadharVal.replace(/(\d{4})(?=\d)/g, '$1 ');
  document.getElementById('v-aadhaar').innerText = formattedAadhar || 'XXXX XXXX XXXX';

  // Farmer ID (Bottom Section - Big Font)
  let fId = document.getElementById('in-farmerId').value || '27_476_4045_537703_005429';
  document.getElementById('v-farmerIdDisplay').innerText = fId;

  // Land Table Calculation (Back Side)
  const rows = document.querySelectorAll('.land-row');
  const tbody = document.querySelector('#landTable tbody');
  tbody.innerHTML = '';
  let total = 0;

  rows.forEach(r => {
    const v = r.querySelector('.l-vill').value;
    const s = r.querySelector('.l-sno').value;
    const a = parseFloat(r.querySelector('.l-area').value) || 0;

    if (v || s || a > 0) {
      tbody.innerHTML += `<tr><td>${v}</td><td>${s}</td><td>${a.toFixed(4)}</td></tr>`;
      total += a;
    }
  });
  document.getElementById('v-total').innerText = total.toFixed(4);

  // QR Code Generation from Farmer ID
  const qrDiv = document.getElementById('qrcode');
  qrDiv.innerHTML = '';
  if (fId) {
    new QRCode(qrDiv, {
      text: fId,
      width: 80,
      height: 80,
      correctLevel: QRCode.CorrectLevel.H
    });
  }
}

// 4. Download PDF (Front and Back on Single A4 Page)
async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const front = document.getElementById('cardFront');
  const back = document.getElementById('cardBack');

  try {
    const canvasFront = await html2canvas(front, { scale: 4, useCORS: true });
    const canvasBack = await html2canvas(back, { scale: 4, useCORS: true });

    const imgFront = canvasFront.toDataURL('image/jpeg', 1.0);
    const imgBack = canvasBack.toDataURL('image/jpeg', 1.0);

    const cardW = 85.6;
    const cardH = 54;
    const centerX = (210 - cardW) / 2;

    doc.setFontSize(10);
    doc.text("FRONT SIDE", centerX, 20);
    doc.addImage(imgFront, 'JPEG', centerX, 25, cardW, cardH);

    doc.text("BACK SIDE", centerX, 95);
    doc.addImage(imgBack, 'JPEG', centerX, 100, cardW, cardH);

    const farmerName = document.getElementById('in-name').value.trim().replace(/\s+/g, '_') || 'Farmer';
    doc.save(`${farmerName}_ID_Card.pdf`);
  } catch (e) { alert("PDF Error!"); }
}

// 5. Direct Print Action (Added)
async function printCard() {
  const front = document.getElementById('cardFront');
  const back = document.getElementById('cardBack');
  const canvasF = await html2canvas(front, { scale: 3 });
  const canvasB = await html2canvas(back, { scale: 3 });

  const pWin = window.open('', '_blank');
  pWin.document.write(`
        <html>
            <body style="display:flex; flex-direction:column; align-items:center; padding:20mm;">
                <div style="margin-bottom:10mm; text-align:center;">
                    <p>FRONT SIDE</p>
                    <img src="${canvasF.toDataURL('image/png')}" style="width:85.6mm; height:54mm; border:1px solid #000;">
                </div>
                <div style="text-align:center;">
                    <p>BACK SIDE</p>
                    <img src="${canvasB.toDataURL('image/png')}" style="width:85.6mm; height:54mm; border:1px solid #000;">
                </div>
                <script>window.onload = function() { window.print(); window.close(); }</script>
            </body>
        </html>
    `);
  pWin.document.close();
}

window.onload = updateCard;