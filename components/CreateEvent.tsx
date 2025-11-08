"use client";

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type FormState = {
  title: string;
  description: string;
  overview: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: 'offline' | 'online' | 'hybrid';
  audience: string;
  organizer: string;
};

const initialForm: FormState = {
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
};

export default function CreateEventPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialForm);
  const [tags, setTags] = useState<string[]>([]);
  const [agenda, setAgenda] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = useCallback(
    (key: keyof FormState, value: string) => {
      setForm((f) => ({ ...f, [key]: value }));
    },
    [],
  );

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.files?.[0] ?? null);
  }, []);

  const handleTagsChange = useCallback((value: string) => {
    setTags(
      value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    );
  }, []);

  const handleAgendaChange = useCallback((value: string) => {
    setAgenda(value.split('\n').map((s) => s.trim()).filter(Boolean));
  }, []);

  const memoForm = useMemo(() => form, [form]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      Object.entries(memoForm).forEach(([key, value]) => formData.append(key, String(value)));
      formData.append('tags', JSON.stringify(tags));
      formData.append('agenda', JSON.stringify(agenda));
      if (image) formData.append('image', image);

      const res = await fetch('/api/events', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        // try to read JSON error body, otherwise throw generic
        let errMsg = 'Could not create event';
        try {
          const errBody = await res.json();
          errMsg = errBody?.message ?? errMsg;
        } catch {
          // ignore parse errors
        }
        throw new Error(errMsg);
      }

      // success — clear form and navigate
      setForm(initialForm);
      setTags([]);
      setAgenda([]);
      setImage(null);
      router.push('/');
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'message' in err
          ? (err as { message?: string }).message
          : String(err);
      setError(message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Create New Event</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          aria-label="Event title"
          type="text"
          placeholder="Event Title"
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
          required
          className="w-full border p-2 rounded"
        />

        <textarea
          name="description"
          aria-label="Event description"
          placeholder="Description"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          required
          className="w-full border p-2 rounded"
        />

        <textarea
          name="overview"
          aria-label="Event overview"
          placeholder="Overview (short summary)"
          value={form.overview}
          onChange={(e) => handleChange('overview', e.target.value)}
          required
          className="w-full border p-2 rounded"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="venue"
            type="text"
            placeholder="Venue"
            value={form.venue}
            onChange={(e) => handleChange('venue', e.target.value)}
            required
            className="w-full border p-2 rounded"
          />

          <input
            name="location"
            type="text"
            placeholder="Location"
            value={form.location}
            onChange={(e) => handleChange('location', e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={(e) => handleChange('date', e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
          <input
            name="time"
            type="time"
            value={form.time}
            onChange={(e) => handleChange('time', e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <select
          name="mode"
          value={form.mode}
          onChange={(e) => handleChange('mode', e.target.value)}
          required
          className="w-full border p-2 rounded"
        >
          <option value="offline">Offline</option>
          <option value="online">Online</option>
          <option value="hybrid">Hybrid</option>
        </select>

        <input
          name="audience"
          type="text"
          placeholder="Audience (e.g., Beginners, Developers, Students)"
          value={form.audience}
          onChange={(e) => handleChange('audience', e.target.value)}
          required
          className="w-full border p-2 rounded"
        />

        <input
          name="organizer"
          type="text"
          placeholder="Organizer"
          value={form.organizer}
          onChange={(e) => handleChange('organizer', e.target.value)}
          required
          className="w-full border p-2 rounded"
        />

        <input
          aria-label="Event image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Tags (comma separated)"
          onChange={(e) => handleTagsChange(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <textarea
          placeholder="Agenda (one item per line)"
          onChange={(e) => handleAgendaChange(e.target.value)}
          className="w-full border p-2 rounded h-32"
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
