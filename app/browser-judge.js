export async function judge(code, tests, signal) {
  const response = await fetch('/judge.js', { signal });
  if (!response.ok) throw Error('The JavaScript runner could not load.');
  const source = await response.text();
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.hidden = true;
    frame.setAttribute('sandbox', 'allow-scripts');
    const clean = () => {
      clearTimeout(timeout);
      signal.removeEventListener('abort', cancel);
      window.removeEventListener('message', receive);
      frame.remove();
    };
    const cancel = () => { clean(); reject(signal.reason); };
    const receive = ({ source, data }) => {
      if (source !== frame.contentWindow) return;
      if (data?.ready === true) {
        frame.contentWindow.postMessage({ code, tests }, '*');
      } else if (data?.error || Array.isArray(data?.results)) {
        clean();
        resolve(data);
      }
    };
    const timeout = setTimeout(() => {
      clean();
      reject(Error('Execution timed out. Check for an infinite loop.'));
    }, 3000);
    signal.addEventListener('abort', cancel, { once: true });
    window.addEventListener('message', receive);
    frame.srcdoc = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; worker-src blob:"><script>
      const worker = new Worker(URL.createObjectURL(new Blob([${JSON.stringify(source).replaceAll('<', '\\u003c')}], {type:'text/javascript'})));
      window.onmessage = event => { if (event.source === parent) worker.postMessage(event.data); };
      worker.onmessage = event => parent.postMessage(event.data, '*');
      worker.onerror = () => parent.postMessage({error:'Unable to start the JavaScript runner.'}, '*');
      parent.postMessage({ready:true}, '*');
    <\/script>`;
    document.body.append(frame);
  });
}
