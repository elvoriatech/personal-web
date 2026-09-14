import "server-only";

import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TabStopType,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import { condenseResume } from "./condense";
import { shapedResumePhoto } from "./photo";
import { fillPlaceholders, type CoverLetterDoc, type ResumeDoc } from "./types";

export type { ResumeVariant } from "./types";

/**
 * ATS-safe document construction.
 *
 * Applicant tracking systems parse a linear stream of paragraphs. Tables,
 * text boxes, columns, images and header/footer content are routinely dropped
 * or scrambled — the original Word résumé used 11 tables and 2 images, which is
 * why nothing below uses any of them. Bullets come from a real numbering
 * definition rather than literal "•" characters.
 */

const FONT = "Calibri";
const BULLET_REF = "ats-bullets";

const numbering = {
  config: [
    {
      reference: BULLET_REF,
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: { indent: { left: 360, hanging: 220 } },
          },
        },
      ],
    },
  ],
};

/**
 * Typography for the single-column builds, in half-points / twentieths of a
 * point as docx wants them. FULL is the standard résumé; COMPACT tightens
 * sizes and spacing so the condensed content (lib/documents/condense.ts)
 * fits one A4 page.
 */
type Typo = {
  body: number;
  small: number;
  heading: number;
  name: number;
  line: number;
  paragraphAfter: number;
  bulletAfter: number;
  roleBefore: number;
  sectionBefore: number;
  sectionAfter: number;
  margin: number;
};
const FULL: Typo = {
  body: 21, small: 20, heading: 22, name: 34, line: 264,
  paragraphAfter: 100, bulletAfter: 60, roleBefore: 140, sectionBefore: 260, sectionAfter: 120, margin: 720,
};
const COMPACT: Typo = {
  body: 18, small: 17, heading: 19, name: 28, line: 235,
  paragraphAfter: 30, bulletAfter: 10, roleBefore: 60, sectionBefore: 100, sectionAfter: 40, margin: 560,
};

function stylesFor(t: Typo) {
  return {
    default: {
      document: {
        run: { font: FONT, size: t.body },
        paragraph: { spacing: { after: t.paragraphAfter, line: t.line } },
      },
    },
  };
}
const baseStyles = stylesFor(FULL);

function pageFor(t: Typo) {
  return { page: { margin: { top: t.margin, right: t.margin, bottom: t.margin, left: t.margin } } };
}
const PAGE = pageFor(FULL);

function sectionHeading(text: string, t: Typo = FULL): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: t.sectionBefore, after: t.sectionAfter },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "999999", space: 2 },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: t.heading,
        color: "000000",
        font: FONT,
      }),
    ],
  });
}

function bullet(text: string, t: Typo = FULL): Paragraph {
  return new Paragraph({
    numbering: { reference: BULLET_REF, level: 0 },
    spacing: { after: t.bulletAfter },
    children: [new TextRun({ text, font: FONT, size: t.body })],
  });
}

function contactBlock(d: {
  fullName: string;
  headline: string;
  location: string;
  phone: string;
  email: string;
  extras?: string;
  linkedin?: string;
  github?: string;
}, t: Typo = FULL): Paragraph[] {
  const line = [d.location, d.phone, d.email, d.linkedin, d.github, d.extras]
    .filter(Boolean)
    .join(" | ");

  return [
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: d.fullName, bold: true, size: t.name, font: FONT }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: d.headline, size: t.heading, font: FONT })],
    }),
    new Paragraph({
      spacing: { after: t.sectionAfter + 40 },
      children: [new TextRun({ text: line, size: t.small, font: FONT })],
    }),
  ];
}

