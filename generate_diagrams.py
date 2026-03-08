"""Generate 3 PNG diagrams for the Eigenvectors presentation."""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyArrowPatch
import numpy as np
import os

OUT = os.path.join(os.path.dirname(__file__), 'diagrams')
os.makedirs(OUT, exist_ok=True)

# Colors matching the presentation palette
BLUE = '#5B8CFA'
VIOLET = '#A78BFA'
GOLD = '#F6C90E'
WHITE = '#E8E8F0'
DARK = '#0D0D1A'
GREY = '#9090B0'


def diagram_normal_modes():
    """Two coupled pendulums showing Mode 1 and Mode 2."""
    fig, axes = plt.subplots(1, 2, figsize=(9, 5), facecolor='none')
    fig.patch.set_alpha(0)

    for ax in axes:
        ax.set_facecolor('none')
        ax.set_xlim(-2.5, 2.5)
        ax.set_ylim(-3.5, 1.5)
        ax.set_aspect('equal')
        ax.axis('off')

    def draw_pendulum(ax, x_pivot, bob_offset_x, bob_offset_y, arrow_dx, arrow_dy):
        """Draw a single pendulum with pivot, rod, bob, and motion arrow."""
        bob_x = x_pivot + bob_offset_x
        bob_y = bob_offset_y
        # Rod
        ax.plot([x_pivot, bob_x], [1.0, bob_y], color=WHITE, lw=2, solid_capstyle='round')
        # Pivot triangle
        pivot_size = 0.12
        triangle = plt.Polygon([
            [x_pivot - pivot_size, 1.0 + pivot_size * 1.5],
            [x_pivot + pivot_size, 1.0 + pivot_size * 1.5],
            [x_pivot, 1.0]
        ], closed=True, facecolor=GREY, edgecolor=WHITE, lw=1.5)
        ax.add_patch(triangle)
        # Bob
        circle = plt.Circle((bob_x, bob_y), 0.22, facecolor=BLUE, edgecolor=WHITE, lw=2)
        ax.add_patch(circle)
        # Motion arrow
        if abs(arrow_dx) > 0 or abs(arrow_dy) > 0:
            ax.annotate('', xy=(bob_x + arrow_dx, bob_y + arrow_dy),
                        xytext=(bob_x, bob_y),
                        arrowprops=dict(arrowstyle='->', color=GOLD, lw=2.5))

    def draw_spring(ax, x1, y1, x2, y2, n_coils=8):
        """Draw a zigzag spring between two points."""
        length = np.sqrt((x2 - x1)**2 + (y2 - y1)**2)
        t = np.linspace(0, 1, n_coils * 4 + 1)
        # Spring along x axis then rotate
        sx = t * length
        sy = np.zeros_like(t)
        for i in range(len(t)):
            phase = i % 4
            if phase == 1:
                sy[i] = 0.12
            elif phase == 3:
                sy[i] = -0.12
        # Straight end segments
        sx[0] = 0
        sy[0] = 0
        sx[-1] = length
        sy[-1] = 0
        # Rotate and translate
        angle = np.arctan2(y2 - y1, x2 - x1)
        rx = sx * np.cos(angle) - sy * np.sin(angle) + x1
        ry = sx * np.sin(angle) + sy * np.cos(angle) + y1
        ax.plot(rx, ry, color=VIOLET, lw=1.8)

    # Mode 1: In-phase
    ax1 = axes[0]
    ax1.set_title('Mode 1: ω₁', color=BLUE, fontsize=18, fontweight='bold', pad=10, fontfamily='sans-serif')
    draw_pendulum(ax1, -1.0, 0.3, -1.5, 0.6, 0)
    draw_pendulum(ax1, 1.0, 0.3, -1.5, 0.6, 0)
    draw_spring(ax1, -1.0 + 0.3 + 0.22, -1.5, 1.0 + 0.3 - 0.22, -1.5)
    ax1.text(0, -2.8, 'In-phase\nSpring unstretched', color=WHITE, fontsize=12,
             ha='center', va='center', fontfamily='sans-serif')

    # Mode 2: Out-of-phase
    ax2 = axes[1]
    ax2.set_title('Mode 2: ω₂', color=VIOLET, fontsize=18, fontweight='bold', pad=10, fontfamily='sans-serif')
    draw_pendulum(ax2, -1.0, 0.3, -1.5, 0.6, 0)
    draw_pendulum(ax2, 1.0, -0.3, -1.5, -0.6, 0)
    draw_spring(ax2, -1.0 + 0.3 + 0.22, -1.5, 1.0 - 0.3 - 0.22, -1.5)
    ax2.text(0, -2.8, 'Out-of-phase\nSpring fully engaged', color=WHITE, fontsize=12,
             ha='center', va='center', fontfamily='sans-serif')

    # Ceiling line
    for ax in axes:
        ax.plot([-2.0, 2.0], [1.0 + 0.12 * 1.5, 1.0 + 0.12 * 1.5], color=GREY, lw=1.5, linestyle='--')

    plt.tight_layout(pad=1.0)
    fig.savefig(os.path.join(OUT, 'diagram_normal_modes.png'), dpi=200,
                transparent=True, bbox_inches='tight')
    plt.close()
    print("  ✓ Normal modes diagram")


