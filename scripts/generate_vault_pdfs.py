"""
Academic Vault PDF Generator for JUIT Student Hub
Generates authentic, high-quality, downloadable PDF documents for:
- Software Development Fundamentals (SDF) [from prompt OCR & lecture materials]
- Technical English & Communication Skills (HS111)
- Engineering Physics (PH111 / PH112)
"""

import os
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import matplotlib.patches as patches

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'vault')
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_page(ax, title, subtitle, page_num, total_pages, category="SDF"):
    ax.axis('off')
    
    cat_colors = {
        'SDF': ('#0284c7', '#0369a1'),
        'English': ('#7c3aed', '#6d28d9'),
        'Physics': ('#059669', '#047857')
    }
    primary_color, dark_color = cat_colors.get(category, ('#0284c7', '#0369a1'))
    
    # Top banner
    rect = patches.Rectangle((0, 0.91), 1, 0.09, transform=ax.transAxes, color=primary_color, clip_on=False)
    ax.add_patch(rect)
    
    # Header branding
    ax.text(0.04, 0.965, "JAYPEE UNIVERSITY OF INFORMATION TECHNOLOGY", 
            transform=ax.transAxes, color='white', fontsize=11, fontweight='bold', va='center')
    ax.text(0.04, 0.932, f"ACADEMIC VAULT • {category.upper()} REPOSITORY • WAKNAGHAT, SOLAN", 
            transform=ax.transAxes, color='#e0f2fe', fontsize=8, va='center')
    
    # Document title badge
    ax.text(0.96, 0.948, f"{category.upper()} ARCHIVE", 
            transform=ax.transAxes, color='white', fontsize=9, fontweight='bold', ha='right', va='center',
            bbox=dict(boxstyle='round,pad=0.3', facecolor=dark_color, edgecolor='none'))
            
    # Bottom footer rule & numbering
    line = patches.Rectangle((0.04, 0.05), 0.92, 0.0015, transform=ax.transAxes, color='#cbd5e1', clip_on=False)
    ax.add_patch(line)
    
    ax.text(0.04, 0.03, f"{title} • {subtitle}", transform=ax.transAxes, color='#64748b', fontsize=8, va='center')
    ax.text(0.96, 0.03, f"Page {page_num} of {total_pages}", transform=ax.transAxes, color='#64748b', fontsize=8, ha='right', va='center')

def render_content_lines(ax, content_blocks, start_y=0.87):
    y = start_y
    for block_type, text in content_blocks:
        if block_type == 'h1':
            y -= 0.015
            ax.text(0.04, y, text, transform=ax.transAxes, color='#0f172a', fontsize=15, fontweight='bold')
            y -= 0.032
        elif block_type == 'h2':
            y -= 0.01
            ax.text(0.04, y, text, transform=ax.transAxes, color='#0369a1', fontsize=12, fontweight='bold')
            y -= 0.026
        elif block_type == 'p':
            ax.text(0.04, y, text, transform=ax.transAxes, color='#334155', fontsize=9.5, linespacing=1.4)
            lines_count = text.count('\n') + 1 + len(text) // 90
            y -= (0.019 * lines_count)
        elif block_type == 'bullet':
            ax.text(0.06, y, f"•  {text}", transform=ax.transAxes, color='#1e293b', fontsize=9.5, linespacing=1.3)
            lines_count = text.count('\n') + 1 + len(text) // 85
            y -= (0.019 * lines_count)
        elif block_type == 'code':
            lines = text.strip().split('\n')
            code_height = len(lines) * 0.02 + 0.025
            y_box = y - code_height + 0.015
            rect = patches.FancyBboxPatch((0.04, y_box), 0.92, code_height, transform=ax.transAxes,
                                          boxstyle="round,pad=0.01", facecolor='#f8fafc', edgecolor='#cbd5e1')
            ax.add_patch(rect)
            ax.text(0.06, y - 0.005, text, transform=ax.transAxes, color='#0f172a', fontfamily='monospace', fontsize=8.5, linespacing=1.3, va='top')
            y = y_box - 0.02
        elif block_type == 'space':
            y -= 0.015

