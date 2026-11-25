'use client';

import { useEffect, useRef } from 'react';
import { basicSetup, EditorView } from 'codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

const modes = {
  C: cpp,
  'C++': cpp,
  Java: java,
  JavaScript: javascript,
  Python: python,
  TypeScript: () => javascript({ typescript: true }),
};

export default function CodeEditor({ language, value, onChange, locked }) {
  const mount = useRef(null);
  const view = useRef(null);
  const current = useRef({ value, onChange });
  current.current = { value, onChange };

  useEffect(() => {
    const extensions = [
      basicSetup,
      oneDark,
      EditorView.contentAttributes.of({ 'aria-label': 'Solution code', spellcheck: 'false', autocapitalize: 'off' }),
      EditorView.updateListener.of(update => {
        if (!update.docChanged) return;
        const code = update.state.doc.toString();
        if (code !== current.current.value) current.current.onChange(code);
      }),
    ];
    const mode = modes[language];
    if (mode) extensions.push(mode());
    view.current = new EditorView({ doc: current.current.value, parent: mount.current, extensions });
    return () => {
      view.current.destroy();
      view.current = null;
    };
  }, [language]);

  useEffect(() => {
    const editor = view.current;
    if (editor && editor.state.doc.toString() !== value) {
      editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } });
    }
  }, [value]);

  return <div className="code-editor" ref={mount} inert={locked} />;
}
