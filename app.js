function loadPhoto(event) {
  const reader = new FileReader();
  reader.onload = () => { document.getElementById('f-photo').src = reader.result; };
  if (event.target.files[0]) reader.readAsDataURL(event.target.files[0]);
}

function addLandRow() {
  const div = document.createElement('div');
  div.className = 'land-row';
  div.innerHTML = `<input type="text" placeholder="Village" class="l-vill" oninput="updateCard()">
                     <input type="text" placeholder="Surve No" class="l-sno" oninput="updateCard()">
                     <input type="number" step="0.0001" placeholder="Area" class="l-area" oninput="updateCard()">`;
  document.getElementById('land-inputs').appendChild(div);
}

function updateCard() {
  document.getElementById('v-name').innerText = document.getElementById('in-name').value || 'Tara Tekchand Katre';
  document.getElementById('v-nameLocal').innerText = document.getElementById('in-nameLocal').value || 'तारा टेकचंद कटरे';
  document.getElementById('v-dob').innerText = document.getElementById('in-dob').value || '01/01/1977';
  document.getElementById('v-gender').innerText = document.getElementById('in-gender').value || 'Female';
  document.getElementById('v-mobile').innerText = document.getElementById('in-mobile').value || '8459729470';

  let aadhar = document.getElementById('in-aadhaar').value.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
  document.getElementById('v-aadhaar').innerText = aadhar || 'XXXX XXXX XXXX';

  let fId = document.getElementById('in-farmerId').value || '27_476_4045...';
  document.getElementById('v-farmerIdDisplay').innerText = fId;

  const tbody = document.querySelector('#landTable tbody');
  tbody.innerHTML = ''; let total = 0;
  document.querySelectorAll('.land-row').forEach(r => {
    const v = r.querySelector('.l-vill').value, s = r.querySelector('.l-sno').value, a = parseFloat(r.querySelector('.l-area').value) || 0;
    if (v || s || a > 0) { tbody.innerHTML += `<tr><td>${v}</td><td>${s}</td><td>${a.toFixed(4)}</td></tr>`; total += a; }
  });
  document.getElementById('v-total').innerText = total.toFixed(4);

  const qrDiv = document.getElementById('qrcode');
  qrDiv.innerHTML = '';
  if (fId) new QRCode(qrDiv, { text: fId, width: 80, height: 80 });
}

async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  const opts = { scale: 4, useCORS: true, logging: false };

  const canvasF = await html2canvas(document.getElementById('cardFront'), opts);
  const canvasB = await html2canvas(document.getElementById('cardBack'), opts);

  const imgW = 85.6, imgH = 54, x = (210 - imgW) / 2;
  doc.text("", x, 20);
  doc.addImage(canvasF.toDataURL('image/jpeg', 1.0), 'JPEG', x, 25, imgW, imgH);
  doc.text("", x, 95);
  doc.addImage(canvasB.toDataURL('image/jpeg', 1.0), 'JPEG', x, 100, imgW, imgH);
  doc.save(document.getElementById('v-name').innerText = document.getElementById('in-name').value || "Farmer card));
}

async function printCard() {
  const opts = { scale: 3, useCORS: true };
  const canvasF = await html2canvas(document.getElementById('cardFront'), opts);
  const canvasB = await html2canvas(document.getElementById('cardBack'), opts);
  const pWin = window.open('', '_blank');
  pWin.document.write(`<html><body style="display:flex;flex-direction:column;align-items:center;padding:10mm;">
        <div style="margin-bottom:10mm;"><p>FRONT</p><img src="${canvasF.toDataURL()}" style="width:85.6mm;border:0.5px solid #000;"></div>
        <div><p>BACK</p><img src="${canvasB.toDataURL()}" style="width:85.6mm;border:0.5px solid #000;"></div>
        <script>window.onload=function(){window.print();window.close();}</script></body></html>`);
  pWin.document.close();
}

window.onload = updateCard;