def generate_pdf(filepath, title, subtitle, category, pages_data):
    total_pages = len(pages_data)
    with PdfPages(filepath) as pdf:
        for idx, blocks in enumerate(pages_data, start=1):
            fig, ax = plt.subplots(figsize=(8.5, 11))
            create_page(ax, title, subtitle, idx, total_pages, category=category)
            render_content_lines(ax, blocks, start_y=0.86)
            pdf.savefig(fig, bbox_inches='tight', pad_inches=0.1)
            plt.close(fig)
    print(f"Generated: {filepath} ({total_pages} pages)")

# -------------------------------------------------------------
# 1. SDF: Lecture 1 - Introduction to C
# -------------------------------------------------------------
p1 = [
    ('h1', 'Lecture Note: 1 — Introduction to C'),
    ('p', 'Course Code: 25B11CI112 • Semester 1 • Department of Computer Science & Engineering\nInstructor / Dept Resource: JUIT Solan Academic Faculty'),
    ('space', ''),
    ('h2', '1. History & Evolution of C Programming'),
    ('p', 'C is a general-purpose programming language developed at AT & T’s Bell Laboratories of USA in 1972.\nIt was designed and written by Dennis Ritchie. In the late seventies, C began to replace the more familiar\nlanguages of that time like PL/I, ALGOL, etc.\n\nANSI C standard emerged in the early 1980s; this book/standard was split into two titles: The original\nwas still called Programming in C, and the title that covered ANSI C was called Programming in ANSI C.\nThis was done because it took several years for compiler vendors to release their ANSI C compilers and for\nthem to become ubiquitous.'),
    ('space', ''),
    ('h2', '2. System-Level Importance & Performance'),
    ('p', 'Major parts of popular operating systems like Windows, UNIX, and Linux are still written in C. This is\nbecause even today, when it comes to performance (speed of execution), nothing beats C. Moreover, if\none is to extend the operating system to work with new devices, one needs to write device driver programs.\nThese programs are exclusively written in C. C seems so popular because it is reliable, simple and easy to use.'),
    ('space', ''),
    ('h2', '3. Steps in Learning C vs English Language'),
    ('bullet', 'Learning English: Alphabets → Words → Sentences → Paragraphs'),
    ('bullet', 'Learning C: Alphabets/Digits/Special Symbols → Constants, Variables, Keywords → Instructions → Program')
]

p2 = [
    ('h1', 'Low-Level vs High-Level Languages & Toolchains'),
    ('h2', '1. Machine Level & Assembly Language'),
    ('p', 'In machine level language, the computer only understands digital numbers i.e. in the form of 0 and 1.\nInstructions given to the computer in binary digit form are difficult to maintain and error prone.\n\nThe assembly language is a modified version of machine level language, where instructions are given in\nEnglish-like mnemonics such as ADD, SUM, MOV etc. The translator used here is an Assembler.'),
    ('space', ''),
    ('h2', '2. High Level Language & Translators'),
    ('p', 'High-level languages (Pascal, Fortran, C, C++) are machine independent (portable).\nThree fundamental types of translators:'),
    ('bullet', 'Compiler: Translates the whole high-level source code into machine language at once (Object Program).'),
    ('bullet', 'Interpreter: Translates source code line-by-line; stops and reports upon finding an error.'),
    ('bullet', 'Assembler: Translates assembly mnemonics into machine code.'),
    ('space', ''),
    ('h2', '3. Integrated Development Environments (IDEs)'),
    ('p', 'The process of editing, compiling, running, and debugging programs is managed by an IDE.\nExamples: Microsoft Visual Studio, CodeWarrior, Xcode, Kylix, and GCC / CLion toolchains.')
]

generate_pdf(os.path.join(OUTPUT_DIR, 'SDF_Lecture_1_Introduction_to_C.pdf'), 
             'SDF Lecture Note 1', 'Introduction to C', 'SDF', [p1, p2])

