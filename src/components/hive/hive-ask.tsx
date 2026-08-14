/**
 * Learner ask — name a pack or ask a job question to sit that industry.
 * Does not add an idle comb. Does not open /demo. Fail-closed fields stay off.
 */
import { useState, type FormEvent } from "react";
import { useHiveEditStore } from "@/lib/hive-edit-store";
import { FAIL_CLOSED_COPY } from "@/lib/sit-from-named-pack";

export function HiveAsk() {
  const sitFromNamedPack = useHiveEditStore((s) => s.sitFromNamedPack);
  const [q, setQ] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sat" | "fail-closed">("idle");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const result = sitFromNamedPack(q);
    if (result.ok) {
      setStatus("sat");
      setNote(`This sitting: ${result.pairing}. Path and Progress show it.`);
      setQ("");
      return;
    }
    setStatus("fail-closed");
    setNote(result.message || FAIL_CLOSED_COPY);
  }

  return (
    <form
      className="tutor-hive-ask"
      data-testid="hive-ask"
      data-ask-status={status}
      onSubmit={onSubmit}
    >
      <label className="sr-only" htmlFor="hive-ask-q">
        Ask a question or name a pack
      </label>
      <input
        id="hive-ask-q"
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ask a question or name a pack…"
        autoComplete="off"
        aria-label="Ask a question or name a pack"
      />
      <button type="submit">Sit</button>
      {note ? (
        <p className="tutor-hive-ask-note" data-testid="hive-ask-note" role="status">
          {note}
        </p>
      ) : null}
    </form>
  );
}
