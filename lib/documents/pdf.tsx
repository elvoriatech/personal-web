import "server-only";

import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { condenseResume } from "./condense";
import { shapedResumePhoto } from "./photo";
import { fillPlaceholders, type CoverLetterDoc, type ResumeDoc } from "./types";

/**
 * PDF builds of the same documents as docx.ts, laid out to match theme for
 * theme so a recruiter gets the same résumé whichever format is attached.
 *
 * Helvetica is one of the fourteen fonts every PDF reader ships, so nothing is
 * embedded, nothing is fetched at runtime and the text layer stays selectable
 * and machine-readable — which is what an applicant tracking system parses.
 * Its encoding covers Latin-1 but not decorative symbols, so the Modern
 * sidebar uses word labels where the .docx uses ✉/☎ glyphs.
 */

/*
 * Turn off automatic hyphenation. It splits words across lines ("ap-plications"),
 * which reads badly on a résumé and leaves broken tokens in the text layer that
 * an applicant tracking system parses. Returning the word whole is the
 * documented way to opt out.
 */
Font.registerHyphenationCallback((word) => [word]);

const ACCENT = "#6D4FD0";
const SIDEBAR_BG = "#F3F1FE";
const RULE = "#999999";
const MUTED = "#555555";

/** Docx sizes are half-points and twips; these are the same values in points. */
type Scale = {
  body: number;
  small: number;
  heading: number;
  name: number;
  lineHeight: number;
  paragraphGap: number;
  bulletGap: number;
  roleGap: number;
  sectionBefore: number;
  sectionAfter: number;
  margin: number;
};

const FULL: Scale = {
  body: 10.5, small: 10, heading: 11, name: 17, lineHeight: 1.26,
  paragraphGap: 5, bulletGap: 3, roleGap: 7, sectionBefore: 13, sectionAfter: 6, margin: 36,
};

/* Tuned against the real résumé so the condensed content fills one A4 page
   without spilling onto a second — re-check if ONE_PAGE_RULES changes. */
const COMPACT: Scale = {
  body: 9.2, small: 8.7, heading: 9.8, name: 15, lineHeight: 1.29,
  paragraphGap: 2.2, bulletGap: 1, roleGap: 4, sectionBefore: 6.5, sectionAfter: 2.8, margin: 30,
};

function sheet(t: Scale) {
  return StyleSheet.create({
    page: {
      paddingTop: t.margin,
      paddingBottom: t.margin,
      paddingLeft: t.margin,
      paddingRight: t.margin,
      fontFamily: "Helvetica",
      fontSize: t.body,
      lineHeight: t.lineHeight,
      color: "#000000",
    },
    name: { fontSize: t.name, fontWeight: "bold", marginBottom: 2 },
    headline: { fontSize: t.heading, marginBottom: 2 },
    contact: { fontSize: t.small, marginBottom: t.sectionAfter + 2 },
    section: {
      fontSize: t.heading,
      fontWeight: "bold",
      marginTop: t.sectionBefore,
      marginBottom: t.sectionAfter,
      paddingBottom: 2,
      borderBottomWidth: 0.75,
      borderBottomColor: RULE,
    },
    paragraph: { marginBottom: t.paragraphGap },
    roleTitle: { fontSize: t.heading, fontWeight: "bold", marginTop: t.roleGap, marginBottom: 1 },
    roleMeta: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    italic: { fontStyle: "italic", flexShrink: 1, paddingRight: 8 },
    dates: { flexShrink: 0 },
    bulletRow: { flexDirection: "row", marginBottom: t.bulletGap },
    bulletDot: { width: t.body, flexShrink: 0 },
    bulletText: { flex: 1 },
    small: { fontSize: t.small },
    bold: { fontWeight: "bold" },
  });
}

type Sheet = ReturnType<typeof sheet>;

function Bullet({ s, children }: { s: Sheet; children: string }) {
  return (
    <View style={s.bulletRow}>
      <Text style={s.bulletDot}>•</Text>
      <Text style={s.bulletText}>{children}</Text>
    </View>
  );
}

/** Keeps a heading from being stranded at the foot of a page. */
const KEEP_AHEAD = 48;

function Section({ s, title }: { s: Sheet; title: string }) {
  return (
    <Text style={s.section} minPresenceAhead={KEEP_AHEAD}>
      {title.toUpperCase()}
    </Text>
  );
}

function contactLine(d: {
  location: string;
  phone: string;
  email: string;
  linkedin?: string;
  github?: string;
  extras?: string;
}): string {
  return [d.location, d.phone, d.email, d.linkedin, d.github, d.extras]
    .filter(Boolean)
    .join(" | ");
}