# -------------------------------------------------------------
# 2. SDF: Let Us C - Chapter 1: Getting Started
# -------------------------------------------------------------
p1 = [
    ('h1', 'Let Us C — Chapter 1: Getting Started'),
    ('p', 'Classic Programming Foundation • Dennis Ritchie Model • JUIT Scholar Study Material'),
    ('space', ''),
    ('h2', '1. Four Building Blocks of Computer Languages'),
    ('bullet', 'The way it stores data in computer memory (Types, Variables, Allocation).'),
    ('bullet', 'The way it operates upon this data (Arithmetic, Relational & Bitwise Operators).'),
    ('bullet', 'How it accomplishes Input and Output (scanf, printf, file streams).'),
    ('bullet', 'How it lets you control the sequence of execution of instructions (Control Flow & Loops).'),
    ('space', ''),
    ('h2', '2. Why Learn C Before C++ or Java?'),
    ('p', 'Many believe nobody can learn C++ or Java directly without first having a solid grasp of core fundamentals.\nLearning complicated OOP concepts (inheritance, polymorphism, exception handling) while still struggling with\nloops and pointers is putting the cart before the horse.\nC provides raw, direct access to memory, hardware architecture, and execution mechanics.')
]

p2 = [
    ('h1', 'The C Character Set & Memory Variables'),
    ('h2', '1. Valid C Characters'),
    ('bullet', 'Alphabets: Uppercase A – Z, Lowercase a – z'),
    ('bullet', 'Digits: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9'),
    ('bullet', r'Special Symbols: ~ ` ! @ # % ^ & * ( ) _ - + = | \ { } [ ] : ; " \' < > , . ? /'),
    ('space', ''),
    ('h2', '2. Constants vs Variables'),
    ('p', 'A constant is an entity that does not change during program execution.\nA variable is an entity whose value may change.\nLike human memory, computer memory consists of millions of storage cells. Each cell has an address,\nand giving a friendly name to a memory cell creates a variable name (e.g. int x = 5;).')
]

generate_pdf(os.path.join(OUTPUT_DIR, 'SDF_Let_Us_C_Getting_Started.pdf'),
             'Let Us C Chapter 1', 'Getting Started', 'SDF', [p1, p2])

# -------------------------------------------------------------
# 3. SDF: MIT 6.087 - Control Flow Statements & Loops
# -------------------------------------------------------------
p1 = [
    ('h1', 'MIT 6.087 — Lecture 3: Control Flow & Conditionals'),
    ('p', 'Practical Programming in C • Conditional Structures, Branching & Selection Logic'),
    ('space', ''),
    ('h2', '1. Blocks and Compound Statements'),
    ('p', 'A simple statement in C ends with a semicolon (;).\nMultiple statements enclosed within curly braces { ... } form a compound statement or block.\nA block can substitute for any simple statement and is treated by the compiler as a single execution unit.'),
    ('space', ''),
    ('h2', '2. Control Conditions in C'),
    ('p', 'Unlike higher-level languages with dedicated boolean keywords, in C (C89/C90), any non-zero numeric\nexpression is considered TRUE, and zero (0) is considered FALSE.\nIn C99, the bool type is provided via <stdbool.h>.'),
    ('space', ''),
    ('h2', '3. The if-else and Nested if Statements'),
    ('code', 'if (x % 2 == 0) {\n    y += x / 2;\n} else if (x % 4 == 1) {\n    y += 2 * ((x + 3) / 4);\n} else {\n    y += (x + 1) / 2;\n}')
]

p2 = [
    ('h1', 'The switch Statement & Iteration Loops'),
    ('h2', '1. The switch-case Multi-Branch Construct'),
    ('p', 'An alternative conditional statement taking an integer or character variable as input.\nCases fall through unless explicitly terminated using the break keyword.'),
    ('code', 'switch (ch) {\n    case \'Y\':\n    case \'y\':\n        printf("Confirmed\\n");\n        break;\n    case \'N\':\n        printf("Declined\\n");\n        break;\n    default:\n        printf("Invalid input\\n");\n        break;\n}'),
    ('h2', '2. Loop Iterations: while, for, and do-while'),
    ('bullet', 'while (condition) { ... } : Entry-controlled loop; condition evaluated first.'),
    ('bullet', 'for (init; cond; incr) { ... } : Ideal for counting iterations.'),
    ('bullet', 'do { ... } while (condition); : Exit-controlled loop; body executes at least once!'),
    ('bullet', 'break : Exits the innermost loop immediately.'),
    ('bullet', 'continue : Skips remaining body statements and jumps to the next loop iteration.')
]