export async function buildResumeDocx(
  resume: ResumeDoc,
  opts: { compact?: boolean } = {}
): Promise<Buffer> {
  const t = opts.compact ? COMPACT : FULL;
  if (opts.compact) resume = condenseResume(resume);
  const children: Paragraph[] = [...contactBlock(resume, t)];

  children.push(sectionHeading("Professional Summary", t));
  children.push(
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: resume.summary, font: FONT, size: t.body })],
    })
  );

  children.push(sectionHeading("Technical Skills", t));
  for (const group of resume.skills) {
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `${group.label}: `, bold: true, font: FONT, size: t.body }),
          new TextRun({ text: group.items, font: FONT, size: t.body }),
        ],
      })
    );
  }

  children.push(sectionHeading("Professional Experience", t));
  for (const role of resume.roles) {
    children.push(
      new Paragraph({
        spacing: { before: t.roleBefore, after: 20 },
        children: [
          new TextRun({ text: role.title, bold: true, font: FONT, size: t.heading }),
        ],
      })
    );
    // Company and dates on one line, dates pushed right with a tab stop
    // (a tab stop is safe for ATS; a two-column table is not).
    children.push(
      new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: 10080 }],
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: `${role.company}, ${role.location}`,
            italics: true,
            font: FONT,
            size: t.body,
          }),
          new TextRun({
            text: `\t${role.start} - ${role.end}`,
            font: FONT,
            size: t.body,
          }),
        ],
      })
    );
    role.bullets.forEach((b) => children.push(bullet(b, t)));
  }

  if (resume.aiProjects.length > 0) {
    children.push(sectionHeading("AI Engineering Projects", t));
    for (const project of resume.aiProjects) {
      children.push(
        new Paragraph({
          spacing: { before: t.roleBefore, after: 20 },
          children: [
            new TextRun({ text: project.name, bold: true, font: FONT, size: t.body }),
          ],
        })
      );
      if (project.role) {
        children.push(
          new Paragraph({
            spacing: { after: 70 },
            children: [
              new TextRun({ text: project.role, italics: true, font: FONT, size: t.small }),
            ],
          })
        );
      }
      project.bullets.forEach((b) => children.push(bullet(b, t)));
    }
  }

  children.push(sectionHeading("Education", t));
  for (const item of resume.education) {
    children.push(
      new Paragraph({
        spacing: { after: item.detail ? 20 : 60 },
        children: [
          new TextRun({ text: item.qualification, bold: true, font: FONT, size: t.body }),
          new TextRun({
            text: ` — ${item.institution}, ${item.period}`,
            font: FONT,
            size: t.body,
          }),
        ],
      })
    );
    if (item.detail) {
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: item.detail, font: FONT, size: t.small })],
        })
      );
    }
  }

  if (resume.certifications.length > 0) {
    children.push(sectionHeading("Certifications", t));
    for (const item of resume.certifications) {
      children.push(
        new Paragraph({
          spacing: { after: item.detail ? 20 : 60 },
          children: [
            new TextRun({ text: item.qualification, bold: true, font: FONT, size: t.body }),
            new TextRun({
              text: ` — ${item.institution}, ${item.period}`,
              font: FONT,
              size: t.body,
            }),
          ],
        })
      );
      if (item.detail) {
        children.push(
          new Paragraph({
            spacing: { after: 80 },
            children: [new TextRun({ text: item.detail, font: FONT, size: t.small })],
          })
        );
      }
    }
  }

  children.push(sectionHeading("Selected Projects", t));
  for (const project of resume.projects) {
    const label = project.url ? `${project.name} (${project.url})` : project.name;
    children.push(
      new Paragraph({
        spacing: { after: 70 },
        children: [
          new TextRun({ text: `${label}: `, bold: true, font: FONT, size: t.body }),
          new TextRun({ text: project.summary, font: FONT, size: t.body }),
        ],
      })
    );
  }

  children.push(sectionHeading("Languages", t));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: resume.languages, font: FONT, size: t.body })],
    })
  );

  const doc = new Document({
    styles: stylesFor(t),
    numbering,
    sections: [{ properties: pageFor(t), children }],
  });

  return Packer.toBuffer(doc);
}

/** The ATS layout, condensed to one page. */
export function buildResumeCompactDocx(resume: ResumeDoc): Promise<Buffer> {
  return buildResumeDocx(resume, { compact: true });
}

export async function buildCoverLetterDocx(
  letter: CoverLetterDoc
): Promise<Buffer> {
  const values = {
    role: letter.targetRole || "the advertised",
    company: letter.targetCompany || "your organisation",
  };

  const children: Paragraph[] = [...contactBlock(letter)];

  children.push(
    new Paragraph({
      spacing: { before: 120, after: 160 },
      children: [
        new TextRun({
          text: new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          font: FONT,
          size: 21,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      spacing: { after: 140 },
      children: [new TextRun({ text: letter.greeting, font: FONT, size: 21 })],
    })
  );

  for (const para of letter.paragraphs) {
    children.push(
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: fillPlaceholders(para, values),
            font: FONT,
            size: 21,
          }),
        ],
      })
    );
  }

  children.push(
    new Paragraph({
      spacing: { before: 60, after: 220 },
      children: [
        new TextRun({
          text: fillPlaceholders(letter.closing, values),
          font: FONT,
          size: 21,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      spacing: { after: 20 },
      children: [new TextRun({ text: "Best regards,", font: FONT, size: 21 })],
    })
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: letter.fullName, bold: true, font: FONT, size: 21 }),
      ],
    })
  );

  const doc = new Document({
    styles: baseStyles,
    sections: [{ properties: PAGE, children }],
  });

  return Packer.toBuffer(doc);
}


/* ---------------------------------------------------------------------------
   Two-column "design" variant.

   This one is for a human reader — emailed directly, or attached where a
   person opens it (a photo is still conventional on a German CV). It uses a
   two-column table and an embedded photo, BOTH of which applicant tracking
   systems mis-parse. Never upload this variant to a job portal; use the
   single-column ATS build for that.
--------------------------------------------------------------------------- */

const SIDEBAR_WIDTH = 3400;
const MAIN_WIDTH = 7066; // sums to the A4 content width at 0.5" margins
const SIDEBAR_BG = "F3F1FE";
const ACCENT = "6D4FD0";

function sidebarHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 90 },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 18,
        color: ACCENT,
        font: FONT,
      }),
    ],
  });
}