/* ------------------------- Classic / Compact ------------------------- */

function ResumeDocument({ resume, t }: { resume: ResumeDoc; t: Scale }) {
  const s = sheet(t);

  return (
    <Document
      title={`${resume.fullName} — Résumé`}
      author={resume.fullName}
      subject={resume.headline}
      creator={resume.fullName}
      producer={resume.fullName}
    >
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{resume.fullName}</Text>
        <Text style={s.headline}>{resume.headline}</Text>
        <Text style={s.contact}>{contactLine(resume)}</Text>

        <Section s={s} title="Professional Summary" />
        <Text style={s.paragraph}>{resume.summary}</Text>

        <Section s={s} title="Technical Skills" />
        {resume.skills.map((group) => (
          <Text key={group.label} style={{ marginBottom: t.bulletGap + 1 }}>
            <Text style={s.bold}>{group.label}: </Text>
            <Text>{group.items}</Text>
          </Text>
        ))}

        <Section s={s} title="Professional Experience" />
        {resume.roles.map((role) => (
          <View key={`${role.company}-${role.start}`}>
            <Text style={s.roleTitle} minPresenceAhead={KEEP_AHEAD}>
              {role.title}
            </Text>
            <View style={s.roleMeta}>
              <Text style={s.italic}>
                {role.company}, {role.location}
              </Text>
              <Text style={s.dates}>
                {role.start} - {role.end}
              </Text>
            </View>
            {role.bullets.map((b) => (
              <Bullet key={b} s={s}>{b}</Bullet>
            ))}
          </View>
        ))}

        {resume.aiProjects.length > 0 && (
          <>
            <Section s={s} title="AI Engineering Projects" />
            {resume.aiProjects.map((project) => (
              <View key={project.name}>
                <Text style={{ ...s.roleTitle, fontSize: t.body }} minPresenceAhead={KEEP_AHEAD}>
                  {project.name}
                </Text>
                {project.role ? (
                  <Text style={{ ...s.small, fontStyle: "italic", marginBottom: 4 }}>
                    {project.role}
                  </Text>
                ) : null}
                {project.bullets.map((b) => (
                  <Bullet key={b} s={s}>{b}</Bullet>
                ))}
              </View>
            ))}
          </>
        )}

        <Section s={s} title="Education" />
        {resume.education.map((item) => (
          <View key={item.qualification}>
            <Text style={{ marginBottom: item.detail ? 1 : t.bulletGap + 1 }}>
              <Text style={s.bold}>{item.qualification}</Text>
              <Text>
                {" "}
                — {item.institution}, {item.period}
              </Text>
            </Text>
            {item.detail ? (
              <Text style={{ ...s.small, marginBottom: 4 }}>{item.detail}</Text>
            ) : null}
          </View>
        ))}

        {resume.certifications.length > 0 && (
          <>
            <Section s={s} title="Certifications" />
            {resume.certifications.map((item) => (
              <View key={item.qualification}>
                <Text style={{ marginBottom: item.detail ? 1 : t.bulletGap + 1 }}>
                  <Text style={s.bold}>{item.qualification}</Text>
                  <Text>
                    {" "}
                    — {item.institution}, {item.period}
                  </Text>
                </Text>
                {item.detail ? (
                  <Text style={{ ...s.small, marginBottom: 4 }}>{item.detail}</Text>
                ) : null}
              </View>
            ))}
          </>
        )}

        <Section s={s} title="Selected Projects" />
        {resume.projects.map((project) => (
          <Text key={project.name} style={{ marginBottom: t.bulletGap + 1 }}>
            <Text style={s.bold}>
              {project.url ? `${project.name} (${project.url})` : project.name}:{" "}
            </Text>
            <Text>{project.summary}</Text>
          </Text>
        ))}

        <Section s={s} title="Languages" />
        <Text>{resume.languages}</Text>
      </Page>
    </Document>
  );
}

export async function buildResumePdf(
  resume: ResumeDoc,
  opts: { compact?: boolean } = {}
): Promise<Buffer> {
  const t = opts.compact ? COMPACT : FULL;
  const doc = opts.compact ? condenseResume(resume) : resume;
  return renderToBuffer(<ResumeDocument resume={doc} t={t} />);
}

/** The Classic layout, condensed to one page. */
export function buildResumeCompactPdf(resume: ResumeDoc): Promise<Buffer> {
  return buildResumePdf(resume, { compact: true });
}