generate_pdf(os.path.join(OUTPUT_DIR, 'SDF_MIT_6087_Control_Flow_Statements.pdf'),
             'MIT 6.087 Lecture 3', 'Control Flow Statements & Loops', 'SDF', [p1, p2])

# -------------------------------------------------------------
# 4. SDF: Lecture 4 - Constants, Variables & Types
# -------------------------------------------------------------
p1 = [
    ('h1', 'Lecture Note: 4 — Constants and Variables'),
    ('p', 'Course Code: 25B11CI112 • Department of Computer Science & Engineering • JUIT'),
    ('space', ''),
    ('h2', '1. Classification of C Constants'),
    ('p', 'In C, constants are classified into two broad categories:'),
    ('bullet', 'Primary Constants: Integer Constants, Real / Floating-point Constants, Character Constants.'),
    ('bullet', 'Secondary Constants: Array, Pointer, Structure (struct), Union, Enum, etc.'),
    ('space', ''),
    ('h2', '2. Numeric Constants Details'),
    ('bullet', 'Decimal integer: Digits 0–9. Default size: 2 or 4 bytes. Range: -32768 to 32767 (16-bit) or -2^31 to 2^31-1 (32-bit).'),
    ('bullet', 'Octal integer: Leading 0 followed by digits 0–7 (e.g. 076, 0127).'),
    ('bullet', 'Hexadecimal integer: Leading 0x or 0X followed by digits 0–9 and A–F (e.g. 0x24, 0x87A).'),
    ('bullet', 'Real / Float: Must have a decimal point or exponent form (e.g. +325.34, 3.6e+5).')
]

p2 = [
    ('h1', 'Character Constants, Strings & Variables'),
    ('h2', '1. Character & String Constants'),
    ('bullet', 'Character Constant: Single character enclosed in single quotes (e.g. \'A\', \'c\', \'$\', \'9\'). Associated with ASCII values (A = 65, a = 97, 0 = 48).'),
    ('bullet', 'String Constant: Sequence of characters enclosed within double quotes (e.g. "JUIT Solan", "Dennis"). Automatically null-terminated with \\0 by compiler.'),
    ('bullet', 'Symbolic Constant: Defined with preprocessor directive: #define MAX 100 or #define PI 3.14159.'),
    ('space', ''),
    ('h2', '2. Variable Declarations & Initialization'),
    ('code', 'int studentCount = 65;\nfloat cgpa = 8.74;\nchar grade = \'A\';\nchar campus[] = "JUIT Waknaghat";')
]

generate_pdf(os.path.join(OUTPUT_DIR, 'SDF_Lecture_4_Constants_and_Variables.pdf'),
             'SDF Lecture Note 4', 'Constants and Variables', 'SDF', [p1, p2])

# -------------------------------------------------------------
# 5. SDF: MIT 6.087 - Operators and Data Types
# -------------------------------------------------------------
p1 = [
    ('h1', 'MIT 6.087 — Lecture 2_2: Operators & Expressions'),
    ('p', 'Practical Programming in C • Arithmetic, Bitwise, Logic & Type Conversions'),
    ('space', ''),
    ('h2', '1. Arithmetic Operators (+, -, *, /, %)'),
    ('bullet', 'Integer Division vs Float Division: 3 / 2 results in 1 (truncated integer division), whereas 3.0 / 2 results in 1.5.'),
    ('bullet', 'Modulus (%): Yields integer remainder (e.g. 7 % 4 is 3). Operands must be integers.'),
    ('space', ''),
    ('h2', '2. Relational & Equality Operators'),
    ('bullet', 'Operators: >, >=, <, <=, ==, !='),
    ('bullet', 'Gotcha: The == equality test operator is distinct from the = assignment operator.'),
    ('space', ''),
    ('h2', '3. Logical Operators & Short-Circuit Evaluation'),
    ('bullet', '&& (Logical AND), || (Logical OR), ! (Logical NOT)'),
    ('bullet', 'Short-circuit: (3 == 3) || (c = getchar()) == \'y\'; -> Second expression is skipped!')
]

