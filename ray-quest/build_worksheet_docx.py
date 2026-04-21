from pathlib import Path
from xml.sax.saxutils import escape
from zipfile import ZIP_DEFLATED, ZipFile


BASE_DIR = Path(__file__).parent
OUT_DOCX = BASE_DIR / "ray_quest_prediction_worksheet.docx"


CONTENT_TYPES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>
"""

RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"""

APP_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
 xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>OpenAI Codex</Application>
</Properties>
"""

STYLES_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:rPr><w:b/><w:sz w:val="30"/><w:szCs w:val="30"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:rPr><w:b/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>
  </w:style>
</w:styles>
"""

LEVELS = [
    {
        "title": "1. Mirror Gate",
        "fill": "E7EFF7",
        "border": "8FA9C2",
        "knowns": [
            "Locked receiver line: x = __________",
            "Predicted receiver height: y = __________",
            "Source angle from +x: __________ degrees",
            "Mirror rotation from +x: __________ degrees",
            "Mirror normal direction: __________ degrees",
        ],
        "work_lines": 7,
    },
    {
        "title": "2. Glass Bend",
        "fill": "F3E7C9",
        "border": "B7A16C",
        "knowns": [
            "Locked receiver line: x = __________",
            "Predicted receiver height: y = __________",
            "Source angle from +x: __________ degrees",
            "Glass boundary rotation from +x: __________ degrees",
            "Glass index of refraction: n = __________",
            "Boundary normal direction: __________ degrees",
        ],
        "work_lines": 7,
    },
    {
        "title": "3. Diamond Switchback",
        "fill": "E6F1EE",
        "border": "84A9A1",
        "knowns": [
            "Locked receiver line: x = __________",
            "Predicted receiver height: y = __________",
            "Source angle from +x: __________ degrees",
            "Mirror rotation from +x: __________ degrees",
            "Dense block rotation from +x: __________ degrees",
            "Dense block index of refraction: n = __________",
        ],
        "work_lines": 8,
    },
    {
        "title": "4. Glass Relay",
        "fill": "F6E6E1",
        "border": "C98D80",
        "knowns": [
            "Locked receiver line: x = __________",
            "Predicted receiver height: y = __________",
            "Source angle from +x: __________ degrees",
            "Crown glass rotation from +x: __________ degrees",
            "Crown glass index of refraction: n = __________",
            "Finishing mirror rotation from +x: __________ degrees",
        ],
        "work_lines": 8,
    },
    {
        "title": "5. Prism Gauntlet",
        "fill": "E7EFF7",
        "border": "8FA9C2",
        "knowns": [
            "Locked receiver line: x = __________",
            "Predicted receiver height: y = __________",
            "Source angle from +x: __________ degrees",
            "Mirror 1 rotation from +x: __________ degrees",
            "Dense glass rotation from +x: __________ degrees",
            "Dense glass index of refraction: n = __________",
            "Mirror 2 rotation from +x: __________ degrees",
        ],
        "work_lines": 9,
    },
]


def core_xml(title: str) -> str:
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
 xmlns:dc="http://purl.org/dc/elements/1.1/"
 xmlns:dcterms="http://purl.org/dc/terms/"
 xmlns:dcmitype="http://purl.org/dc/dcmitype/"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>{escape(title)}</dc:title>
  <dc:creator>OpenAI Codex</dc:creator>
</cp:coreProperties>
"""


def paragraph(text="", style=None, bold=False, bullet=False, before=0, after=120):
    p_pr = f'<w:spacing w:before="{before}" w:after="{after}"/>'
    if style:
        p_pr += f'<w:pStyle w:val="{style}"/>'
    if bullet:
        p_pr += '<w:ind w:left="720" w:hanging="360"/>'
        text = f"• {text}"
    rpr = "<w:rPr><w:b/></w:rPr>" if bold else ""
    return f'<w:p><w:pPr>{p_pr}</w:pPr><w:r>{rpr}<w:t xml:space="preserve">{escape(text)}</w:t></w:r></w:p>'


def label_box(text, fill="EDE4CF", border="B7A16C"):
    return f"""
<w:tbl>
  <w:tblPr>
    <w:tblW w:w="0" w:type="auto"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="8" w:space="0" w:color="{border}"/>
      <w:left w:val="single" w:sz="8" w:space="0" w:color="{border}"/>
      <w:bottom w:val="single" w:sz="8" w:space="0" w:color="{border}"/>
      <w:right w:val="single" w:sz="8" w:space="0" w:color="{border}"/>
      <w:insideH w:val="nil"/>
      <w:insideV w:val="nil"/>
    </w:tblBorders>
    <w:tblCellMar>
      <w:top w:w="60" w:type="dxa"/>
      <w:left w:w="120" w:type="dxa"/>
      <w:bottom w:w="60" w:type="dxa"/>
      <w:right w:w="120" w:type="dxa"/>
    </w:tblCellMar>
  </w:tblPr>
  <w:tr><w:tc><w:tcPr><w:tcW w:w="9360" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="{fill}"/></w:tcPr>
  <w:p><w:pPr><w:spacing w:before="20" w:after="20"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">{escape(text)}</w:t></w:r></w:p>
  </w:tc></w:tr>
