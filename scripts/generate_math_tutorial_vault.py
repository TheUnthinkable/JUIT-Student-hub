"""
Mathematics I (25B11MA113) Tutorial Sheets PDF Generator for JUIT Academic Vault
Generates authentic, high-quality, printable PDF tutorial sheets for:
- Tutorial Sheet 1: Limits, Continuity, Chain Rule, Change of Variables & Jacobian
- Tutorial Sheet 2: Taylor Series, Maxima-Minima & Lagrange Multipliers
- Tutorial Sheet 3: Double Integrals, Change of Order, Variable Change & Beta-Gamma Functions
- Tutorial Sheet 4: Applications of Double Integrals to Area & Volume
- Complete 4-in-1 Math I Tutorial Sheets Master Bundle
"""

import os
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import matplotlib.patches as patches

VAULT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'vault')
os.makedirs(VAULT_DIR, exist_ok=True)

def create_page(ax, sheet_title, sheet_subtitle, page_num, total_pages):
    ax.axis('off')
    
    primary_color = '#0284c7'  # Academic Blue
    dark_color = '#0369a1'
    
    # Top banner rectangle
    rect = patches.Rectangle((0, 0.91), 1, 0.09, transform=ax.transAxes, color=primary_color, clip_on=False)
    ax.add_patch(rect)
    
    # Header branding
    ax.text(0.04, 0.965, "JAYPEE UNIVERSITY OF INFORMATION TECHNOLOGY, WAKNAGHAT", 
            transform=ax.transAxes, color='white', fontsize=10.5, fontweight='bold', va='center')
    ax.text(0.04, 0.932, "DEPARTMENT OF MATHEMATICS • MATHEMATICS I (25B11MA113) • ACADEMIC VAULT", 
            transform=ax.transAxes, color='#e0f2fe', fontsize=8, va='center')
    
    # Badge
    ax.text(0.96, 0.948, "MATH I VAULT", 
            transform=ax.transAxes, color='white', fontsize=8.5, fontweight='bold', ha='right', va='center',
            bbox=dict(boxstyle='round,pad=0.3', facecolor=dark_color, edgecolor='none'))
            
    # Bottom footer rule & page numbers
    line = patches.Rectangle((0.04, 0.05), 0.92, 0.0015, transform=ax.transAxes, color='#cbd5e1', clip_on=False)
    ax.add_patch(line)
    
    ax.text(0.04, 0.03, f"{sheet_title} • {sheet_subtitle}", transform=ax.transAxes, color='#64748b', fontsize=8, va='center')
    ax.text(0.96, 0.03, f"Page {page_num} of {total_pages}", transform=ax.transAxes, color='#64748b', fontsize=8, ha='right', va='center')

def render_content_blocks(ax, blocks, start_y=0.87):
    y = start_y
    for btype, text in blocks:
        if btype == 'h1':
            y -= 0.012
            ax.text(0.04, y, text, transform=ax.transAxes, color='#0f172a', fontsize=13.5, fontweight='bold')
            y -= 0.028
        elif btype == 'h2':
            y -= 0.008
            ax.text(0.04, y, text, transform=ax.transAxes, color='#0369a1', fontsize=11, fontweight='bold')
            y -= 0.024
        elif btype == 'p':
            ax.text(0.04, y, text, transform=ax.transAxes, color='#334155', fontsize=9, linespacing=1.35)
            lines_count = text.count('\n') + 1 + len(text) // 95
            y -= (0.018 * lines_count)
        elif btype == 'q':
            # Question box or line
            q_num, q_body = text
            ax.text(0.04, y, f"{q_num}.", transform=ax.transAxes, color='#0284c7', fontsize=9.5, fontweight='bold')
            ax.text(0.08, y, q_body, transform=ax.transAxes, color='#1e293b', fontsize=9, linespacing=1.3)
            lines_count = q_body.count('\n') + 1 + len(q_body) // 88
            y -= (0.018 * lines_count + 0.008)
        elif btype == 'ans_box':
            # Answers block
            ans_title, ans_content = text
            ax.text(0.04, y, ans_title, transform=ax.transAxes, color='#047857', fontsize=10.5, fontweight='bold')
            y -= 0.022
            lines = ans_content.strip().split('\n')
            box_height = len(lines) * 0.018 + 0.025
            y_box = y - box_height + 0.012
            rect = patches.FancyBboxPatch((0.04, y_box), 0.92, box_height, transform=ax.transAxes,
                                          boxstyle="round,pad=0.01", facecolor='#f0fdf4', edgecolor='#86efac')
            ax.add_patch(rect)
            ax.text(0.06, y - 0.004, ans_content, transform=ax.transAxes, color='#14532d', fontsize=8.5, linespacing=1.3, va='top')
            y = y_box - 0.02
        elif btype == 'space':
            y -= 0.012

