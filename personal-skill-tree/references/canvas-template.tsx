// Personal skill-tree canvas template.
// FILL IN the DOMAINS array below with the extracted domains/skills, and set
// the title (`<Name> OS v1.0`) in the SkillTree component. Everything else
// (clickable cards, four-tier coloring, expand/collapse, stats) stays as-is.
// Save as `<output_dir>/skill-tree.canvas.tsx`.
//
// Canvas SDK rules: colors only from useHostTheme() tokens (no hardcoded hex);
// when mapping arrays, put the `key` on a wrapping <div>.

import {
  Stack,
  Row,
  H1,
  Text,
  Stat,
  Grid,
  Button,
  useHostTheme,
  useCanvasState,
} from "cursor/canvas";

type Level = "core" | "strong" | "solid" | "training";

interface Skill {
  id: string;
  name: string; // English name
  zh: string; // Chinese name
  level: Level;
  definition: string;
  evidence: string; // dated verbatim quotes / events
  reuse: string; // when to reuse
}

interface Domain {
  id: string;
  title: string; // English
  zh: string; // Chinese
  note?: string; // optional one-line note under the domain title
  skills: Skill[];
}

// ============================================================================
// FILL IN: replace these placeholder domains with the real extracted tree.
// Let the data decide the number of domains (usually 5-8) + a final
// "Growing Edges" domain holding the ▲ bottleneck skills.
// ============================================================================
const DOMAINS: Domain[] = [
  {
    id: "domain1",
    title: "Domain One",
    zh: "领域一(根引擎)",
    note: "既是根、又在高速成长、且给其他所有能力供能。删掉它,主回路会断。",
    skills: [
      {
        id: "skill1", name: "Skill Name", zh: "技能中文名", level: "core",
        definition: "一句话说清这是什么能力。",
        evidence: "[YYYY-MM-DD]「原句证据」;其他带日期事件。",
        reuse: "下次在什么具体情境主动调用它。",
      },
      {
        id: "skill2", name: "Another Skill", zh: "另一个技能", level: "strong",
        definition: "一句话定义。",
        evidence: "[YYYY-MM-DD]「原句」。",
        reuse: "复用场景。",
      },
    ],
  },
  {
    id: "edges",
    title: "Growing Edges",
    zh: "训练中(约束节点·非强项)",
    note: "限流阀:分别掐住「尝试—反馈—复原」主回路的不同环节。要当成一等公民来修。",
    skills: [
      {
        id: "edge1", name: "Bottleneck Skill", zh: "瓶颈技能", level: "training",
        definition: "一句话定义。",
        evidence: "[YYYY-MM-DD]「原句」。",
        reuse: "把它当成什么来对待 / 用哪个已有 skill 来补它。",
      },
    ],
  },
];

const LEVEL_META: Record<Level, { label: string; mark: string; desc: string }> = {
  core: { label: "Core 核心引擎", mark: "◆", desc: "既是根、又高速成长、给其他能力供能" },
  strong: { label: "Strong 高速成长", mark: "●", desc: "近期陡增的新曲线" },
  solid: { label: "Solid 稳定", mark: "○", desc: "长期稳定在高位的老曲线" },
  training: { label: "Training 训练中", mark: "▲", desc: "瓶颈 / 约束节点,重点练" },
};

function useLevelColor() {
  const theme = useHostTheme();
  return (l: Level) =>
    l === "core"
      ? theme.accent.primary
      : l === "strong"
        ? theme.category.green
        : l === "solid"
          ? theme.category.cyan
          : theme.category.orange;
}

function DetailLine({ label, text, color }: { label: string; text: string; color: string }) {
  const theme = useHostTheme();
  return (
    <div style={{ display: "flex", gap: 8, textAlign: "left" }}>
      <div style={{ color, fontWeight: 590, fontSize: 12, minWidth: 34, flexShrink: 0 }}>{label}</div>
      <div style={{ color: theme.text.secondary, fontSize: 12, lineHeight: "17px", flex: 1 }}>{text}</div>
    </div>
  );
}

