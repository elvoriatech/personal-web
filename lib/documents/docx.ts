import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
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
import { fillPlaceholders, type CoverLetterDoc, type ResumeDoc } from "./types";

export type ResumeVariant = "ats" | "design";

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

const baseStyles = {
  default: {
    document: {
      run: { font: FONT, size: 21 }, // half-points → 10.5pt
      paragraph: { spacing: { after: 100, line: 264 } },
    },
  },
};

const PAGE = {
  page: {
    margin: { top: 720, right: 720, bottom: 720, left: 720 }, // 0.5"
  },
};

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 260, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "999999", space: 2 },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 22,
        color: "000000",
        font: FONT,
      }),
    ],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: BULLET_REF, level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, font: FONT, size: 21 })],
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
}): Paragraph[] {
  const line = [d.location, d.phone, d.email, d.linkedin, d.github, d.extras]
    .filter(Boolean)
    .join(" | ");

  return [
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: d.fullName, bold: true, size: 34, font: FONT }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: d.headline, size: 22, font: FONT })],
    }),
    new Paragraph({
      spacing: { after: 160 },
      children: [new TextRun({ text: line, size: 20, font: FONT })],
    }),
  ];
}

export async function buildResumeDocx(resume: ResumeDoc): Promise<Buffer> {
  const children: Paragraph[] = [...contactBlock(resume)];

  children.push(sectionHeading("Professional Summary"));
  children.push(
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: resume.summary, font: FONT, size: 21 })],
    })
  );

  children.push(sectionHeading("Technical Skills"));
  for (const group of resume.skills) {
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `${group.label}: `, bold: true, font: FONT, size: 21 }),
          new TextRun({ text: group.items, font: FONT, size: 21 }),
        ],
      })
    );
  }

  children.push(sectionHeading("Professional Experience"));
  for (const role of resume.roles) {
    children.push(
      new Paragraph({
        spacing: { before: 140, after: 20 },
        children: [
          new TextRun({ text: role.title, bold: true, font: FONT, size: 22 }),
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
            size: 21,
          }),
          new TextRun({
            text: `\t${role.start} - ${role.end}`,
            font: FONT,
            size: 21,
          }),
        ],
      })
    );
    role.bullets.forEach((b) => children.push(bullet(b)));
  }

  if (resume.aiProjects.length > 0) {
    children.push(sectionHeading("AI Engineering Projects"));
    for (const project of resume.aiProjects) {
      children.push(
        new Paragraph({
          spacing: { before: 130, after: 20 },
          children: [
            new TextRun({ text: project.name, bold: true, font: FONT, size: 21 }),
          ],
        })
      );
      if (project.role) {
        children.push(
          new Paragraph({
            spacing: { after: 70 },
            children: [
              new TextRun({ text: project.role, italics: true, font: FONT, size: 20 }),
            ],
          })
        );
      }
      project.bullets.forEach((b) => children.push(bullet(b)));
    }
  }

  children.push(sectionHeading("Education"));
  for (const item of resume.education) {
    children.push(
      new Paragraph({
        spacing: { after: item.detail ? 20 : 60 },
        children: [
          new TextRun({ text: item.qualification, bold: true, font: FONT, size: 21 }),
          new TextRun({
            text: ` — ${item.institution}, ${item.period}`,
            font: FONT,
            size: 21,
          }),
        ],
      })
    );
    if (item.detail) {
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: item.detail, font: FONT, size: 20 })],
        })
      );
    }
  }

  if (resume.certifications.length > 0) {
    children.push(sectionHeading("Certifications"));
    for (const item of resume.certifications) {
      children.push(
        new Paragraph({
          spacing: { after: item.detail ? 20 : 60 },
          children: [
            new TextRun({ text: item.qualification, bold: true, font: FONT, size: 21 }),
            new TextRun({
              text: ` — ${item.institution}, ${item.period}`,
              font: FONT,
              size: 21,
            }),
          ],
        })
      );
      if (item.detail) {
        children.push(
          new Paragraph({
            spacing: { after: 80 },
            children: [new TextRun({ text: item.detail, font: FONT, size: 20 })],
          })
        );
      }
    }
  }

  children.push(sectionHeading("Selected Projects"));
  for (const project of resume.projects) {
    const label = project.url ? `${project.name} (${project.url})` : project.name;
    children.push(
      new Paragraph({
        spacing: { after: 70 },
        children: [
          new TextRun({ text: `${label}: `, bold: true, font: FONT, size: 21 }),
          new TextRun({ text: project.summary, font: FONT, size: 21 }),
        ],
      })
    );
  }

  children.push(sectionHeading("Languages"));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: resume.languages, font: FONT, size: 21 })],
    })
  );

  const doc = new Document({
    styles: baseStyles,
    numbering,
    sections: [{ properties: PAGE, children }],
  });

  return Packer.toBuffer(doc);
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

async function photoParagraph(): Promise<Paragraph | null> {
  try {
    const data = await readFile(join(process.cwd(), "assets", "zahoor-portrait.jpg"));
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [
        new ImageRun({
          type: "jpg",
          data,
          transformation: { width: 110, height: 110 },
        }),
      ],
    });
  } catch {
    // A missing portrait must not break the export.
    return null;
  }
}

export async function buildResumeDesignDocx(resume: ResumeDoc): Promise<Buffer> {
  const sidebar: Paragraph[] = [];

  const photo = await photoParagraph();
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
