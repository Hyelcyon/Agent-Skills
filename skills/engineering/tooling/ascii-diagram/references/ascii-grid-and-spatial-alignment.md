# 2D Grid Theory & Spatial Alignment Architecture

This reference defines the spatial coordinate mathematics, boundary constraints, and routing rules necessary for generating deterministic, distortion-free ASCII and Unicode text diagrams.

---

## 1. The Monospace 2D Coordinate Canvas

Text-based diagrams render within a discrete two-dimensional Cartesian plane:

$$\text{Canvas}[y][x] \quad \text{where} \quad 0 \le x < W_{\text{canvas}}, \quad 0 \le y < H_{\text{canvas}}$$

- **The Column Invariant ($x$)**: Every character cell represents a discrete horizontal slot.
- **The Line Invariant ($y$)**: Every line represents a discrete vertical row.
- **The Zero-Tab Law**: Tab characters (`\t`) evaluate to variable column widths (2, 4, or 8 spaces) depending on viewer software, terminal emulators, or Markdown previewers. **Tab characters are strictly prohibited in all diagram buffers.** All horizontal offsets must consist exclusively of standard ASCII space characters (`U+0020`).

---

## 2. Box Geometry and Padding Mathematics

Every structural node is bounded by an outer box with width $W_{\text{box}}$ and inner usable width $W_{\text{inner}}$:

$$W_{\text{inner}} = W_{\text{box}} - 2$$

When embedding a label of display width $W_{\text{label}}$ within a box:

1. **Safety Boundary**:
   $$W_{\text{label}} \le W_{\text{inner}}$$
2. **Left and Right Padding Calculation**:
   For center alignment:
   $$P_{\text{left}} = \lfloor \frac{W_{\text{inner}} - W_{\text{label}}}{2} \rfloor$$
   $$P_{\text{right}} = W_{\text{inner}} - W_{\text{label}} - P_{\text{left}}$$
3. **Line Composition**:
   $$\text{Line}_{\text{label}} = \text{Border}_{\text{left}} + \text{Space}(P_{\text{left}}) + \text{Label} + \text{Space}(P_{\text{right}}) + \text{Border}_{\text{right}}$$

If $P_{\text{right}}$ is calculated by raw string length instead of display width, East Asian or multibyte characters will displace $\text{Border}_{\text{right}}$, corrupting the rectangular geometry.

---

## 3. Connector Routing and Branch Congruence

Connecting nodes requires strict vertical column and horizontal row congruence:

### Vertical Connection Congruence
When routing a vertical connector from Node A (at $y_A$) to Node B (at $y_B$):
1. Compute center column $X_c$:
   $$X_c = X_{\text{box\_start}} + \lfloor \frac{W_{\text{box}}}{2} \rfloor$$
2. Maintain identical column $X_c$ across all intermediate connector rows:
   ```text
   +-------------+
   |   Node A    |
   +------+------+  <-- Junction at column X_c
          |         <-- Must remain exactly at column X_c
          v         <-- Must remain exactly at column X_c
   +------+------+
   |   Node B    |
   +-------------+
   ```
   A deviation of even 1 column transforms a straight pipeline into a staggered, broken path.

### Horizontal Routing and Bends
When routing right-angle turns, use matching corner glyphs and keep line row indices invariant:

```text
+----------+      +----------+
|  Node A  |----->|  Node B  |
+----+-----+      +----------+
     |
     +------------>+----------+
                   |  Node C  |
                   +----------+
```

Corner junction pairs:
- Upper-left corner: `┌` or `+`
- Upper-right corner: `┐` or `+`
- Lower-left corner: `└` or `+`
- Lower-right corner: `┘` or `+`
- T-junction down: `┬`
- T-junction up: `┴`
- T-junction right: `├`
- T-junction left: `┤`
- 4-way intersection: `┼`

---

## 4. Multi-Column Parallel Node Alignment

When displaying parallel architectural tiers (e.g. Microservices, Worker Pools, Database Replicas):

1. **Calculate Fixed Column Width**: Ensure all parallel sibling boxes share identical width $W_{\text{sibling}}$ or align to defined grid columns.
2. **Uniform Gutter Spacing**: Maintain constant horizontal gap $G$ between adjacent columns:
   $$X_{\text{col}, k+1} = X_{\text{col}, k} + W_{\text{box}, k} + G$$
3. **Synchronous Row Heights**: Keep box top borders and bottom borders on identical $y$ rows across parallel siblings to prevent jagged layouts.
