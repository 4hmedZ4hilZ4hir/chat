import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const clean = (q: string) => q.replace(/[^a-zA-Z ]/g, "").trim();

const url = (search: string, page = 1) => {
  const p: string[] = [];
  if (search) p.push(`search=${encodeURIComponent(search)}`);
  if (page > 1) p.push(`page=${page}`);
  return `/user${p.length ? `?${p.join("&")}` : ""}`;
};

export function usePeople(query: string, enabled = true) {
  const [list, setList] = useState<any[]>([]);
  const [next, setNext] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(() => {
      api(url(clean(query))).then((r) => { setList(r.data ?? []); setNext(r.links?.next ? 2 : null); }).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [query, enabled]);

  async function more() {
    if (!next || loading) return;
    setLoading(true);
    try {
      const r = await api(url(clean(query), next));
      setList((x) => [...x, ...(r.data ?? []).filter((u: any) => !x.some((y) => y.id === u.id))]);
      setNext(r.links?.next ? next + 1 : null);
    } catch {}
    finally { setLoading(false); }
  }

  return { list, hasMore: !!next, loading, more };
}