</w:tbl>
"""


def student_info_box():
    return """
<w:tbl>
  <w:tblPr>
    <w:tblW w:w="0" w:type="auto"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="10" w:space="0" w:color="8FA9C2"/>
      <w:left w:val="single" w:sz="10" w:space="0" w:color="8FA9C2"/>
      <w:bottom w:val="single" w:sz="10" w:space="0" w:color="8FA9C2"/>
      <w:right w:val="single" w:sz="10" w:space="0" w:color="8FA9C2"/>
      <w:insideH w:val="single" w:sz="6" w:space="0" w:color="D6DEE6"/>
      <w:insideV w:val="single" w:sz="6" w:space="0" w:color="D6DEE6"/>
    </w:tblBorders>
    <w:tblCellMar>
      <w:top w:w="90" w:type="dxa"/>
      <w:left w:w="120" w:type="dxa"/>
      <w:bottom w:w="90" w:type="dxa"/>
      <w:right w:w="120" w:type="dxa"/>
    </w:tblCellMar>
  </w:tblPr>
  <w:tr>
    <w:tc><w:tcPr><w:tcW w:w="4680" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="EEF4F8"/></w:tcPr><w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Name: ____________________________________</w:t></w:r></w:p></w:tc>
    <w:tc><w:tcPr><w:tcW w:w="4680" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="EEF4F8"/></w:tcPr><w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Date / Period: _____________________________</w:t></w:r></w:p></w:tc>
  </w:tr>
</w:tbl>
"""


def boxed_area(lines=6, border="B7A16C"):
    height = 330 * max(lines, 1)
    inner = ""
    for _ in range(max(lines, 1)):
        inner += '<w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>'
    return f"""
<w:tbl>
  <w:tblPr>
    <w:tblW w:w="0" w:type="auto"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="8" w:space="0" w:color="{border}"/>
      <w:left w:val="single" w:sz="8" w:space="0" w:color="{border}"/>
      <w:bottom w:val="single" w:sz="8" w:space="0" w:color="{border}"/>
      <w:right w:val="single" w:sz="8" w:space="0" w:color="{border}"/>
      <w:insideH w:val="nil"/>
      <w:insideV w:val="nil"/>
    </w:tblBorders>
    <w:tblCellMar>
      <w:top w:w="80" w:type="dxa"/>
      <w:left w:w="120" w:type="dxa"/>
      <w:bottom w:w="80" w:type="dxa"/>
      <w:right w:w="120" w:type="dxa"/>
    </w:tblCellMar>
  </w:tblPr>
  <w:tr>
    <w:trPr><w:trHeight w:val="{height}" w:hRule="atLeast"/></w:trPr>
    <w:tc><w:tcPr><w:tcW w:w="9360" w:type="dxa"/></w:tcPr>{inner}</w:tc>
  </w:tr>
</w:tbl>
"""


def two_column_knowns(items):
    rows = []
    for i in range(0, len(items), 2):
        left = items[i]
        right = items[i + 1] if i + 1 < len(items) else ""
        rows.append(f"""
  <w:tr>
    <w:tc><w:tcPr><w:tcW w:w="4680" w:type="dxa"/></w:tcPr>{paragraph(left, after=40)}</w:tc>
    <w:tc><w:tcPr><w:tcW w:w="4680" w:type="dxa"/></w:tcPr>{paragraph(right, after=40)}</w:tc>
  </w:tr>
""")
    return f"""
<w:tbl>
  <w:tblPr>
    <w:tblW w:w="0" w:type="auto"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="4" w:space="0" w:color="D6DEE6"/>
      <w:left w:val="single" w:sz="4" w:space="0" w:color="D6DEE6"/>
      <w:bottom w:val="single" w:sz="4" w:space="0" w:color="D6DEE6"/>
      <w:right w:val="single" w:sz="4" w:space="0" w:color="D6DEE6"/>
      <w:insideH w:val="single" w:sz="4" w:space="0" w:color="D6DEE6"/>
      <w:insideV w:val="single" w:sz="4" w:space="0" w:color="D6DEE6"/>
    </w:tblBorders>
  </w:tblPr>
  {''.join(rows)}
</w:tbl>
"""


def summary_table():
    rows = []
    for title in ["Mirror Gate", "Glass Bend", "Diamond Switchback", "Glass Relay", "Prism Gauntlet"]:
        rows.append(table_row([title, "________", "________", "__________________________________"], widths=[2600, 1600, 1600, 3760]))
    return f"""
