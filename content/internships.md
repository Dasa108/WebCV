# Internship Experience

## Verify The Vector
[cite_start]**Role:** Intern, Emergence AI [cite: 1054, 1091]
[cite_start]**Timeline:** May 2026 - July 2026 [cite: 1053, 1092]
[cite_start]**Supervisor:** Prof. Siddhartha Gadgil [cite: 1054, 1093]

* [cite_start]Co-developed a formally verified system using the Lean 4 proof assistant to automatically check the structural correctness of claims made about Scalable Vector Graphics (SVG)[cite: 566, 569, 1094].
* [cite_start]Designed a restricted SVG dialect that constrains geometry to exact integer coordinates and mandates unique element identifiers, moving verification away from approximate vision models toward exhaustively decidable logic[cite: 596, 692, 696].
* [cite_start]Implemented a custom parser combinator in Lean 4 to accurately convert raw SVG markup strings into a strongly typed document model[cite: 681, 726].
* [cite_start]Programmed a comprehensive suite of geometric and logical predicates—including intersection, containment, parallelism, area calculations, and chart-specific semantics (like pie-chart slice proportions)—as decidable propositions over integer arithmetic[cite: 570, 608].
* [cite_start]Built a structured JSON claim schema utilizing logical combinators (all, any, not) to decompose complex natural language descriptions into atomic, machine-checkable components[cite: 571, 680, 714].
* [cite_start]Integrated a multimodal LLM (Gemini) into the pipeline to automatically reconstruct raster images (PNG/JPEG) into dialect-conformant SVGs and translate natural language claims into the required JSON schema[cite: 568, 642, 643].
* [cite_start]Enabled the system to reliably output definite PASS, FAIL, or ERROR verdicts for each claim based strictly on the SVG's structural ground truth[cite: 570, 683, 799].