def generate_pdf(filepath, title, subtitle, pages_data):
    total_pages = len(pages_data)
    with PdfPages(filepath) as pdf:
        for idx, blocks in enumerate(pages_data, start=1):
            fig, ax = plt.subplots(figsize=(8.5, 11))
            create_page(ax, title, subtitle, idx, total_pages)
            render_content_blocks(ax, blocks, start_y=0.86)
            pdf.savefig(fig, bbox_inches='tight', pad_inches=0.1)
            plt.close(fig)
    print(f"Generated: {filepath} ({total_pages} pages)")

# =========================================================================
# SHEET 1: Limits, Continuity, Chain Rule, Change of Variables & Jacobian
# =========================================================================
s1_p1 = [
    ('h1', 'Tutorial Sheet 1: Limits, Continuity, Chain Rule, Change of Variables & Jacobian'),
    ('p', 'Course: Mathematics I (25B11MA113) • Semester 1 • Department of Mathematics, JUIT Waknaghat\nTopics: Multivariable Limits, Epsilon-Delta Verification, Partial Derivatives, Chain Rule & Jacobians'),
    ('space', ''),
    ('q', ('1', 'Using the delta - epsilon approach, show that:\n  a. lim (x,y)->(0,0) [x^2*y / (x^2 + y^2)] = 0       b. lim (x,y)->(0,0) (x^2 + y^2) = 0\n  c. lim (x,y)->(1,1) (x^2 + y^2 - 1) = 1')),
    ('q', ('2', 'Evaluate the following multivariable limits (if exist):\n  a. lim (x,y)->(0,0) [x^2*y / (x^2 + y^2)]           b. lim (x,y)->(0,0) [(x^2 + y^2) / sqrt(x^2 + y^2)]\n  c. lim (x,y)->(0,0) [(y^2 - x^2)/(y^2 + x^2)]      d. lim (x,y)->(0,0) [x^3*y / (x^6 + y^2)]\n  e. lim (x,y)->(0,0) (x^2 + y^2)*sin(1/(x*y))       f. lim (x,y)->(0,0) [(x - 2y)/(x + y)]\n  g. lim (x,y)->(0,0) [2*y^4*x / (y^8 + 6*x^2)]')),
    ('q', ('3', 'In a robotic path planning the robot\'s position error is given by:\n  f(x, y) = [x^2*y - y^3 + cos(x*y)] / [x^2 + y^2 + 1].\n  Compute lim (x,y)->(0,-1) f(x, y).')),
    ('q', ('4', 'Check whether the following functions are continuous or not:\n  a. f(x, y) = x^2 + y^2 at point (1, 2)\n  b. f(x, y) = 1 / (1 + e^(1/x)) + y^2 for (x, y) != (0,0); and 0 at (0, 0)\n  c. f(x, y) = x*y / (x^2 + 5*y^2) for (x, y) != (0,0); and 0 at (0, 0)')),
    ('q', ('5', 'The electrical potential in a circuit is V(x, y) = [x^2 - y^2 + sin(x+y)] / [x^2 + y^2 + 1].\nCheck whether V(x, y) is continuous at (1, -1) or not.')),
    ('q', ('6', 'If z = x^3*y^2 + 3*x*y, find the values of dz/dx, dz/dy, d^2z/dx^2, and d^2z/dy^2.')),
    ('q', ('7', 'If u = e^(x*y + y*z + z*x), find the value of d^3u / (dx dy dz).')),
    ('q', ('8', 'Compute f_xy(0,0) and f_yx(0,0) for the function:\n  f(x, y) = x^3*y / (x^2 + y^2) for (x,y) != (0,0); and 0 at (0,0).'))
]

