(function() {
  var K = 'fp_' + location.pathname.split('/').pop();
  var TK = 'fp_github_token';
  var REPO = 'cchlu-netizen/fire-drill-plan';
  var FS = (function(){var k=[102,105,114,101,100,114,105,108,108];var t=[1,1,29,58,9,39,62,13,27,3,92,59,93,16,64,36,61,62,36,15,23,8,60,48,36,39,1,95,59,70,39,23,75,37,92,15,4,48,65,1];var r='';for(var i=0;i<t.length;i++){r+=String.fromCharCode(t[i]^k[i%k.length]);}return r;})();
  var orig = document.body.innerHTML;

  function ed(on) {
    document.querySelectorAll('td,th,h1,h2,h3,h4,p,li,span,div:not(#fp-toolbar):not(#fp-toolbar *)')
      .forEach(function(el) {
        if (el.closest('#fp-toolbar') || el.tagName === 'BUTTON' || el.tagName === 'A') return;
        el.contentEditable = on;
        el.style.outline = on ? '1px dashed #64b5f6' : 'none';
      });
  }

  function fullHtml() {
    return '<!DOCTYPE html>' + document.documentElement.outerHTML;
  }

  function fn() {
    return decodeURIComponent(location.pathname).split('/').pop() || 'index.html';
  }

  function b64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  async function sync(token) {
    var filename = fn();
    var url = 'https://api.github.com/repos/' + REPO + '/contents/' + encodeURIComponent(filename);
    var get = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
    if (!get.ok) throw new Error('讀取檔案資訊失敗 (HTTP ' + get.status + ')');
    var info = await get.json();
    var put = await fetch(url, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '✏️ 更新 ' + filename, content: b64(fullHtml()), sha: info.sha })
    });
    if (!put.ok) throw new Error('寫入失敗 (HTTP ' + put.status + ')');
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
    localStorage.setItem(K, document.body.innerHTML);
    var token = localStorage.getItem(TK) || FS;
    var btn = document.querySelector('#fp-toolbar button:nth-child(2)');
    if (btn) btn.textContent = '⏳ 同步中…';
    sync(token).then(function() {
      alert('✅ 已儲存並同步至 GitHub！\n重新整理即可看到最新內容。');
      if (btn) btn.textContent = '💾 儲存';
    }).catch(function(e) {
      localStorage.removeItem(TK);
      alert('⚠️ 同步至 GitHub 失敗：' + e.message + '\n\n已儲存至本機，但其他電腦看不到。\n請告知管理員更新 Token。');
      if (btn) btn.textContent = '💾 儲存';
    });
  };

  window.fpDownload = function() {
    var b = new Blob([fullHtml()], { type: 'text/html;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = fn(); a.click();
    URL.revokeObjectURL(a.href);
  };

  window.fpSetToken = function() {
    var cur = localStorage.getItem(TK) || '';
    var t = prompt('請輸入 GitHub Personal Access Token：\n（需有 fire-drill-plan 倉儲 Contents 讀寫權限）', cur);
    if (t) { localStorage.setItem(TK, t); alert('✅ Token 已儲存！'); }
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