/* ------------------------------ Modern ------------------------------ */

/* A4 is 595.28pt wide; at 36pt margins the content is 523.28pt, split in the
   same proportion as the .docx table columns (3400 : 7066 twips). */
const PAGE_WIDTH = 595.28;
const M = 36;
const SIDEBAR_W = 170;
const GUTTER = 14;

const design = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.32,
    color: "#000000",
    paddingTop: M,
    paddingBottom: M,
  },
  /* Painted on every page so the sidebar colour never stops mid-document. */
  sidebarBg: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: M,
    width: SIDEBAR_W,
    backgroundColor: SIDEBAR_BG,
  },
  row: { flexDirection: "row", paddingLeft: M, paddingRight: M },
  sidebar: { width: SIDEBAR_W, paddingHorizontal: 11, paddingTop: 11, paddingBottom: 11 },
  main: { width: PAGE_WIDTH - 2 * M - SIDEBAR_W, paddingLeft: GUTTER, paddingTop: 11 },
  photo: { width: 82, height: 82, marginBottom: 8, alignSelf: "center" },
  sidebarName: { fontSize: 13, fontWeight: "bold", textAlign: "center", marginBottom: 2 },
  sidebarHeading: {
    fontSize: 9,
    fontWeight: "bold",
    color: ACCENT,
    marginTop: 10,
    marginBottom: 4,
  },
  sidebarLabel: { fontSize: 8.5, fontWeight: "bold", marginBottom: 1 },
  sidebarText: { fontSize: 8, marginBottom: 3 },
  contactLabel: { fontSize: 7.5, color: ACCENT, fontWeight: "bold" },
  contactValue: { fontSize: 8.5, marginBottom: 4 },
  headline: { fontSize: 11, fontWeight: "bold", marginBottom: 3 },
  section: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 11,
    marginBottom: 5,
    paddingBottom: 2,
    borderBottomWidth: 0.75,
    borderBottomColor: RULE,
  },
  paragraph: { marginBottom: 6 },
  roleTitle: { fontSize: 10, fontWeight: "bold", marginTop: 6, marginBottom: 1 },
  roleMeta: { fontSize: 9, fontStyle: "italic", color: MUTED, marginBottom: 4 },
  bulletRow: { flexDirection: "row", marginBottom: 2.5 },
  bulletDot: { width: 9, flexShrink: 0 },
  bulletText: { flex: 1 },
  bold: { fontWeight: "bold" },
});

type Photo = { data: Buffer; format: "png" | "jpg" };