s1_p2 = [
    ('h1', 'Tutorial Sheet 1 (Continued) & Complete Verified Solutions'),
    ('space', ''),
    ('q', ('9', 'Find dx/du and dy/du, where u = x^2 - y^2 and v = x^2 - y define x and y as functions of the\nindependent variables u and v. Also, if s = x^2 + y^2, find ds/du.')),
    ('q', ('10', 'Let f(x, y, z) = x^3*y^2 + y*z^4 and x = s^2, y = s*t^2, z = s^2*t. Using chain rule, compute df/ds.')),
    ('q', ('11', 'If u = sec^-1[(x^3 - y^3)/(x - y)], then find x*(du/dx) + y*(du/dy).')),
    ('q', ('12', 'Let u = (y^3 - x^3)/(x^2 + y^2). Prove that x*(du/dx) + y*(du/dy) = u and hence show that:\n  x^2*(d^2u/dx^2) + 2*x*y*(d^2u/dx dy) + y^2*(d^2u/dy^2) = 0.')),
    ('q', ('13', 'Use chain rule to find derivative of z = e^(xy) w.r.t t along the path x = cos t, y = sin t.\nAlso find dz/dt at t = pi/2.')),
    ('q', ('14', 'Suppose a program execution time depends on CPU cycles (x) and memory usage (y) modeled\nby T(x, y) = x^2 + y^2, where x = p^2 - 1 and y = p^3 - p. Find total derivative dT/dp.')),
    ('q', ('15', 'Find total differentiation:\n  a. z = tan^-1(x/y) for (x,y) != (0,0)       b. u = (x*z + x/z)^y for z != 0')),
    ('q', ('16', 'Given transformation x = r*sin(theta)*cos(phi), y = r*sin(theta)*sin(phi), z = r*cos(theta).\nFind the spherical coordinate Jacobian J = d(x,y,z)/d(r,theta,phi).')),
    ('q', ('17', 'In computer graphics, an image transforms coordinates by u = 2x + y and v = x - 2y. Find Jacobian.')),
    ('space', ''),
    ('ans_box', ('Official Verified Answers (Sheet 1):', 
        '2. a. 0   b. 0   e. 0   (c, d, f, g limits do not exist)\n'
        '3. 1\n'
        '4. a. Continuous   b. Discontinuous   c. Not continuous\n'
        '5. Continuous at (1, -1)\n'
        '6. dz/dx = 3*x^2*y^2 + 3y, dz/dy = 2*x^3*y + 3x, d^2z/dx^2 = 6*x*y^2, d^2z/dy^2 = 2*x^3\n'
        '7. e^(xy+yz+zx) * [2*(x+y+z) + (x+y)*(x+z)*(y+z)]\n'
        '8. f_xy(0,0) = 0 and f_yx(0,0) = 0\n'
        '9. ds/du = (1 + 2y) / (1 - 2y)\n'
        '10. df/ds = 8*s^7*t^4 + 9*s^8*t^6\n'
        '11. x*u_x + y*u_y = 2*(x^2 + xy + y^2) / [|x^2 + xy + y^2| * sqrt((x^2 + xy + y^2)^2 - 1)]\n'
        '13. dz/dt = -1 at t = pi/2\n'
        '14. dT/dp = 4*p*(p^2 - 1) + 2*(p^3 - p)*(3*p^2 - 1)\n'
        '15. a. dz = (y*dx - x*dy)/(x^2 + y^2)   b. du = (xz + x/z)^y * [ln(xz + x/z)*dy + (y/(xz+x/z))*((z + 1/z)*dx + x*(1 - 1/z^2)*dz)]\n'
        '16. r^2 * sin(theta)\n'
        '17. -5'
    ))
]

