(function() {
  var K = 'fp_' + location.pathname.split('/').pop();
  var orig = document.body.innerHTML;

  firebase.initializeApp({
    apiKey: "AIzaSyANWORL9XLaoW9ncUj_Go44oiDJyEJJcqs",
    authDomain: "fire-drill-pingzhen.firebaseapp.com",
    databaseURL: "https://fire-drill-pingzhen-default-rtdb.firebaseio.com",
    projectId: "fire-drill-pingzhen",
    storageBucket: "fire-drill-pingzhen.firebasestorage.app",
    messagingSenderId: "488420822527",
    appId: "1:488420822527:web:a9a0fde305fc670932ebca",
    measurementId: "G-SFQ6P2WFZD"
  });

  function fn() {
    return decodeURIComponent(location.pathname).split('/').pop() || 'index.html';
  }

  var dbRef = firebase.database().ref('contents/' + fn().replace(/[.#$\[\]]/g, '_'));
  var skipNext = false;

  dbRef.on('value', function(snap) {
    var val = snap.val();
    if (!val) return;
    if (skipNext) { skipNext = false; return; }
    localStorage.setItem(K, val);
    var cur = document.querySelector('#fp-toolbar button:nth-child(2)');
    if (cur) cur.textContent = '💾 儲存';
    try { document.body.innerHTML = val; } catch(e) {}
  });

  function ed(on) {
    document.querySelectorAll('td,th,h1,h2,h3,h4,p,li,span,div:not(#fp-toolbar):not(#fp-toolbar *)')
      .forEach(function(el) {
        if (el.closest('#fp-toolbar') || el.tagName === 'BUTTON' || el.tagName === 'A') return;
        el.contentEditable = on;
        el.style.outline = on ? '1px dashed #64b5f6' : 'none';
      });
  }

  window.fpToggleEdit = function() {
    var edit = localStorage.getItem(K + '_mode') === 'edit';
    if (edit) {
      localStorage.setItem(K + '_mode', 'view'); ed(false);
      document.querySelector('#fp-toolbar button:first-child').textContent = '✏️ 編輯';
    } else {
      localStorage.setItem(K + '_mode', 'edit'); ed(true);
      document.querySelector('#fp-toolbar button:first-child').textContent = '🔒 鎖定';
    }
  };

  window.fpSave = function() {
    var html = document.body.innerHTML;
    localStorage.setItem(K, html);
    skipNext = true;
    var btn = document.querySelector('#fp-toolbar button:nth-child(2)');
    if (btn) btn.textContent = '⏳ 同步中…';
    dbRef.set(html).then(function() {
      alert('✅ 已儲存！所有人重新整理後會看到最新內容。');
      if (btn) btn.textContent = '💾 儲存';
    }).catch(function(e) {
      alert('⚠️ 儲存失敗：' + e.message);
      if (btn) btn.textContent = '💾 儲存';
    });
  };

  window.fpDownload = function() {
    var b = new Blob([document.documentElement.outerHTML], { type: 'text/html;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = fn(); a.click();
    URL.revokeObjectURL(a.href);
  };

  window.fpSetToken = function() {
    if (!confirm('從 Firebase 重新載入伺服器內容？（本機未儲存之編輯會遺失）')) return;
    localStorage.removeItem(K);
    location.reload();
  };

  window.fpClearAll = function() {
    if (!confirm('確定清除所有頁面的本機編輯資料？')) return;
    for (var i = localStorage.length - 1; i >= 0; i--) {
      var key = localStorage.key(i);
      if (key && key.indexOf('fp_') === 0) localStorage.removeItem(key);
    }
    location.reload();
  };

  window.fpReset = function() {
    if (!confirm('確定重設為原始內容？')) return;
    document.body.innerHTML = orig;
    localStorage.removeItem(K); localStorage.removeItem(K + '_mode');
    location.reload();
  };

  var saved = localStorage.getItem(K);
  if (saved) { try { document.body.innerHTML = saved; } catch(e) {} }
  if (localStorage.getItem(K + '_mode') === 'edit') {
    setTimeout(function() { ed(true); }, 100);
    var b = document.querySelector('#fp-toolbar button:first-child');
    if (b) b.textContent = '🔒 鎖定';
  }

  window.addEventListener('beforeunload', function() {
    localStorage.setItem(K, document.body.innerHTML);
  });
})();