function DesignDocument({ resume, photo }: { resume: ResumeDoc; photo: Photo | null }) {
  const values = [...resume.education, ...resume.certifications];

  return (
    <Document
      title={`${resume.fullName} — Résumé`}
      author={resume.fullName}
      subject={resume.headline}
      creator={resume.fullName}
      producer={resume.fullName}
    >
      <Page size="A4" style={design.page}>
        <View style={design.sidebarBg} fixed />

        <View style={design.row}>
          <View style={design.sidebar}>
            {/* react-pdf's Image, not next/image — a PDF has no alt text. */}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            {photo ? <Image style={design.photo} src={photo} /> : null}
            <Text style={design.sidebarName}>{resume.fullName}</Text>

            <Text style={design.sidebarHeading}>CONTACT</Text>
            {(
              [
                ["Phone", resume.phone],
                ["Email", resume.email],
                ["Location", resume.location],
                ["Status", resume.extras],
              ] as const
            )
              .filter(([, value]) => Boolean(value))
              .map(([label, value]) => (
                <View key={label}>
                  <Text style={design.contactLabel}>{label.toUpperCase()}</Text>
                  <Text style={design.contactValue}>{value}</Text>
                </View>
              ))}
            {resume.linkedin ? (
              <View>
                <Text style={design.contactLabel}>LINKEDIN</Text>
                <Text style={design.contactValue}>{resume.linkedin}</Text>
              </View>
            ) : null}
            {resume.github ? (
              <View>
                <Text style={design.contactLabel}>GITHUB</Text>
                <Text style={design.contactValue}>{resume.github}</Text>
              </View>
            ) : null}

            <Text style={design.sidebarHeading}>SKILLS</Text>
            {resume.skills.map((group) => (
              <View key={group.label}>
                <Text style={design.sidebarLabel}>{group.label}</Text>
                <Text style={design.sidebarText}>{group.items}</Text>
              </View>
            ))}

            <Text style={design.sidebarHeading}>EDUCATION</Text>
            {values.map((item) => (
              <View key={item.qualification}>
                <Text style={design.sidebarLabel}>{item.qualification}</Text>
                <Text style={design.sidebarText}>
                  {item.institution}, {item.period}
                </Text>
              </View>
            ))}

            <Text style={design.sidebarHeading}>LANGUAGES</Text>
            <Text style={design.sidebarText}>{resume.languages}</Text>
          </View>

          <View style={design.main}>
            <Text style={design.headline}>{resume.headline}</Text>

            <Text style={design.section}>PROFILE</Text>
            <Text style={design.paragraph}>{resume.summary}</Text>

            <Text style={design.section} minPresenceAhead={KEEP_AHEAD}>
              EXPERIENCE
            </Text>
            {resume.roles.map((role) => (
              <View key={`${role.company}-${role.start}`}>
                <Text style={design.roleTitle} minPresenceAhead={KEEP_AHEAD}>
                  {role.title}
                </Text>
                <Text style={design.roleMeta}>
                  {role.company}, {role.location}  |  {role.start} - {role.end}
                </Text>
                {role.bullets.map((b) => (
                  <View key={b} style={design.bulletRow}>
                    <Text style={design.bulletDot}>•</Text>
                    <Text style={design.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}

            {resume.aiProjects.length > 0 && (
              <>
                <Text style={design.section} minPresenceAhead={KEEP_AHEAD}>
                  AI ENGINEERING PROJECTS
                </Text>
                {resume.aiProjects.map((project) => (
                  <View key={project.name}>
                    <Text style={design.roleTitle} minPresenceAhead={KEEP_AHEAD}>
                      {project.name}
                    </Text>
                    {project.bullets.map((b) => (
                      <View key={b} style={design.bulletRow}>
                        <Text style={design.bulletDot}>•</Text>
                        <Text style={design.bulletText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </>
            )}

            <Text style={design.section} minPresenceAhead={KEEP_AHEAD}>
              SELECTED PROJECTS
            </Text>
            {resume.projects.map((project) => (
              <Text key={project.name} style={{ marginBottom: 3 }}>
                <Text style={design.bold}>
                  {project.url ? `${project.name} (${project.url})` : project.name}:{" "}
                </Text>
                <Text>{project.summary}</Text>
              </Text>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function buildResumeDesignPdf(resume: ResumeDoc): Promise<Buffer> {
  const shaped = await shapedResumePhoto(resume);
  const photo: Photo | null = shaped ? { data: shaped.data, format: shaped.type } : null;
  return renderToBuffer(<DesignDocument resume={resume} photo={photo} />);
}

/* --------------------------- Cover letter --------------------------- */

const letterStyles = StyleSheet.create({
  page: {
    padding: M,
    fontFamily: "Helvetica",
    fontSize: 10.5,
    lineHeight: 1.26,
    color: "#000000",
  },
  name: { fontSize: 17, fontWeight: "bold", marginBottom: 2 },
  headline: { fontSize: 11, marginBottom: 2 },
  contact: { fontSize: 10, marginBottom: 14 },
  date: { marginBottom: 8 },
  greeting: { marginBottom: 7 },
  paragraph: { marginBottom: 7 },
  closing: { marginTop: 3, marginBottom: 11 },
  signoff: { marginBottom: 1 },
  signature: { fontWeight: "bold" },
});

export async function buildCoverLetterPdf(letter: CoverLetterDoc): Promise<Buffer> {
  const values = {
    role: letter.targetRole || "the advertised",
    company: letter.targetCompany || "your organisation",
  };
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return renderToBuffer(
    <Document
      title={`${letter.fullName} — Cover letter`}
      author={letter.fullName}
      subject={letter.headline}
      creator={letter.fullName}
      producer={letter.fullName}
    >
      <Page size="A4" style={letterStyles.page}>
        <Text style={letterStyles.name}>{letter.fullName}</Text>
        <Text style={letterStyles.headline}>{letter.headline}</Text>
        <Text style={letterStyles.contact}>{contactLine(letter)}</Text>

        <Text style={letterStyles.date}>{date}</Text>
        <Text style={letterStyles.greeting}>{letter.greeting}</Text>

        {letter.paragraphs.map((para, i) => (
          <Text key={i} style={letterStyles.paragraph}>
            {fillPlaceholders(para, values)}
          </Text>
        ))}

        <Text style={letterStyles.closing}>{fillPlaceholders(letter.closing, values)}</Text>
        <Text style={letterStyles.signoff}>Best regards,</Text>
        <Text style={letterStyles.signature}>{letter.fullName}</Text>
      </Page>
    </Document>
  );
}