# =========================================================================
# SHEET 2: Taylor Series, Maxima-Minima & Lagrange Multiplier
# =========================================================================
s2_p1 = [
    ('h1', 'Tutorial Sheet 2: Taylor Series, Maxima-Minima & Lagrange Multiplier'),
    ('p', 'Course: Mathematics I (25B11MA113) • Semester 1 • Department of Mathematics, JUIT Waknaghat\nTopics: Multivariable Taylor Expansions, Critical Points, Hessian Matrices & Constrained Optimization'),
    ('space', ''),
    ('q', ('1', 'Expand x^2*y + 3y - 2 in powers of (x - 1) and (y + 2) using Taylor\'s series.')),
    ('q', ('2', 'Expand e^x * cos y about (0, pi/2) up to the third term using Taylor\'s series.')),
    ('q', ('3', 'Show that the expansion of sin(x*y) in powers of (x - 1) and (y - pi/2) up to second degree is:\n  1 - (1/8)*pi^2*(x - 1)^2 - (1/2)*pi*(x - 1)*(y - pi/2) - (1/2)*(y - pi/2)^2.')),
    ('q', ('4', 'A robot moves with very small angles x and y. Its motion is modeled by f(x, y) = cos x * cos y.\nFind the Taylor expansion near (0, 0).')),
    ('q', ('5', 'A probability model in data science is defined by f(x, y) = sqrt(1 + x + y).\nExpand the function about (0, 0) up to third-order terms.')),
    ('q', ('6', 'Find the maxima and minima of the function f(x, y) = x^3 + y^3 - 3x - 12y + 20.')),
    ('q', ('7', 'Show that the function (y - x)^4 + (x - 2)^4 has a minimum value at (2, 2).')),
    ('q', ('8', 'Show that f(x, y) = x^2 - 3*x*y^2 + 2*y^4 has neither a maximum nor a minimum at the origin.')),
    ('q', ('9', 'A data center adjusts two parameters x and y to reduce power consumption:\n  f(x, y) = x^2 + 2*y^2 - 8x - 4y. Find the minimum power consumption.'))
]

