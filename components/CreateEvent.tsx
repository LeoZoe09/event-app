'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateEventPage() {
  const router = useRouter();

  // State für alle Felder deines Schemas
  const [form, setForm] = useState({
    title: '',
    description: '',
    overview: '',
    venue: '',
    location: '',
    date: '',
    time: '',
    mode: 'offline',
    audience: '',
    organizer: '',
  });

  const [tags, setTags] = useState<string[]>([]);
  const [agenda, setAgenda] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Event-Erstellung
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // FormData anlegen, wie dein API-Handler es erwartet
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    formData.append('tags', JSON.stringify(tags));
    formData.append('agenda', JSON.stringify(agenda));
    if (image) formData.append('image', image);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Could not create event');
      }

      await res.json();
      setForm({
        title: '',
        description: '',
        overview: '',
        venue: '',
        location: '',
        date: '',
        time: '',
        mode: 'offline',
        audience: '',
        organizer: ''
      });
      router.push('/'); // Nach erfolgreicher Erstellung zurück zur Startseite
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Create New Event</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Titel */}
        <input
          type="text"
          placeholder="Event Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          className="w-full border p-2 rounded"
        />

        {/* Beschreibung */}
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
          className="w-full border p-2 rounded"
        />

        {/* Überblick */}
        <textarea
          placeholder="Overview (short summary)"
          value={form.overview}
          onChange={(e) => setForm({ ...form, overview: e.target.value })}
          required
          className="w-full border p-2 rounded"
        />

        {/* Veranstaltungsort & Ort */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Venue"
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Datum & Uhrzeit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
            className="w-full border p-2 rounded"
          />
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Modus (online/offline/hybrid) */}
        <select
          value={form.mode}
          onChange={(e) => setForm({ ...form, mode: e.target.value })}
          required
          className="w-full border p-2 rounded"
        >
          <option value="offline">Offline</option>
          <option value="online">Online</option>
          <option value="hybrid">Hybrid</option>
        </select>

        {/* Zielgruppe */}
        <input
          type="text"
          placeholder="Audience (e.g., Beginners, Developers, Students)"
          value={form.audience}
          onChange={(e) => setForm({ ...form, audience: e.target.value })}
          required
          className="w-full border p-2 rounded"
        />

        {/* Veranstalter */}
        <input
          type="text"
          placeholder="Organizer"
          value={form.organizer}
          onChange={(e) => setForm({ ...form, organizer: e.target.value })}
          required
          className="w-full border p-2 rounded"
        />

        {/* Bild */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          required
          className="w-full border p-2 rounded"
        />

        {/* Tags */}
        <input
          type="text"
          placeholder="Tags (comma separated)"
          onChange={(e) => setTags(e.target.value.split(',').map((t) => t.trim()))}
          required
          className="w-full border p-2 rounded"
        />

        {/* Agenda */}
        <textarea
          placeholder="Agenda (one item per line)"
          onChange={(e) => setAgenda(e.target.value.split('\n'))}
          required
          className="w-full border p-2 rounded height-32"
        />

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Erstelle...' : 'Create Event'}
        </button>
      </form>
    </main>
  );
}
