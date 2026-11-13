/* Real Python in the browser via Pyodide (CPython compiled to WebAssembly).
   Loaded lazily the first time the Playground opens (~10 MB, cached by the browser afterwards). */
window.PyRunner = (function () {
  const SRC = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
  let py = null, loading = null, out = '';

  function load() {
    if (py) return Promise.resolve(py);
    if (loading) return loading;
    loading = new Promise((resolve, reject) => {
      const go = async () => {
        try {
          py = await window.loadPyodide();
          py.setStdout({ batched: t => { out += t + '\n'; } });
          py.setStderr({ batched: t => { out += t + '\n'; } });
          if (py.setStdin) py.setStdin({ stdin: () => 'Raul' });
          if (window.PY_PRELUDE) await py.runPythonAsync(window.PY_PRELUDE);
          resolve(py);
        } catch (e) { reject(e); }
      };
      if (window.loadPyodide) return go();
      const s = document.createElement('script'); s.src = SRC; s.onload = go;
      s.onerror = () => reject(new Error('Could not download the Python engine. Check your internet connection and try again.'));
      document.head.appendChild(s);
    });
    loading.catch(() => { loading = null; });
    return loading;
  }

  function cleanError(msg) {
    const lines = String(msg).split('\n');
    const keep = []; let skip = false;
    lines.forEach(l => {
      if (/^Traceback/.test(l)) { keep.push(l); return; }
      if (/File "\/lib\/python|_pyodide|pyodide\/|eval_code|run_async/.test(l)) { skip = true; return; }
      if (/^\s+File "<exec>"/.test(l)) { skip = false; keep.push(l.replace('<exec>', 'playground.py')); return; }
      if (skip && /^\s{4}/.test(l)) return;
      skip = false; keep.push(l);
    });
    return keep.join('\n').trim();
  }

  async function run(code) {
    await load(); out = '';
    try { await py.runPythonAsync(code); return { out, err: null }; }
    catch (e) { return { out, err: cleanError(e.message || e) }; }
  }
  async function check(expr, stdout) {
    await load();
    try { py.globals.set('__out__', stdout || ''); const r = await py.runPythonAsync('bool(' + expr + ')'); return r === true; }
    catch (e) { return false; }
  }
  async function reset() {
    if (!py) return;
    await py.runPythonAsync("for _k in [k for k in list(globals()) if not k.startswith('__')]:\n    del globals()[_k]");
    if (window.PY_PRELUDE) await py.runPythonAsync(window.PY_PRELUDE + "\nreset_aws()");
  }
  return { load, run, check, reset, ready: () => !!py };
})();