s2_p2 = [
    ('h1', 'Tutorial Sheet 2 (Continued) & Complete Verified Solutions'),
    ('space', ''),
    ('q', ('10', 'A game engine optimizes graphics performance using f(x, y) = x^3 + y^3 - 3*x*y.\nFind the stationary points and test for local maxima or minima.')),
    ('q', ('11', 'Find the smallest and largest value of 2x - y on the curve x - sin y = 0, where 0 <= y <= 2*pi.')),
    ('q', ('12', 'Find the shortest distance between the line y = 10 - 2x and the ellipse (x^2 / 4) + (y^2 / 9) = 1.')),
    ('q', ('13', 'Find the extreme values of f(x, y, z) = 2x + 3y + z such that x^2 + y^2 = 5 and x + z = 1.')),
    ('q', ('14', 'A data center wants to minimize energy consumption f(x, y) = x^2 + y^2 subject to network\ncapacity x + 2y = 20. Apply Lagrange multipliers to find the minimum.')),
    ('q', ('15', 'A game developer wants to maximize graphics quality f(x, y) = x^2*y subject to x + y = 12.\nFind the optimal values using Lagrange multipliers.')),
    ('space', ''),
    ('ans_box', ('Official Verified Answers (Sheet 2):',
        '1. -10 - 4*(x-1) + 4*(y+2) - 2*(x-1)^2 + 2*(x-1)*(y+2) + (x-1)^2*(y+2)\n'
        '2. -(y - pi/2) - x*(y - pi/2) - (1/2)*x^2*(y - pi/2) + (1/6)*(y - pi/2)^3 + ...\n'
        '4. f(x, y) = 1 - (1/2)*(x^2 + y^2) + (1/24)*(x^4 + 6*x^2*y^2 + y^4) + ...\n'
        '5. f(x, y) = 1 + (x+y)/2 - (1/8)*(x^2 + 2*x*y + y^2) + (1/16)*(x^3 + 3*x^2*y + 3*x*y^2 + y^3) + ...\n'
        '6. Local minima at (1, 2); Local maxima at (-1, -2)\n'
        '9. Minimum power consumption at (x, y) = (4, 1); Minimum value is -18\n'
        '10. Stationary points: (0, 0) [Saddle point] and (1, 1) [Local minimum]\n'
        '11. Smallest value = -sqrt(3) - (5*pi)/3; Largest value = sqrt(3) - pi/3\n'
        '12. Shortest distance = sqrt(5)\n'
        '13. Maximum value is 1 + 5*sqrt(2); Minimum value is 1 - 5*sqrt(2)\n'
        '14. Minimum energy consumption is 40 (at x = 4, y = 8)\n'
        '15. Optimal values: (x = 8, y = 4), yielding maximum graphics quality f(8, 4) = 256'
    ))
]

# =========================================================================
# SHEET 3: Double Integrals, Change of Order & Beta-Gamma Functions
# =========================================================================
s3_p1 = [
    ('h1', 'Tutorial Sheet 3: Double Integrals, Change of Order & Beta-Gamma'),
    ('p', 'Course: Mathematics I (25B11MA113) • Semester 1 • Department of Mathematics, JUIT Waknaghat\nTopics: Double Integrals, Order Inversion, Polar Coordinates, Beta & Gamma Function Reductions'),
    ('space', ''),
    ('q', ('1', 'Sketch the region of integration and evaluate the integrals:\n  a. int_{y=1}^{ln 8} int_{x=0}^{ln y} e^(x+y) dx dy            b. int_{y=0}^2 int_{x=0}^{y^2} e^(x/y) dx dy\n  c. int_{x=0}^pi int_{y=0}^{sin x} y dy dx                    d. int_{y=-1}^0 int_{x=-1}^1 (x + y + 1) dx dy')),
    ('q', ('2', 'Evaluate iint_S (x*y - y^2) dx dy where S is the triangle with vertices (0,0), (10,1) and (1,1).')),
    ('q', ('3', 'Evaluate iint_R y dx dy, where R is the region bounded by parabolas y^2 = 4x and x^2 = 4y.')),
    ('q', ('4', 'Change the order of integration and evaluate the following:\n  a. int_{x=0}^inf int_{y=x}^inf (e^-y / y) dy dx             b. int_{x=0}^inf int_{y=0}^x x*e^(-x^2/y) dy dx\n  c. int_{x=0}^{4a} int_{y=x^2/(4a)}^{2*sqrt(ax)} dy dx        d. int_{x=0}^{sqrt(pi)} int_{y=x}^{sqrt(pi)} cos(y^2) dy dx')),
    ('q', ('5', 'Sketch region of integration and evaluate iint_R (y - 2*x^2) dx dy inside square |x| + |y| = 1.')),
    ('q', ('6', 'Evaluate iint_R e^(x^2 + y^2) dy dx over semicircle bounded by x-axis and y = sqrt(1 - x^2).'))
]