def diagram_phase_portraits():
    """2x3 grid of phase portraits with eigenvalue conditions."""
    fig, axes = plt.subplots(2, 3, figsize=(11, 7.5), facecolor='none')
    fig.patch.set_alpha(0)

    configs = [
        ('Stable Node', 'λ₁, λ₂ < 0', 'node', 'stable'),
        ('Unstable Node', 'λ₁, λ₂ > 0', 'node', 'unstable'),
        ('Saddle Point', 'λ₁ < 0 < λ₂', 'saddle', None),
        ('Stable Spiral', 'Re(λ) < 0', 'spiral', 'stable'),
        ('Unstable Spiral', 'Re(λ) > 0', 'spiral', 'unstable'),
        ('Centre', 'Re(λ) = 0', 'centre', None),
    ]

    for idx, (title, condition, ptype, stability) in enumerate(configs):
        row, col = divmod(idx, 3)
        ax = axes[row, col]
        ax.set_facecolor('none')
        ax.set_xlim(-2, 2)
        ax.set_ylim(-2, 2)
        ax.set_aspect('equal')
        ax.spines['left'].set_color(GREY)
        ax.spines['bottom'].set_color(GREY)
        ax.spines['right'].set_visible(False)
        ax.spines['top'].set_visible(False)
        ax.spines['left'].set_linewidth(0.5)
        ax.spines['bottom'].set_linewidth(0.5)
        ax.spines['left'].set_position('center')
        ax.spines['bottom'].set_position('center')
        ax.set_xticks([])
        ax.set_yticks([])

        t = np.linspace(0, 2 * np.pi, 200)
        color = BLUE if stability == 'stable' or ptype == 'centre' else VIOLET if stability == 'unstable' else GOLD

        if ptype == 'node':
            for angle in np.linspace(0, 2 * np.pi, 12, endpoint=False):
                s = np.linspace(0.15, 1.7, 50)
                if stability == 'stable':
                    s = s[::-1]
                x = s * np.cos(angle) + 0.15 * s * np.sin(angle * 2)
                y = s * np.sin(angle) + 0.1 * s * np.cos(angle * 3)
                ax.plot(x, y, color=color, lw=0.9, alpha=0.8)
                # Arrow at end
                if stability == 'stable':
                    ax.annotate('', xy=(x[-1], y[-1]), xytext=(x[-3], y[-3]),
                                arrowprops=dict(arrowstyle='->', color=color, lw=1.2))
                else:
                    ax.annotate('', xy=(x[-1], y[-1]), xytext=(x[-3], y[-3]),
                                arrowprops=dict(arrowstyle='->', color=color, lw=1.2))

        elif ptype == 'saddle':
            for sign_x in [-1, 1]:
                for sign_y in [-1, 1]:
                    s = np.linspace(0.1, 1.7, 50)
                    x = sign_x * s
                    y = sign_y * 0.3 / (s + 0.1)
                    ax.plot(x, y, color=GOLD, lw=0.9, alpha=0.8)
                    ax.annotate('', xy=(x[-1], y[-1]), xytext=(x[-3], y[-3]),
                                arrowprops=dict(arrowstyle='->', color=GOLD, lw=1.2))
                    # Perpendicular
                    x2 = sign_x * 0.3 / (s + 0.1)
                    y2 = sign_y * s
                    ax.plot(x2, y2, color=GOLD, lw=0.9, alpha=0.8)
                    ax.annotate('', xy=(x2[0], y2[0]), xytext=(x2[2], y2[2]),
                                arrowprops=dict(arrowstyle='->', color=GOLD, lw=1.2))

        elif ptype == 'spiral':
            s = np.linspace(0.2, 4 * np.pi, 300)
            if stability == 'stable':
                r = 1.7 * np.exp(-s / (4 * np.pi)) + 0.02
            else:
                r = 0.1 + 1.6 * (1 - np.exp(-s / (4 * np.pi)))
            x = r * np.cos(s)
            y = r * np.sin(s)
            ax.plot(x, y, color=color, lw=1.0, alpha=0.85)
            ax.annotate('', xy=(x[-1], y[-1]), xytext=(x[-3], y[-3]),
                        arrowprops=dict(arrowstyle='->', color=color, lw=1.5))

        elif ptype == 'centre':
            for r_val in [0.4, 0.8, 1.2, 1.6]:
                x = r_val * np.cos(t)
                y = r_val * np.sin(t)
                ax.plot(x, y, color=BLUE, lw=0.9, alpha=0.7)
                # Arrow on each orbit
                idx_arrow = len(t) // 4
                ax.annotate('', xy=(x[idx_arrow], y[idx_arrow]),
                            xytext=(x[idx_arrow - 2], y[idx_arrow - 2]),
                            arrowprops=dict(arrowstyle='->', color=BLUE, lw=1.2))

        # Origin dot
        ax.plot(0, 0, 'o', color=WHITE, markersize=4, zorder=5)

        ax.set_title(title, color=WHITE, fontsize=13, fontweight='bold', pad=8, fontfamily='sans-serif')
        ax.text(0, -1.85, condition, color=color, fontsize=11, ha='center',
                fontfamily='sans-serif', fontweight='bold')

    plt.tight_layout(pad=1.5)
    fig.savefig(os.path.join(OUT, 'diagram_phase_portraits.png'), dpi=200,
                transparent=True, bbox_inches='tight')
    plt.close()
    print("  ✓ Phase portraits diagram")


