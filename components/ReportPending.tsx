'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressStages } from './ProgressStages';

/** Polls report-status while the answers pipeline generates the report, then refreshes. */
export function ReportPending(props: {
  token: string;
  title: string;
  stages: string[];
  note?: string;
  failedMessage: string;
  homeHref: string;
  homeLabel: string;
}) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch(`/api/mri/report-status?token=${props.token}`);
        if (!res.ok || !active) return;
        const d = (await res.json()) as { ready: boolean; failed: boolean };
        if (!active) return;
        if (d.ready) {
          clearInterval(iv);
          router.refresh();
        } else if (d.failed) {
          clearInterval(iv);
          setFailed(true);
        }
      } catch {
        /* transient — keep polling */
      }
    };
    const iv = setInterval(poll, 2500);
    void poll();
    return () => {
      active = false;
      clearInterval(iv);
    };
  }, [props.token, router]);

  if (failed) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24">
        <p className="text-ink">{props.failedMessage}</p>
        <a href={props.homeHref} className="mt-4 inline-block text-pine hover:underline">
          {props.homeLabel}
        </a>
      </div>
    );
  }
  return <ProgressStages title={props.title} stages={props.stages} note={props.note} />;
}