<w:tbl>
  <w:tblPr>
    <w:tblW w:w="0" w:type="auto"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="8" w:space="0" w:color="8FA9C2"/>
      <w:left w:val="single" w:sz="8" w:space="0" w:color="8FA9C2"/>
      <w:bottom w:val="single" w:sz="8" w:space="0" w:color="8FA9C2"/>
      <w:right w:val="single" w:sz="8" w:space="0" w:color="8FA9C2"/>
      <w:insideH w:val="single" w:sz="6" w:space="0" w:color="D6DEE6"/>
      <w:insideV w:val="single" w:sz="6" w:space="0" w:color="D6DEE6"/>
    </w:tblBorders>
  </w:tblPr>
  {table_row(["Level", "Attempts", "Payout %", "Notes"], header=True, widths=[2600, 1600, 1600, 3760])}
  {''.join(rows)}
</w:tbl>
"""


def table_row(cells, header=False, widths=None):
    widths = widths or [9360 // len(cells)] * len(cells)
    tcs = []
    for cell, width in zip(cells, widths):
        fill = '<w:shd w:val="clear" w:color="auto" w:fill="EEF4F8"/>' if header else ""
        rpr = "<w:rPr><w:b/></w:rPr>" if header else ""
        tcs.append(
            f'<w:tc><w:tcPr><w:tcW w:w="{width}" w:type="dxa"/>{fill}</w:tcPr>'
            f'<w:p><w:pPr><w:spacing w:before="40" w:after="40"/></w:pPr><w:r>{rpr}<w:t xml:space="preserve">{escape(cell)}</w:t></w:r></w:p></w:tc>'
        )
    return f"<w:tr>{''.join(tcs)}</w:tr>"


def level_section(level):
    parts = [
        paragraph("", after=10),
        label_box(level["title"], fill=level["fill"], border=level["border"]),
        two_column_knowns(level["knowns"]),
        paragraph("Sketch and calculations:", bold=True, before=80, after=40),
        boxed_area(level["work_lines"], border=level["border"]),
        paragraph("After testing:", bold=True, before=80, after=40),
        two_column_knowns([
            "Attempt number for successful hit: __________",
            "Points earned: __________",
            "Correction or note: ________________________________________________",
        ]),
    ]
    return "".join(parts)


def build_body():
    parts = [
        paragraph("AP Physics 2 Optics", style="Heading1", after=80),
        paragraph("Ray Quest Prediction Worksheet", style="Heading3", after=140),
        student_info_box(),
        paragraph("", after=60),
        label_box("Goal", fill="F3E7C9", border="B7A16C"),
        paragraph("Use ray diagrams, the law of reflection, and Snell's law to predict where the beam will cross the fixed receiver line before testing in the game."),
        label_box("Conventions and Equations", fill="E6F1EE", border="84A9A1"),
        paragraph("Angles in the game are measured from +x. Positive rotation is counterclockwise. Grid coordinates use +x to the right and +y upward."),
        paragraph("In Snell's law, angles are measured from the normal."),
        paragraph("Reflection: theta_i = theta_r", bullet=True, after=60),
        paragraph("Refraction: n_1 sin(theta_1) = n_2 sin(theta_2)", bullet=True, after=90),
    ]
    for level in LEVELS:
        parts.append(level_section(level))
    parts.extend([
        paragraph("", after=10),
        label_box("Mission Accomplished Summary", fill="E7EFF7", border="8FA9C2"),
        paragraph("Record the results from the final summary screen."),
        two_column_knowns([
            "Final score: ____________________",
            "Total attempts: ____________________",
            "First-try hits: ________ / 5",
        ]),
        paragraph("Level results:", bold=True, before=100, after=40),
        summary_table(),
        paragraph("Reflection:", bold=True, before=120, after=40),
        paragraph("Which level required the most correction after testing? Why?"),
        boxed_area(2, border="8FA9C2"),
        paragraph("What was your most common source of error?"),
        boxed_area(2, border="8FA9C2"),
        paragraph("What strategy helped you make a better prediction?"),
        boxed_area(2, border="8FA9C2"),
        '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>',
    ])
    return "".join(parts)


def write_docx(out_path: Path, title: str, body: str):
    document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
 xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
 xmlns:v="urn:schemas-microsoft-com:vml"
 xmlns:wp14="http://schemas.microsoft.com/office/2010/wordprocessingDrawing"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:w10="urn:schemas-microsoft-com:office:word"
 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
 xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
 xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
 xmlns:wne="http://schemas.microsoft.com/office/2006/wordml"
 xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
 mc:Ignorable="w14 wp14">
  <w:body>{body}</w:body>
</w:document>
"""
    with ZipFile(out_path, "w", ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", CONTENT_TYPES)
        zf.writestr("_rels/.rels", RELS)
        zf.writestr("docProps/app.xml", APP_XML)
        zf.writestr("docProps/core.xml", core_xml(title))
        zf.writestr("word/document.xml", document_xml)
        zf.writestr("word/styles.xml", STYLES_XML)


def main():
    write_docx(OUT_DOCX, "Ray Quest Prediction Worksheet", build_body())
    print(f"Wrote {OUT_DOCX}")


if __name__ == "__main__":
    main()