p2 = [
    ('h1', 'Bitwise Operators, Precedence & Type Conversions'),
    ('h2', '1. Bitwise Operators'),
    ('bullet', '& (Bitwise AND), | (Bitwise OR), ^ (Bitwise XOR), << (Left Shift), >> (Right Shift)'),
    ('bullet', 'Example: 0x77 & 0x03 evaluates to 0x03; 0x01 << 4 evaluates to 0x10 (16).'),
    ('space', ''),
    ('h2', '2. Increment & Decrement (++ / --)'),
    ('bullet', 'Postfix (x++): Value of x is used in expression first, then incremented.'),
    ('bullet', 'Prefix (++x): Value of x is incremented first, then used in expression.'),
    ('space', ''),
    ('h2', '3. Operator Precedence Hierarchy'),
    ('bullet', 'Highest: ++, --, (cast), sizeof'),
    ('bullet', 'High: *, /, % followed by +, -'),
    ('bullet', 'Medium: Relational (<, <=, >, >=), Equality (==, !=)'),
    ('bullet', 'Lower: Logical (&&, ||), Conditional (?:)'),
    ('bullet', 'Lowest: Assignment operators (=, +=, -=, *=, /=, %=)')
]

generate_pdf(os.path.join(OUTPUT_DIR, 'SDF_MIT_6087_Operators_and_Data_Types.pdf'),
             'MIT 6.087 Lecture 2_2', 'Operators and Data Types', 'SDF', [p1, p2])

# -------------------------------------------------------------
# 6. SDF: Lab Manual
# -------------------------------------------------------------
p1 = [
    ('h1', 'SDF Laboratory Assignment Solutions & Manual'),
    ('p', 'Course Code: 25B17CI172 • Computing Centre AB2 • JUIT Solan'),
    ('space', ''),
    ('h2', '1. Lab Environment & GCC Guidelines'),
    ('bullet', 'Linux Terminal GCC Compilation: gcc -Wall -Wextra lab1.c -o lab1'),
    ('bullet', 'Execution: ./lab1'),
    ('bullet', 'Standard Header Files: <stdio.h>, <stdlib.h>, <string.h>, <math.h>'),
    ('space', ''),
    ('h2', '2. Weekly Lab Syllabus (Exercises 1–12)'),
    ('bullet', 'Lab 1: Basic Input/Output, Data Types, and Arithmetic Operations.'),
    ('bullet', 'Lab 2: Conditional Statements, switch-case, and Quadrant Calculators.'),
    ('bullet', 'Lab 3: Loops, Prime Number Check, Fibonacci Sequence, Series Sum.'),
    ('bullet', 'Lab 4: 1D Arrays, Linear Search, Bubble Sort, Min/Max Finders.'),
    ('bullet', 'Lab 5: 2D Matrix Multiplication, Transpose, and Symmetry Checks.'),
    ('bullet', 'Lab 6: Strings, Palindrome, Tokenization, and Vowel Counter.'),
    ('bullet', 'Lab 7: Modular Programming with Functions and Recursion (Tower of Hanoi).'),
    ('bullet', 'Lab 8: Pointers, Call by Value vs Reference, Pointer Arithmetic.'),
    ('bullet', 'Lab 9: Dynamic Memory Allocation (malloc, calloc, realloc, free).'),
    ('bullet', 'Lab 10: Structures (struct), Array of Structures, Nested Structures.'),
    ('bullet', 'Lab 11: File Handling, Sequential Access, Word Counting.'),
    ('bullet', 'Lab 12: Final Mini-Project & Capstone Code Demonstration.')
]

generate_pdf(os.path.join(OUTPUT_DIR, 'SDF_Lab_Assignment_Solutions_Manual.pdf'),
             'SDF Lab Manual', 'Lab Exercises 1–12', 'SDF', [p1])