function sidebarLine(text: string, opts: { bold?: boolean; size?: number } = {}) {
  return new Paragraph({
    spacing: { after: 50 },
    children: [
      new TextRun({
        text,
        bold: opts.bold ?? false,
        size: opts.size ?? 18,
        font: FONT,
      }),
    ],
  });
}

async function photoParagraph(resume: ResumeDoc): Promise<Paragraph | null> {
  // Uploaded photo, bundled portrait, or none — cropped to the chosen shape.
  const photo = await shapedResumePhoto(resume);
  if (!photo) return null;
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
    children: [
      new ImageRun({
        type: photo.type,
        data: photo.data,
        transformation: { width: 110, height: 110 },
      }),
    ],
  });
}

export async function buildResumeDesignDocx(resume: ResumeDoc): Promise<Buffer> {
  const sidebar: Paragraph[] = [];

  const photo = await photoParagraph(resume);
  if (photo) sidebar.push(photo);

  sidebar.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({ text: resume.fullName, bold: true, size: 26, font: FONT }),
      ],
    })
  );

  sidebar.push(sidebarHeading("Contact"));
  // Unicode glyphs read as icons for a human; they are exactly why this
  // variant is unsuitable for ATS parsing.
  for (const [glyph, value] of [
    ["\u260E", resume.phone],
    ["\u2709", resume.email],
    ["\u25C9", resume.location],
    ["\u2691", resume.extras],
  ] as const) {
    if (!value) continue;
    sidebar.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `${glyph}  `, size: 18, color: ACCENT, font: FONT }),
          new TextRun({ text: value, size: 17, font: FONT }),
        ],
      })
    );
  }

  sidebar.push(sidebarHeading("Skills"));
  for (const group of resume.skills) {
    sidebar.push(sidebarLine(group.label, { bold: true, size: 17 }));
    sidebar.push(sidebarLine(group.items, { size: 16 }));
  }

  sidebar.push(sidebarHeading("Education"));
  for (const item of [...resume.education, ...resume.certifications]) {
    sidebar.push(sidebarLine(item.qualification, { bold: true, size: 17 }));
    sidebar.push(sidebarLine(`${item.institution}, ${item.period}`, { size: 16 }));
  }

  sidebar.push(sidebarHeading("Languages"));
  sidebar.push(sidebarLine(resume.languages, { size: 16 }));

  const main: Paragraph[] = [
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: resume.headline, bold: true, size: 22, font: FONT }),
      ],
    }),
    sectionHeading("Profile"),
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: resume.summary, font: FONT, size: 19 })],
    }),
    sectionHeading("Experience"),
  ];

  for (const role of resume.roles) {
    main.push(
      new Paragraph({
        spacing: { before: 130, after: 20 },
        children: [new TextRun({ text: role.title, bold: true, font: FONT, size: 20 })],
      })
    );
    main.push(
      new Paragraph({
        spacing: { after: 70 },
        children: [
          new TextRun({
            text: `${role.company}, ${role.location}  |  ${role.start} - ${role.end}`,
            italics: true,
            font: FONT,
            size: 18,
            color: "555555",
          }),
        ],
      })
    );
    role.bullets.forEach((b) =>
      main.push(
        new Paragraph({
          numbering: { reference: BULLET_REF, level: 0 },
          spacing: { after: 50 },
          children: [new TextRun({ text: b, font: FONT, size: 19 })],
        })
      )
    );
  }

  if (resume.aiProjects.length > 0) {
    main.push(sectionHeading("AI Engineering Projects"));
    for (const project of resume.aiProjects) {
      main.push(
        new Paragraph({
          spacing: { before: 120, after: 20 },
          children: [new TextRun({ text: project.name, bold: true, font: FONT, size: 20 })],
        })
      );
      project.bullets.forEach((b) =>
        main.push(
          new Paragraph({
            numbering: { reference: BULLET_REF, level: 0 },
            spacing: { after: 50 },
            children: [new TextRun({ text: b, font: FONT, size: 19 })],
          })
        )
      );
    }
  }

  main.push(sectionHeading("Selected Projects"));
  for (const project of resume.projects) {
    const label = project.url ? `${project.name} (${project.url})` : project.name;
    main.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `${label}: `, bold: true, font: FONT, size: 19 }),
          new TextRun({ text: project.summary, font: FONT, size: 19 }),
        ],
      })
    );
  }

  const layout = new Table({
    columnWidths: [SIDEBAR_WIDTH, MAIN_WIDTH],
    width: { size: SIDEBAR_WIDTH + MAIN_WIDTH, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: SIDEBAR_WIDTH, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: SIDEBAR_BG, color: "auto" },
            margins: { top: 220, bottom: 220, left: 200, right: 200 },
            verticalAlign: VerticalAlign.TOP,
            children: sidebar,
          }),
          new TableCell({
            width: { size: MAIN_WIDTH, type: WidthType.DXA },
            margins: { top: 220, bottom: 220, left: 260, right: 120 },
            verticalAlign: VerticalAlign.TOP,
            children: main,
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    styles: baseStyles,
    numbering,
    sections: [{ properties: PAGE, children: [layout] }],
  });

  return Packer.toBuffer(doc);
}
