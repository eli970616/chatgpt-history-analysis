#!/usr/bin/env python3
"""Extract user messages from a ChatGPT data export into time-ordered chunk files.

Usage:
  python3 extract.py <export_dir> <corpus_out_dir>

Output:
  <corpus_out_dir>/part-XX.txt  -> chronological user messages, capped by approx token size
  <corpus_out_dir>/index.md     -> per-chunk time range, message count, top conversation titles
"""
import json
import os
import sys
import glob
import datetime
from collections import Counter

MSG_CHAR_CAP = 1500          # truncate very long pastes (code/logs) per message
CHUNK_CHAR_TARGET = 320_000  # ~80k tokens per chunk file (chars/4)


def ts_to_str(t):
    try:
        return datetime.datetime.fromtimestamp(t).strftime("%Y-%m-%d %H:%M")
    except Exception:
        return "?"


def collect(export_dir):
    files = sorted(glob.glob(os.path.join(export_dir, "conversations-*.json")))
    if not files:
        # single-file exports use conversations.json
        single = os.path.join(export_dir, "conversations.json")
        if os.path.exists(single):
            files = [single]
    rows = []  # (time, title, text)
    for f in files:
        try:
            data = json.load(open(f, encoding="utf-8"))
        except Exception as e:
            print("skip", f, e)
            continue
        for c in data:
            title = (c.get("title") or "").strip()
            ct = c.get("create_time") or 0
            for node in c.get("mapping", {}).values():
                msg = node.get("message")
                if not msg:
                    continue
                author = msg.get("author", {}) or {}
                if author.get("role") != "user":
                    continue
                content = msg.get("content", {}) or {}
                if content.get("content_type") != "text":
                    continue
                parts = content.get("parts") or []
                txt = "\n".join(p for p in parts if isinstance(p, str)).strip()
                if not txt:
                    continue
                meta = msg.get("metadata", {}) or {}
                if meta.get("is_visually_hidden_from_conversation"):
                    continue
                t = msg.get("create_time") or ct or 0
                if len(txt) > MSG_CHAR_CAP:
                    txt = txt[:MSG_CHAR_CAP] + " […截断]"
                rows.append((t, title, txt))
    rows.sort(key=lambda r: r[0])
    return rows


def write_chunks(rows, out):
    os.makedirs(out, exist_ok=True)
    chunks = []
    cur = []
    cur_chars = 0
    for r in rows:
        rlen = len(r[2]) + len(r[1]) + 40
        if cur and cur_chars + rlen > CHUNK_CHAR_TARGET:
            chunks.append(cur)
            cur = []
            cur_chars = 0
        cur.append(r)
        cur_chars += rlen
    if cur:
        chunks.append(cur)

    index_lines = ["# 语料分片索引\n",
                   f"总用户消息数: {len(rows)}  |  分片数: {len(chunks)}\n"]
    for i, ch in enumerate(chunks, 1):
        name = f"part-{i:02d}.txt"
        path = os.path.join(out, name)
        titles = Counter()
        with open(path, "w", encoding="utf-8") as w:
            last_title = None
            for t, title, txt in ch:
                titles[title] += 1
                if title != last_title:
                    w.write(f"\n===== [{ts_to_str(t)}] 对话《{title}》 =====\n")
                    last_title = title
                else:
                    w.write(f"\n--- [{ts_to_str(t)}] ---\n")
                w.write(txt + "\n")
        t0 = ts_to_str(ch[0][0])
        t1 = ts_to_str(ch[-1][0])
        top = "; ".join(f"{k}({v})" for k, v in titles.most_common(8) if k)
        index_lines.append(
            f"\n## {name}\n- 时间范围: {t0} → {t1}\n- 消息数: {len(ch)}\n- 高频对话: {top}\n"
        )
        print(f"wrote {name}: {len(ch)} msgs, {t0} -> {t1}")

    with open(os.path.join(out, "index.md"), "w", encoding="utf-8") as w:
        w.write("\n".join(index_lines))
    print("wrote index.md,", len(chunks), "chunks")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("usage: extract.py <export_dir> <corpus_out_dir>")
    export_dir, out = sys.argv[1], sys.argv[2]
    rows = collect(export_dir)
    print("collected user messages:", len(rows))
    if not rows:
        sys.exit("no user messages found — is this a ChatGPT export dir?")
    write_chunks(rows, out)