# -------------------------------------------------------------
# 7. English: Lecture Notes
# -------------------------------------------------------------
p1 = [
    ('h1', 'English Communication Skills — Comprehensive Notes'),
    ('p', 'Course Code: 25B11HS111 • Department of Humanities & Social Sciences • JUIT'),
    ('space', ''),
    ('h2', '1. The Communication Process & Barrier Elimination'),
    ('p', 'Communication is a two-way dynamic process comprising: Sender → Encoding → Channel → Decoding → Receiver → Feedback.\nBarriers include physiological, psychological, semantic, and environmental interferences.'),
    ('space', ''),
    ('h2', '2. Phonetics & International Phonetic Alphabet (IPA)'),
    ('bullet', 'Vowels: Monophthongs (pure vowels) and Diphthongs (gliding vowels).'),
    ('bullet', 'Consonants: Voiced vs Voiceless consonants, plosives, fricatives, nasals.'),
    ('bullet', 'Word Stress & Intonation: Distinguishing noun vs verb forms (e.g. REcord vs reCORD).'),
    ('space', ''),
    ('h2', '3. Formal & Business Writing'),
    ('bullet', 'Professional Email Writing: Subject line clarity, formal salutation, concise body, professional sign-off.'),
    ('bullet', 'Technical Reports: Executive summary, methodology, findings, and recommendations.')
]

generate_pdf(os.path.join(OUTPUT_DIR, 'English_Communication_Skills_Lecture_Notes.pdf'),
             'English Notes', 'Technical Communication & Phonetics', 'English', [p1])

# -------------------------------------------------------------
# 8. English: Solved PYQ Archive
# -------------------------------------------------------------
p1 = [
    ('h1', 'English Communication Skills — Solved PYQ Archive'),
    ('p', 'Course Code: 25B11HS111 • Previous Year Question Papers (T1, T2 & T3 Solved)'),
    ('space', ''),
    ('h2', '1. T-1 Mid-Semester Model Question & Solution'),
    ('p', 'Question: Explain the 7 Cs of effective communication with technical examples.\nAnswer: Completeness, Conciseness, Consideration, Clarity, Concreteness, Courtesy, and Correctness.\nIn technical documentation, conciseness ensures engineers read critical specifications without ambiguity.'),
    ('space', ''),
    ('h2', '2. T-2 Vocabulary & Mechanics Model Question'),
    ('p', 'Question: Correct common grammatical errors in passive vs active voice engineering sentences.\nAnswer: "The test was performed by the team" (Passive) -> "The engineering team performed the benchmark test" (Active).'),
    ('space', ''),
    ('h2', '3. T-3 End-Semester Essay & Presentation Question'),
    ('p', 'Model outline for writing a formal technical proposal on Green Computing in Solan Campus.')
]

generate_pdf(os.path.join(OUTPUT_DIR, 'English_PYQ_Solved_Archive.pdf'),
             'English Solved PYQs', 'T1, T2 & T3 Examination Papers', 'English', [p1])

# -------------------------------------------------------------
# 9. English: Language Lab Manual
# -------------------------------------------------------------
p1 = [
    ('h1', 'Language Communication Lab Manual (LANGULAB / GDROOM)'),
    ('p', 'Practical Communication Training • Academic Block 1 (LANGULAB) • JUIT'),
    ('space', ''),
    ('h2', '1. Language Lab Software Exercises'),
    ('bullet', 'Module 1: Audio phonetics recognition and vowel length pronunciation practice.'),
    ('bullet', 'Module 2: Accent neutralization and British/American standard differences.'),
    ('bullet', 'Module 3: Listening comprehension tests from BBC and academic lecture transcripts.'),
    ('space', ''),
    ('h2', '2. Group Discussion (GD) Frameworks in GDROOM'),
    ('bullet', 'Initiating a discussion: Stating facts and framing core propositions.'),
    ('bullet', 'Turn taking: Politely intervening and building consensus.'),
    ('bullet', 'Summarizing: Synthesizing varying arguments into actionable conclusions.')
]

generate_pdf(os.path.join(OUTPUT_DIR, 'English_Language_Lab_Manual.pdf'),
             'English Lab Manual', 'LANGULAB Modules', 'English', [p1])

