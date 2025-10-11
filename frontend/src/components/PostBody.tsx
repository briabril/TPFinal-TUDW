"use client";

import React, { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function PostBody({ post, description, created, author, isOwn }: any) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(description);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success' | null; text?: string } | null>(null);

  const handleDelete = async () => {
    if (!confirm('Eliminar post?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/posts/${post.id}`, { method: 'DELETE', credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || json?.message || 'Error eliminando');
      setMsg({ type: 'success', text: 'Post eliminado' });
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      setMsg({ type: 'error', text: err?.message || 'Error eliminando post' });
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/posts/${post.id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || json?.message || 'Error actualizando');
      setMsg({ type: 'success', text: 'Post actualizado' });
      setEditing(false);
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      setMsg({ type: 'error', text: err?.message || 'Error actualizando post' });
    } finally { setLoading(false); }
  };

  return (
    <div>
      {!editing ? (
        <>
          <p style={{ margin: '6px 0' }}>{text}</p>
          <div style={{ fontSize: 12, color: '#666' }}>
            <span>{author}</span>
            {created && <span> • {new Date(created).toLocaleString()}</span>}
          </div>
          {isOwn && (
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button onClick={() => setEditing(true)}>Editar</button>
              <button onClick={handleDelete} disabled={loading}>Eliminar</button>
            </div>
          )}
        </>
      ) : (
        <div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} style={{ width: '100%', minHeight: 80 }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={handleSave} disabled={loading}>Guardar</button>
            <button onClick={() => { setEditing(false); setText(description); }}>Cancelar</button>
          </div>
        </div>
      )}
      {msg && <div style={{ marginTop: 8, color: msg.type === 'error' ? 'crimson' : 'green' }}>{msg.text}</div>}
    </div>
  );
}