function SkillCard({
  skill,
  expanded,
  onToggle,
}: {
  skill: Skill;
  expanded: boolean;
  onToggle: () => void;
}) {
  const theme = useHostTheme();
  const color = useLevelColor()(skill.level);
  return (
    <div
      onClick={onToggle}
      style={{
        border: `1px solid ${expanded ? color : theme.stroke.secondary}`,
        borderLeft: `3px solid ${color}`,
        background: expanded ? theme.fill.tertiary : theme.fill.quaternary,
        borderRadius: 8,
        padding: "10px 12px",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ color, fontSize: 13, fontWeight: 590, flexShrink: 0 }}>{LEVEL_META[skill.level].mark}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text size="small" weight="medium">{skill.name}</Text>
          <div style={{ color: theme.text.tertiary, fontSize: 12 }}>{skill.zh}</div>
        </div>
        <div
          style={{
            width: 0, height: 0,
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: `5px solid ${theme.text.quaternary}`,
            transform: expanded ? "rotate(180deg)" : "none",
            flexShrink: 0,
          }}
        />
      </div>
      <div style={{ marginTop: 6, color: theme.text.secondary, fontSize: 12, lineHeight: "17px" }}>
        {skill.definition}
      </div>
      {expanded ? (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: `1px solid ${theme.stroke.tertiary}`,
            display: "flex",
            flexDirection: "column",
            gap: 7,
          }}
        >
          <DetailLine label="证据" text={skill.evidence} color={theme.category.blue} />
          <DetailLine label="复用" text={skill.reuse} color={theme.category.green} />
        </div>
      ) : null}
    </div>
  );
}

function DomainColumn({
  domain,
  openIds,
  toggle,
}: {
  domain: Domain;
  openIds: string[];
  toggle: (id: string) => void;
}) {
  const theme = useHostTheme();
  return (
    <div
      style={{
        border: `1px solid ${theme.stroke.secondary}`,
        borderRadius: 10,
        background: theme.bg.chrome,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div>
        <Row gap={8} align="baseline">
          <Text weight="medium">{domain.title}</Text>
          <Text size="small" tone="tertiary">{domain.zh}</Text>
        </Row>
        {domain.note ? (
          <div style={{ marginTop: 4, color: theme.text.quaternary, fontSize: 11, lineHeight: "15px" }}>
            {domain.note}
          </div>
        ) : null}
      </div>
      <Stack gap={8}>
        {domain.skills.map((s) => (
          <div key={s.id}>
            <SkillCard skill={s} expanded={openIds.includes(s.id)} onToggle={() => toggle(s.id)} />
          </div>
        ))}
      </Stack>
    </div>
  );
}

function LevelLegend({ level }: { level: Level }) {
  const theme = useHostTheme();
  const color = useLevelColor()(level);
  const meta = LEVEL_META[level];
  return (
    <Row gap={6} align="center">
      <div style={{ color, fontSize: 13, fontWeight: 590 }}>{meta.mark}</div>
      <Text size="small" tone="secondary">{meta.label}</Text>
      <Text size="small" tone="quaternary">· {meta.desc}</Text>
    </Row>
  );
}

export default function SkillTree() {
  const [openIds, setOpenIds] = useCanvasState<string[]>("openSkillCards", []);
  const allSkills = DOMAINS.flatMap((d) => d.skills);
  const allIds = allSkills.map((s) => s.id);
  const toggle = (id: string) =>
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const count = (l: Level) => allSkills.filter((s) => s.level === l).length;

  return (
    <Stack gap={20} style={{ padding: 24, maxWidth: 1180, margin: "0 auto" }}>
      <Stack gap={4}>
        {/* FILL IN: replace with `<Name> OS v1.0 · 个人技能树` */}
        <H1>Name OS v1.0 · 个人技能树</H1>
        <Text tone="tertiary" size="small">
          点击任意技能展开「证据 / 复用场景」· 证据均为带日期原句
        </Text>
      </Stack>

      <Grid columns={4} gap={12}>
        <Stat value={String(count("core"))} label="◆ Core 核心引擎" />
        <Stat value={String(count("strong"))} label="● Strong 高速成长" />
        <Stat value={String(count("solid"))} label="○ Solid 稳定" />
        <Stat value={String(count("training"))} label="▲ Training 训练中" tone="warning" />
      </Grid>

      <Stack gap={6}>
        <LevelLegend level="core" />
        <LevelLegend level="strong" />
        <LevelLegend level="solid" />
        <LevelLegend level="training" />
      </Stack>

      <Row gap={10} align="center">
        <Text size="small" tone="quaternary">共 {allIds.length} 项技能 · {DOMAINS.length} 个领域</Text>
        <div style={{ flex: 1 }} />
        <Button onClick={() => setOpenIds(allIds)}>展开全部</Button>
        <Button onClick={() => setOpenIds([])}>全部收起</Button>
      </Row>

      <Grid columns={3} gap={14}>
        {DOMAINS.map((d) => (
          <div key={d.id}>
            <DomainColumn domain={d} openIds={openIds} toggle={toggle} />
          </div>
        ))}
      </Grid>

      <Text tone="tertiary" size="small">
        读法:◆ 是发动机;● / ○ 大多是它的产物;▲ 是限流阀——修好它们,上面所有天赋才放得出来。遇到卡点先问:「这是缺哪个 skill,还是被哪个 ▲ 限流了?」
      </Text>
    </Stack>
  );
}