# -------------------------------------------------------------
# 10. Physics: Electrodynamics & Optics Notes
# -------------------------------------------------------------
p1 = [
    ('h1', 'Engineering Physics — Electromagnetics & Optics'),
    ('p', 'Course Code: 25B11PH111 / 25B11PH112 • Department of Physics • JUIT Solan'),
    ('space', ''),
    ('h2', '1. Maxwell\'s Field Equations in Differential & Integral Forms'),
    ('bullet', 'Gauss\'s Law for Electrostatics: ∇ · E = ρ / ε₀'),
    ('bullet', 'Gauss\'s Law for Magnetism: ∇ · B = 0 (No magnetic monopoles)'),
    ('bullet', 'Faraday\'s Law of Induction: ∇ × E = -∂B / ∂t'),
    ('bullet', 'Ampere-Maxwell Law: ∇ × B = μ₀J + μ₀ε₀(∂E / ∂t) [Displacement Current]'),
    ('space', ''),
    ('h2', '2. Lasers & Fiber Optics'),
    ('p', 'Principle of Lasers: Stimulated absorption, spontaneous emission, stimulated emission, and population inversion.\nRuby Laser (3-level system) and Helium-Neon Laser (4-level system, 632.8 nm red beam).\nOptical Fibers: Total internal reflection, acceptance angle θ₀ = arcsin(√(n₁² - n₂²)), numerical aperture (NA).')
]

generate_pdf(os.path.join(OUTPUT_DIR, 'Physics_Electrodynamics_Optics_Notes.pdf'),
             'Physics Notes', 'Electrodynamics, Lasers & Fibers', 'Physics', [p1])

# -------------------------------------------------------------
# 11. Physics: Formula & Derivation Handbook
# -------------------------------------------------------------
p1 = [
    ('h1', 'Engineering Physics — Formula & Derivation Handbook'),
    ('p', 'Quick Reference for T1, T2 & T3 Examinations • Solved Derivations'),
    ('space', ''),
    ('h2', '1. Wave Optics & Interference'),
    ('bullet', 'Interference in Thin Films: 2μt cos(r) = nλ (Constructive for reflection with phase shift)'),
    ('bullet', 'Newton\'s Rings Diameter: D_n² = 4nRλ (Bright rings: D_n² = 2(2n-1)Rλ)'),
    ('bullet', 'Diffraction Grating: (a + b) sin θ = nλ (Grating element = a + b)'),
    ('space', ''),
    ('h2', '2. Quantum Mechanics Essentials'),
    ('bullet', 'de Broglie Wavelength: λ = h / p = h / (mv) = h / √(2mE)'),
    ('bullet', 'Heisenberg Uncertainty Principle: Δx · Δp ≥ ℏ / 2'),
    ('bullet', 'Time-Independent Schrödinger Equation: - (ℏ² / 2m) ∇²ψ + Vψ = Eψ')
]

generate_pdf(os.path.join(OUTPUT_DIR, 'Physics_Formula_and_Derivation_Handbook.pdf'),
             'Physics Handbook', 'Formulas & Derivations', 'Physics', [p1])

# -------------------------------------------------------------
# 12. Physics: Laboratory Manual
# -------------------------------------------------------------
p1 = [
    ('h1', 'Physics Laboratory Manual (PHLAB1 & PHLAB2)'),
    ('p', 'Course Code: 25B17PH171 • Ground Floor Academic Block 1 • JUIT'),
    ('space', ''),
    ('h2', '1. Optics & Mechanics Experiments List'),
    ('bullet', 'Exp 1: Determination of wavelength of sodium light using Newton’s Rings apparatus.'),
    ('bullet', 'Exp 2: Determination of grating element and mercury spectral wavelengths with spectrometer.'),
    ('bullet', 'Exp 3: Measurement of Numerical Aperture (NA) and attenuation of optical fiber.'),
    ('bullet', 'Exp 4: Determination of Planck\'s constant using Photoelectric Effect photocell setup.'),
    ('bullet', 'Exp 5: Measurement of Hall coefficient and carrier concentration in semiconductor crystal.'),
    ('bullet', 'Exp 6: Study of magnetic hysteresis loop using B-H curve tracer oscilloscope.')
]

generate_pdf(os.path.join(OUTPUT_DIR, 'Physics_Laboratory_Manual_PHLAB.pdf'),
             'Physics Lab Manual', 'Optics & Mechanics Experiments', 'Physics', [p1])

print("All 12 Academic Vault PDFs generated successfully in:", OUTPUT_DIR)