def diagram_pagerank():
    """Directed graph with 5 nodes showing PageRank concept."""
    fig, ax = plt.subplots(1, 1, figsize=(7, 5.5), facecolor='none')
    fig.patch.set_alpha(0)
    ax.set_facecolor('none')
    ax.set_xlim(-3, 3)
    ax.set_ylim(-2.5, 2.5)
    ax.set_aspect('equal')
    ax.axis('off')

    # Node positions and sizes (PageRank)
    nodes = {
        'A': (0, 1.5, 0.45, BLUE),
        'B': (-1.8, 0.3, 0.35, VIOLET),
        'C': (1.8, 0.3, 0.38, BLUE),
        'D': (-1.1, -1.5, 0.28, VIOLET),
        'E': (1.1, -1.5, 0.32, BLUE),
    }

    # Edges (from -> to)
    edges = [
        ('B', 'A'), ('C', 'A'), ('D', 'B'), ('E', 'C'),
        ('A', 'C'), ('B', 'D'), ('C', 'E'), ('D', 'E'),
        ('E', 'A'),
    ]

    # Draw edges first
    for src, dst in edges:
        sx, sy, sr, _ = nodes[src]
        dx, dy, dr, _ = nodes[dst]
        # Calculate start/end points on circle edges
        angle = np.arctan2(dy - sy, dx - sx)
        x1 = sx + sr * np.cos(angle) * 1.15
        y1 = sy + sr * np.sin(angle) * 1.15
        x2 = dx - dr * np.cos(angle) * 1.15
        y2 = dy - dr * np.sin(angle) * 1.15
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle='->', color=GREY, lw=1.5,
                                    connectionstyle='arc3,rad=0.15'))

    # Draw nodes
    for label, (x, y, r, color) in nodes.items():
        circle = plt.Circle((x, y), r, facecolor=color, edgecolor=WHITE,
                             lw=2, alpha=0.9, zorder=10)
        ax.add_patch(circle)
        ax.text(x, y, label, color=WHITE, fontsize=16, fontweight='bold',
                ha='center', va='center', zorder=11, fontfamily='sans-serif')

    # Label
    ax.text(0, -2.3, 'v₁  →  rank', color=GOLD, fontsize=18, fontweight='bold',
            ha='center', fontfamily='sans-serif')
    ax.text(0, 2.3, 'Dominant eigenvector determines node importance',
            color=WHITE, fontsize=11, ha='center', fontfamily='sans-serif', style='italic')

    fig.savefig(os.path.join(OUT, 'diagram_pagerank.png'), dpi=200,
                transparent=True, bbox_inches='tight')
    plt.close()
    print("  ✓ PageRank diagram")


if __name__ == '__main__':
    print("Generating diagrams...")
    diagram_normal_modes()
    diagram_phase_portraits()
    diagram_pagerank()
    print("All diagrams saved to:", OUT)
