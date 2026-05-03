// Elements
const inputText     = document.getElementById('inputText');
const outputText    = document.getElementById('outputText');
const sourceLang    = document.getElementById('sourceLang');
const targetLang    = document.getElementById('targetLang');
const translateBtn  = document.getElementById('translateBtn');
const swapBtn       = document.getElementById('swapBtn');
const charCount     = document.getElementById('charCount');
const outCharCount  = document.getElementById('outCharCount');
const copyBtn       = document.getElementById('copyBtn');
const clearInputBtn = document.getElementById('clearInputBtn');
const clearAllBtn   = document.getElementById('clearAllBtn');
const speakBtn      = document.getElementById('speakBtn');
const detectedBadge = document.getElementById('detectedBadge');
const toastEl       = document.getElementById('toast');

// Quick language pills
document.querySelectorAll('.lang-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    targetLang.value = btn.dataset.lang;
  });
});

// Character count
inputText.addEventListener('input', () => {
  charCount.textContent = `${inputText.value.length} / 5000`;
});

// Swap
swapBtn.addEventListener('click', () => {
  const tmp = inputText.value;
  inputText.value = outputText.value;
  outputText.value = tmp;
  charCount.textContent = `${inputText.value.length} / 5000`;
  outCharCount.textContent = outputText.value ? `${outputText.value.length} chars` : '—';
  const tmpLang = sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = tmpLang;
});

// Clear input
clearInputBtn.addEventListener('click', () => {
  inputText.value = '';
  charCount.textContent = '0 / 5000';
});

// Clear ALL
clearAllBtn.addEventListener('click', () => {
  inputText.value = '';
  outputText.value = '';
  charCount.textContent = '0 / 5000';
  outCharCount.textContent = '—';
  detectedBadge.style.display = 'none';
});

// Copy
copyBtn.addEventListener('click', async () => {
  if (!outputText.value) return;
  await navigator.clipboard.writeText(outputText.value);
  showToast('Copied ✓');
});

// Toast
let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2500);
}

// 🔊 Speak
speakBtn.addEventListener('click', () => {
  if (!outputText.value) return;
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(outputText.value);
  speech.lang = targetLang.value;
  window.speechSynthesis.speak(speech);
});

// ✅ TRANSLATE — Google Translate free unofficial API
translateBtn.addEventListener('click', doTranslate);

async function doTranslate() {
  const text = inputText.value.trim();
  if (!text) { showToast('Enter text first'); return; }

  const src = sourceLang.value === 'auto' ? 'auto' : sourceLang.value;
  const tgt = targetLang.value;

  if (src === tgt) { showToast('Select different languages'); return; }

  translateBtn.classList.add('loading');
  outputText.value = '';
  outCharCount.textContent = '…';
  detectedBadge.style.display = 'none';

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${src}&tl=${tgt}&dt=t&q=${encodeURIComponent(text)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Error: ' + res.status);

    const data = await res.json();

    // Google returns nested array — extract all translated parts
    const translation = data[0].map(item => item[0]).filter(Boolean).join('');
    const detectedLang = data[2]; // detected source language

    if (src === 'auto' && detectedLang) {
      detectedBadge.textContent = `Detected: ${detectedLang}`;
      detectedBadge.style.display = 'inline-block';
    }

    outputText.value = translation;
    outCharCount.textContent = `${translation.length} chars`;

  } catch (err) {
    console.error(err);
    showToast('Translation failed — try again');
  } finally {
    translateBtn.classList.remove('loading');
  }
}