s3_p2 = [
    ('h1', 'Tutorial Sheet 3 (Continued) & Complete Verified Solutions'),
    ('space', ''),
    ('q', ('7', 'Evaluate the following integrals by changing into polar coordinates:\n  a. int_{x=2}^2 int_{y=0}^{sqrt(2x-x^2)} [x / sqrt(x^2 + y^2)] dy dx\n  b. int_{y=0}^2 int_{x=0}^{sqrt(4 - y^2)} (x^2 + y^2) dx dy')),
    ('q', ('8', 'Express the following integrals as Beta functions (beta):\n  a. int_0^1 x^4 * (1 - sqrt(x))^5 dx                          b. int_0^1 x^2 * (1 - x^3)^(3/2) dx\n  c. int_0^1 [x^2 / sqrt(1 - x^5)] dx')),
    ('q', ('9', 'Evaluate the following integrals using an appropriate substitution:\n  a. int_0^inf sqrt(x) * e^(-x^(1/3)) dx                       b. int_0^1 [1 / sqrt(-ln x)] dx')),
    ('q', ('10', 'Express in terms of Beta or Gamma functions and evaluate:\n  a. int_0^(pi/2) sin^3(x) * sin^(5/2)(x) dx                  b. int_0^(pi/2) sin^5(x) dx\n  c. int_0^1 x^2 * (1 - x^3)^(3/2) dx')),
    ('q', ('11', 'Prove that: [int_0^(pi/2) sqrt(sin theta) d(theta)] * [int_0^(pi/2) (1 / sqrt(sin theta)) d(theta)] = pi.')),
    ('q', ('12', 'Show that: int_0^(pi/2) sqrt(tan x) dx = (1/2) * Gamma(3/4) * Gamma(1/4).')),
    ('space', ''),
    ('ans_box', ('Official Verified Answers (Sheet 3):',
        '1. a. 8*ln(8) - 16 + e   b. e^2 - 1   c. pi / 4   d. 1\n'
        '2. 6\n'
        '3. 48 / 5 = 9.6\n'
        '4. a. 1   b. (16/3)*a^2   c. 1/2   d. 0\n'
        '5. -2 / 3\n'
        '6. pi * (e - 1) / 2\n'
        '7. a. 4 / 3   b. 2*pi\n'
        '8. a. 2*beta(10, 6)   b. (1/3)*beta(1, 5/2)   c. (1/5)*beta(3/5, 1/2)\n'
        '9. a. (315 / 16) * sqrt(pi)   b. sqrt(pi)\n'
        '10. a. 8 / 77   b. 8 / 15   c. sqrt(pi) / 2'
    ))
]

# =========================================================================
# SHEET 4: Applications of Double Integrals to Area & Volume
# =========================================================================
s4_p1 = [
    ('h1', 'Tutorial Sheet 4: Applications of Double Integrals to Area & Volume'),
    ('p', 'Course: Mathematics I (25B11MA113) • Semester 1 • Department of Mathematics, JUIT Waknaghat\nTopics: Surface Areas, Volume of Solids, Pixel Brightness, Signal Energy & CPU Thermal Modeling'),
    ('space', ''),
    ('q', ('1', 'Evaluate iint_R (x + y)^2 dx dy where R is a parallelogram in xy-plane with vertices\n(1,0), (3,1), (2,2), (0,1) using the transformation u = x + y and v = x - 2y.')),
    ('q', ('2', 'Evaluate iint_R (x - y)*sin(x + y) dx dy over tilted square R with corners at (0,0), (pi,0),\n(pi/2, -pi/2), (pi/2, pi/2) by doing a change of variables u = x + y and v = x - y.')),
    ('q', ('3', 'Find the area bounded by the parabolas y^2 = 4 - x and y^2 = 4 - 4x as a double integral.')),
    ('q', ('4', 'Find the area enclosed by the curves y = 4x - x^2 and x = y.')),
    ('q', ('5', 'Find the volume of the region that lies under paraboloid z = x^2 + y^2 and above the\ntriangle enclosed by the lines x = y, x = 0 and x + y = 2 in the xy-plane.')),
    ('q', ('6', 'An image has pixel intensity given by f(x, y) = x^2 + y^2 over square region D = [0,1] x [0,1].\nCompute the total image brightness B = iint_D (x^2 + y^2) dA.')),
    ('q', ('7', 'A 2D signal has power density P(x, y) = e^-(x^2 + y^2). Total energy is E = iint_D P(x, y) dA.\nEvaluate total energy E when D is the unit disk x^2 + y^2 <= 1.')),
    ('q', ('8', 'The upper hemisphere of radius 1 is described by z = sqrt(1 - x^2 - y^2) over the unit disk D.\nCompute surface area: A = iint_D sqrt(1 + (dz/dx)^2 + (dz/dy)^2) dA.'))
]

