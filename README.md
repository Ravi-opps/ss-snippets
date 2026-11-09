# ss.md — C Network Snippets

A React + Vite frontend for exam-ready C network programs, based on [`ss.md`](./ss.md): link-state and distance-vector routing, IPv4 addressing, and leaky-bucket traffic shaping, presented with syntax highlighting, section navigation, and copy-to-clipboard.

## Contents

| # | Program | File |
|---|---------|------|
| 01 | Dijkstra's Algorithm (Link State Routing) | `dijkstra.c` |
| 02 | CIDR / Classless Addressing | `cidr.c` |
| 03 | Distance Vector Routing | `distance_vector.c` |
| 04 | IP Address Class Lookup | `ip_class.c` |
| 05 | Leaky Bucket Algorithm | `leaky_bucket.c` |
| 06 | Dijkstra — Full Version (path reconstruction) | `dijkstra_path.c` |

Each section pairs the full C source with the shortcuts and logic notes from the original notes file. The identical duplicate CIDR block in `ss.md` is rendered once, and the Leaky Bucket and full Dijkstra programs were added on request.

## Features

- Lightweight custom C tokenizer for syntax highlighting (no highlighter dependency)
- Sticky sidebar with scroll-spy navigation
- Copy button on every code and output block
- Rendered program output for Distance Vector Routing
- Responsive layout and visible keyboard focus states

## Kafka lab notes

A separate monochrome terminal-themed route at `/kafka` presents the Kafka lab
PDFs (Programs 6–9): batch topic creation, fault tolerance simulation, topic
operations, and Kafka Connect. Every command block has a copy button.

`vercel.json` rewrites `/kafka` to the SPA entry point so the route works on a
direct visit.


## Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Stack

- React 19
- Vite
- Plain CSS (no UI framework)
- Space Grotesk + JetBrains Mono

## Source

The original four programs and their notes come from `ss.md`. The Leaky Bucket and full Dijkstra programs were added on request. This project only presents them.