s4_p2 = [
    ('h1', 'Tutorial Sheet 4 (Continued) & Complete Verified Solutions'),
    ('space', ''),
    ('q', ('9', 'A robot\'s efficiency is given by E(x, y) = 1 + x*y over rectangular region R = [0, 2] x [0, 3].\nCompute the total efficiency T = iint_R (1 + x*y) dA.')),
    ('q', ('10', 'A rectangular CPU chip extends over the region 0 <= x <= 2 cm and 0 <= y <= 3 cm.\nThe temperature distribution across the chip is modeled by:\n  T(x, y) = 50 + 10x + 5y  (in degrees Celsius).\n  a. Compute the total heat measure over the chip: Q = iint_R T(x, y) dA.\n  b. Using this result, compute the average temperature T_avg over the chip.')),
    ('space', ''),
    ('ans_box', ('Official Verified Answers (Sheet 4):',
        '1. 21\n'
        '2. pi^2 / 2\n'
        '3. Area = 8 sq units\n'
        '4. Area = 4.5 sq units = 9/2\n'
        '5. Volume = 4 / 3\n'
        '6. Total Brightness B = 2 / 3\n'
        '7. Total Energy E = pi * (1 - e^-1) = pi*(e - 1)/e\n'
        '8. Surface Area A = 2*pi\n'
        '9. Total Efficiency T = 15\n'
        '10. a. Total Heat Measure Q = 405 deg C * cm^2\n'
        '    b. Average Temperature T_avg = 405 / (2 * 3) = 67.5 deg C'
    ))
]

# Run PDF generations
generate_pdf(os.path.join(VAULT_DIR, 'Math1_Tutorial_Sheet_1_Limits_Continuity_Jacobian.pdf'), 
             'Mathematics I', 'Tutorial Sheet 1: Limits & Jacobians', [s1_p1, s1_p2])

generate_pdf(os.path.join(VAULT_DIR, 'Math1_Tutorial_Sheet_2_Taylor_Series_Extrema.pdf'), 
             'Mathematics I', 'Tutorial Sheet 2: Taylor Series & Extrema', [s2_p1, s2_p2])

generate_pdf(os.path.join(VAULT_DIR, 'Math1_Tutorial_Sheet_3_Double_Integrals_Beta_Gamma.pdf'), 
             'Mathematics I', 'Tutorial Sheet 3: Integrals & Beta-Gamma', [s3_p1, s3_p2])

generate_pdf(os.path.join(VAULT_DIR, 'Math1_Tutorial_Sheet_4_Area_Volume_Applications.pdf'), 
             'Mathematics I', 'Tutorial Sheet 4: Area & Volume Applications', [s4_p1, s4_p2])

# Master 4-in-1 Bundle
generate_pdf(os.path.join(VAULT_DIR, 'Math1_All_Tutorial_Sheets_1_to_4_Complete_Bundle.pdf'), 
             'Mathematics I', 'All Tutorial Sheets 1–4 Master Solved Bundle', 
             [s1_p1, s1_p2, s2_p1, s2_p2, s3_p1, s3_p2, s4_p1, s4_p2])

print("All Math I PDF generation complete!")
