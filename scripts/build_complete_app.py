import os

def build_complete():
    # Read the active Stitch screens HTML to extract the exact components
    def load_stitch_screen(fname):
        p = os.path.join('scripts/stitch_active', fname)
        if os.path.exists(p):
            with open(p, 'r', encoding='utf-8') as f:
                return f.read()
        return ''

    html = '''<!DOCTYPE html>
<html class="dark" lang="en" data-theme="dark" data-theme-mode="dark" data-accent="amber">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <meta name="shell-type" content="web_dashboard" />
  <title>JUIT Student Hub | Waknaghat, Solan</title>
  <meta name="description"
    content="The definitive campus command center for Jaypee University of Information Technology (JUIT), Solan: Timetable, Annapurna dining, campus wayfinding, peer academic vault, attendance tracking, and student utilities." />

  <!-- App Favicons & Icons -->
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <link rel="alternate icon" type="image/x-icon" href="favicon.ico" />
  <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png" />

  <!-- PWA Web App Manifest -->
  <link rel="manifest" href="manifest.json" />
  <meta name="theme-color" content="#0f131c" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="JUIT Hub" />

  <!-- Google Fonts: Plus Jakarta Sans, Newsreader, JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400..600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <!-- Google Material Symbols Outlined -->
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />

  <!-- Tailwind CSS Engine with Official Stitch Antigravity Tokens -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            "surface-variant": "#31353f",
            "on-surface": "#dfe2ef",
            "secondary-fixed": "#68fcbf",
            "outline": "#a08e7a",
            "secondary-fixed-dim": "#45dfa4",
            "surface": "#0f131c",
            "secondary": "#45dfa4",
            "background": "#0f131c",
            "primary-fixed": "#ffddb8",
            "on-tertiary-fixed-variant": "#713700",
            "tertiary-fixed": "#ffdcc5",
            "on-secondary": "#003825",
            "on-tertiary-fixed": "#301400",
            "on-primary-fixed-variant": "#653e00",
            "on-error-container": "#ffdad6",
            "tertiary-container": "#ff9743",
            "on-tertiary-container": "#6c3500",
            "primary-fixed-dim": "#ffb95f",
            "on-secondary-container": "#00452e",
            "secondary-container": "#00bd85",
            "inverse-primary": "#855300",
            "surface-bright": "#353943",
            "surface-dim": "#0f131c",
            "primary-container": "#f59e0b",
            "surface-container-lowest": "#0a0e17",
            "on-error": "#690005",
            "on-tertiary": "#4f2500",
            "error": "#ffb4ab",
            "surface-container-high": "#262a34",
            "primary": "#ffc174",
            "tertiary-fixed-dim": "#ffb783",
            "on-primary-container": "#613b00",
            "surface-container-highest": "#31353f",
            "on-background": "#dfe2ef",
            "on-surface-variant": "#d8c3ad",
            "inverse-surface": "#dfe2ef",
            "on-primary-fixed": "#2a1700",
            "outline-variant": "#534434",
            "surface-tint": "#ffb95f",
            "surface-container-low": "#181c25",
            "on-primary": "#472a00",
            "tertiary": "#ffbf92",
            "on-secondary-fixed-variant": "#005137",
            "error-container": "#93000a",
            "surface-container": "#1c2029",
            "on-secondary-fixed": "#002114",
            "inverse-on-surface": "#2c303a"
          },
          borderRadius: {
            DEFAULT: "0.25rem",
            sm: "0.25rem",
            md: "0.5rem",
            lg: "0.75rem",
            xl: "1rem",
            "2xl": "1.5rem",
            full: "9999px"
          },
          spacing: {
            margin: "2rem",
            "space-xs": "0.25rem",
            "space-xl": "2.5rem",
            "space-sm": "0.5rem",
            "gutter-mobile": "0.75rem",
            "space-md": "1rem",
            gutter: "1.25rem",
            "margin-mobile": "1rem",
            "space-lg": "1.5rem"
          },
          fontFamily: {
            "headline-md": ["Plus Jakarta Sans", "sans-serif"],
            "headline-lg-mobile": ["Plus Jakarta Sans", "sans-serif"],
            "label-md": ["Plus Jakarta Sans", "sans-serif"],
            "caption-editorial": ["Newsreader", "serif"],
            "quote-editorial": ["Newsreader", "serif"],
            "body-sm": ["Plus Jakarta Sans", "sans-serif"],
            "body-md": ["Plus Jakarta Sans", "sans-serif"],
            "headline-lg": ["Plus Jakarta Sans", "sans-serif"],
            "headline-xl": ["Plus Jakarta Sans", "sans-serif"],
            "headline-sm": ["Plus Jakarta Sans", "sans-serif"],
            "headline-xl-mobile": ["Plus Jakarta Sans", "sans-serif"],
            "body-lg": ["Plus Jakarta Sans", "sans-serif"],
            "label-sm": ["Plus Jakarta Sans", "sans-serif"],
            mono: ["JetBrains Mono", "monospace"]
          },
          fontSize: {
            "headline-md": ["22px", { lineHeight: "30px", letterSpacing: "-0.01em", fontWeight: "600" }],
            "headline-lg-mobile": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" }],
            "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.04em", fontWeight: "600" }],
            "caption-editorial": ["13px", { lineHeight: "18px", fontWeight: "400" }],
            "quote-editorial": ["16px", { lineHeight: "26px", fontWeight: "400" }],
            "body-sm": ["13px", { lineHeight: "20px", fontWeight: "400" }],
            "body-md": ["15px", { lineHeight: "24px", fontWeight: "400" }],
            "headline-lg": ["32px", { lineHeight: "42px", letterSpacing: "-0.02em", fontWeight: "600" }],
            "headline-xl": ["40px", { lineHeight: "52px", letterSpacing: "-0.02em", fontWeight: "700" }],
            "headline-sm": ["18px", { lineHeight: "26px", fontWeight: "600" }],
            "headline-xl-mobile": ["30px", { lineHeight: "38px", letterSpacing: "-0.01em", fontWeight: "700" }],
            "body-lg": ["17px", { lineHeight: "28px", fontWeight: "400" }],
            "label-sm": ["11px", { lineHeight: "14px", letterSpacing: "0.03em", fontWeight: "500" }]
          }
        }
      }
    };
  </script>

  <!-- Stitch Unified Stylesheet -->
  <link rel="stylesheet" href="css/stitch-theme.css" />
</head>

<body class="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container">

  <!-- Offline status alert banner -->
  <div class="hidden bg-error-container text-on-error-container text-center py-1.5 px-4 font-label-sm text-label-sm font-semibold" id="offline-status-banner">
    ⚠️ Working Offline — Viewing cached campus timetable and notices
  </div>

  <!-- ======================================================================
       DESKTOP SIDEBAR (Visible on lg+ screens)
       ====================================================================== -->
  <aside class="desktop-sidebar hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-surface-container-lowest z-50 flex-col justify-between overflow-y-auto border-r border-white/[0.06] p-4" id="desktop-sidebar" aria-label="Desktop Navigation">
    <div class="space-y-6">
      <!-- Brand & Telemetry Header -->
      <a href="#dash" class="flex items-center gap-3 p-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors group" id="brand-logo-link">
        <div class="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
          <span class="material-symbols-outlined text-[24px]">school</span>
        </div>
        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="font-headline-sm text-headline-sm text-primary font-bold tracking-tight">JUIT Hub</span>
            <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          </div>
          <span class="font-caption-editorial text-caption-editorial text-on-surface-variant italic truncate">Solan Hills · 1,550m</span>
        </div>
      </a>

      <!-- Navigation Section 1: Academic & Campus Core -->
      <div class="space-y-1">
        <span class="font-label-sm text-label-sm text-on-surface-variant/70 uppercase tracking-wider px-3 font-semibold">Campus Core</span>
        <nav class="sidebar-nav-list flex flex-col space-y-0.5">
          <a class="nav-link active" href="#dash" data-view="dash">
            <span class="material-symbols-outlined">cottage</span>
            <span>Home</span>
          </a>
          <a class="nav-link" href="#timetable" data-view="timetable">
            <span class="material-symbols-outlined">calendar_today</span>
            <span>Classes & Timetable</span>
          </a>
          <a class="nav-link" href="#campus" data-view="campus">
            <span class="material-symbols-outlined">explore</span>
            <span>Campus Wayfinding</span>
          </a>
          <a class="nav-link" href="#mess" data-view="mess">
            <span class="material-symbols-outlined">restaurant</span>
            <span>Annapurna Dining</span>
          </a>
          <a class="nav-link" href="#resources" data-view="resources">
            <span class="material-symbols-outlined">menu_book</span>
            <span>Academic Vault</span>
          </a>
        </nav>
      </div>

      <!-- Navigation Section 2: Student Logistics & Utilities -->
      <div class="space-y-1">
        <span class="font-label-sm text-label-sm text-on-surface-variant/70 uppercase tracking-wider px-3 font-semibold">Student Logistics</span>
        <nav class="sidebar-nav-list flex flex-col space-y-0.5">
          <a class="nav-link" href="#utilities" data-view="utilities">
            <span class="material-symbols-outlined">calculate</span>
            <span>Student Utilities</span>
          </a>
          <a class="nav-link" href="#announcements" data-view="announcements">
            <span class="material-symbols-outlined">campaign</span>
            <span>Campus Notices</span>
          </a>
          <a class="nav-link" href="#events-clubs" data-view="events-clubs">
            <span class="material-symbols-outlined">celebration</span>
            <span>Life & Events</span>
          </a>
          <a class="nav-link" href="#bus" data-view="bus">
            <span class="material-symbols-outlined">directions_bus</span>
            <span>NH-5 Bus Transit</span>
          </a>
          <a class="nav-link" href="#calendar" data-view="calendar">
            <span class="material-symbols-outlined">date_range</span>
            <span>Academic Calendar</span>
          </a>
          <a class="nav-link" href="#academics" data-view="academics">
            <span class="material-symbols-outlined">checklist</span>
            <span>Attendance Tracker</span>
          </a>
          <a class="nav-link" href="#portals" data-view="portals">
            <span class="material-symbols-outlined">hub</span>
            <span>Campus Portals</span>
          </a>
        </nav>
      </div>
    </div>

    <!-- Sidebar Bottom: Student Card, Theme & Admin -->
    <div class="pt-4 border-t border-white/[0.06] space-y-2">
      <div class="p-3 rounded-xl bg-surface-container-low flex items-center justify-between" id="sidebar-user-card">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
            <span class="material-symbols-outlined text-[18px]">account_circle</span>
          </div>
          <div class="truncate">
            <p class="font-label-md text-label-md text-on-surface font-semibold truncate" id="sidebar-user-name">JUIT Scholar</p>
            <p class="font-label-sm text-label-sm text-secondary truncate" id="sidebar-user-batch-label">Batch 26BT12 · CSE</p>
          </div>
        </div>
        <button type="button" class="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" id="btn-quick-theme-toggle" title="Toggle Dark/Light Mode">
          <span class="material-symbols-outlined text-[16px]">dark_mode</span>
        </button>
      </div>
      <div class="flex items-center justify-between px-2 text-xs text-on-surface-variant/70">
        <a href="#settings" data-view="settings" class="hover:text-primary transition-colors flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">tune</span>
          <span>Preferences</span>
        </a>
        <a href="#admin" data-view="admin" class="hover:text-primary transition-colors flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">lock</span>
          <span>Admin</span>
        </a>
      </div>
    </div>
  </aside>

  <!-- ======================================================================
       FIXED TOP APP BAR (All screens)
       ====================================================================== -->
  <header class="app-header fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_12px_rgba(0,0,0,0.2)] pt-safe lg:left-64">
    <div class="h-16 px-margin-mobile lg:px-8 flex items-center justify-between">
      <!-- Left: Mobile Brand & Altitude Whisper -->
      <div class="flex items-center gap-3">
        <button type="button" class="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-high text-on-surface hover:text-primary transition-colors cursor-pointer" id="btn-mobile-menu-toggle" aria-label="Open Navigation Drawer">
          <span class="material-symbols-outlined text-[22px]">menu</span>
        </button>
        <a href="#dash" class="flex flex-col" id="mobile-brand-link">
          <div class="flex items-center gap-2">
            <span class="font-headline-sm text-headline-sm text-primary font-bold tracking-tight">JUIT Hub</span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm border border-white/[0.06]">Solan Hills · 1,550m</span>
          </div>
          <span class="font-caption-editorial text-caption-editorial text-on-surface-variant italic leading-none mt-0.5">Waknaghat Ridge</span>
        </a>
      </div>

      <!-- Right: Action Controls & Live Clock -->
      <div class="flex items-center gap-2">
        <div class="hidden md:flex flex-col text-right mr-2">
          <span class="font-mono text-xs text-primary font-semibold" id="live-clock-time">09:47 AM</span>
          <span class="font-label-sm text-[10px] text-on-surface-variant" id="live-clock-date">Tuesday, 22 Sep</span>
        </div>
        <button type="button" class="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-primary font-label-sm text-label-sm border border-white/[0.06] transition-colors cursor-pointer" id="btn-open-search" title="Search Campus Resources (Ctrl+K)">
          <span class="material-symbols-outlined text-[16px]">search</span>
          <span>Search</span>
          <kbd class="px-1.5 py-0.5 rounded bg-surface-container-lowest font-mono text-[10px]">⌘K</kbd>
        </button>
        <button type="button" class="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors relative cursor-pointer" id="btn-open-notifications" aria-label="View notifications">
          <span class="material-symbols-outlined text-[22px]">notifications</span>
          <span class="hidden absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" id="notif-badge-counter"></span>
        </button>
        <button type="button" class="w-9 h-9 rounded-full bg-surface-container-high border border-white/[0.08] flex items-center justify-center text-primary overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer" id="btn-open-profile-settings" aria-label="User Profile & Settings">
          <span class="material-symbols-outlined text-[20px]">person</span>
        </button>
      </div>
    </div>
  </header>

  <!-- ======================================================================
       MAIN CONTENT CONTAINER
       ====================================================================== -->
  <main class="flex-1 w-full bg-surface pt-16 pb-24 min-h-screen lg:pl-64" id="app-shell-layout">
    <div class="w-full max-w-5xl mx-auto px-margin-mobile lg:px-8 py-4">

      <!-- ==================================================================
           VIEW 1: HUMAN HOME (DASHBOARD)
           ================================================================== -->
      <section class="app-view-panel active flex flex-col w-full" id="view-dash">
        <!-- Weather & Ridge Rhythm Microclimate Pill -->
        <div class="pt-space-sm pb-space-sm flex items-center justify-between">
          <div class="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-low text-secondary shadow-sm border border-white/[0.06]">
            <span class="material-symbols-outlined text-[17px] text-secondary">cloud</span>
            <span class="font-label-sm text-label-sm tracking-wide">16°C • Waknaghat pine mist 🌲</span>
          </div>
          <span class="font-caption-editorial text-caption-editorial text-on-surface-variant italic" id="dash-current-date-heading">Tuesday, 22 September</span>
        </div>

        <!-- Warm Student Greeting -->
        <div class="py-space-md">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="font-headline-xl-mobile lg:font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-primary tracking-tight font-bold" id="dash-live-greeting">
                Evening, Scholar.
              </h1>
              <p class="font-body-md text-body-md text-on-surface-variant mt-space-xs leading-relaxed" id="dash-greeting-sub">
                Wrapped up classes today. Grab a hot chai from Peach Tree or relax before night mess.
              </p>
            </div>
            <div class="hidden sm:flex flex-col items-center justify-center px-4 py-2 rounded-xl bg-surface-container-low border border-white/[0.06] text-center">
              <span class="font-headline-lg text-headline-lg font-bold text-primary leading-tight" id="dash-today-classes-count">5</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Classes</span>
            </div>
          </div>
        </div>

        <!-- Academic Milestone Advisory Banner -->
        <div class="w-full rounded-xl bg-surface-container-low p-space-md px-space-lg shadow-sm border border-white/[0.06] mb-space-md" id="dash-milestone-banner-container">
          <div id="dash-milestone-countdown">
            <!-- Dynamically populated by App.updateDashboardMilestone() -->
          </div>
        </div>

        <!-- Gentle Tomorrow / Next Class Reminder Card -->
        <div class="mt-space-sm" id="dash-next-class-hero">
          <div class="w-full bg-surface-container-low rounded-xl p-space-lg shadow-md relative overflow-hidden border border-white/[0.08]">
            <div class="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-primary/10 blur-2xl pointer-events-none"></div>
            <div class="flex items-center gap-space-xs text-primary mb-space-xs">
              <span class="material-symbols-outlined text-[18px]">calendar_today</span>
              <span class="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Tomorrow Morning</span>
            </div>
            <h2 class="font-headline-sm lg:font-headline-md text-headline-sm lg:text-headline-md text-on-surface font-semibold">
              Software Engineering at 9:00 AM
            </h2>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Classroom CR-02, Academic Block 1
            </p>

            <!-- Handwritten Senior Sticky Note -->
            <div class="mt-space-md bg-surface-container rounded-lg p-space-md flex items-start gap-space-sm shadow-sm border border-white/[0.04]">
              <span class="text-base select-none leading-tight">📌</span>
              <div class="flex-1">
                <p class="font-quote-editorial text-quote-editorial text-primary-fixed italic leading-snug">
                  "Prof mentioned to bring the sprint paper printed or drafted on your iPad."
                </p>
                <span class="font-label-sm text-label-sm text-on-surface-variant/80 block mt-1">Note added from Class CR group</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-space-lg flex flex-wrap items-center justify-between gap-3">
              <button type="button" class="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-bold active:scale-95 transition-transform shadow-sm cursor-pointer" id="alarmBtn" onclick="toggleAlarm(this)">
                <span class="material-symbols-outlined text-[18px]" id="alarmIcon">alarm</span>
                <span id="alarmText">Set 8:15 AM Alarm</span>
              </button>
              <span class="font-caption-editorial text-caption-editorial text-on-surface-variant italic">45m to freshen up before lab</span>
            </div>
          </div>
        </div>

        <!-- Tactile Pinned Campus Notes (Masonry Editorial Pin) -->
        <div class="mt-space-xl">
          <div class="flex items-center justify-between mb-space-sm px-1">
            <div class="flex items-center gap-space-xs">
              <span class="material-symbols-outlined text-primary text-[19px]">push_pin</span>
              <span class="font-headline-sm text-headline-sm text-on-surface font-semibold">Pinned on Ridge Notice</span>
            </div>
            <span class="font-caption-editorial text-caption-editorial text-on-surface-variant italic">Hostel & Council</span>
          </div>

          <div class="w-full bg-surface-container-high rounded-xl p-space-lg shadow-md border border-white/[0.08] relative">
            <div class="flex items-start gap-space-sm">
              <span class="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></span>
              <div class="space-y-space-xs flex-1">
                <span class="font-label-sm text-label-sm text-primary tracking-wide uppercase font-semibold">Mid-Term T-2 Syllabus</span>
                <p class="font-quote-editorial text-quote-editorial text-on-surface leading-snug italic">
                  "Syllabus is up on Vault. Don’t stress over it, past 4-year papers have been curated by seniors with step-by-step marking rubrics."
                </p>
                <div class="pt-1 flex items-center gap-space-sm text-on-surface-variant font-label-sm text-label-sm">
                  <span>Student Council</span>
                  <span>•</span>
                  <a href="#resources" data-action-view="resources" class="text-primary hover:underline">Open in Vault →</a>
                </div>
              </div>
            </div>

            <!-- Milk Notification Ribbon -->
            <div class="mt-space-md pt-space-sm bg-surface-container-lowest/60 rounded-lg p-space-sm flex items-center gap-space-sm border border-white/[0.04]">
              <span class="text-lg">🥛</span>
              <p class="font-body-sm text-body-sm text-on-surface-variant flex-1">
                <span class="text-on-surface font-semibold">Night Milk:</span> Warm haldi & bournvita counter opens at 9:15 PM, Hostel Reception.
              </p>
            </div>
          </div>
        </div>

        <!-- Right Now on Campus (Live Flow Shortcuts) -->
        <div class="mt-space-xl">
          <div class="flex items-center justify-between mb-space-md px-1">
            <div class="flex items-center gap-space-xs">
              <span class="material-symbols-outlined text-secondary text-[19px]">near_me</span>
              <span class="font-headline-sm text-headline-sm text-on-surface font-semibold">Right Now on Campus</span>
            </div>
            <span class="font-label-sm text-label-sm text-on-surface-variant">Live flow</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
            <!-- Shortcut 1: Annapurna Mess -->
            <a href="#mess" data-action-view="mess" class="w-full bg-surface-container-low rounded-xl p-space-md flex items-center justify-between shadow-sm active:bg-surface-container hover:bg-surface-container transition-colors border border-white/[0.06] group">
              <div class="flex items-start gap-space-md min-w-0 pr-2">
                <div class="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 text-primary mt-0.5 group-hover:scale-105 transition-transform">
                  <span class="material-symbols-outlined text-[22px]">restaurant</span>
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-space-xs">
                    <span class="font-headline-sm text-body-lg text-on-surface font-semibold truncate">Annapurna Dinner</span>
                    <span class="w-2 h-2 rounded-full bg-secondary"></span>
                  </div>
                  <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-1" id="dash-fast-mess-hint">
                    Shahi paneer, yellow dal, kheer & phulka
                  </p>
                  <p class="font-caption-editorial text-caption-editorial text-secondary mt-1">
                    Serving now • Halls have open seats
                  </p>
                </div>
              </div>
              <span class="material-symbols-outlined text-[20px] text-on-surface-variant">chevron_right</span>
            </a>

            <!-- Shortcut 2: LRC Library -->
            <a href="#campus" data-action-view="campus" class="w-full bg-surface-container-low rounded-xl p-space-md flex items-center justify-between shadow-sm active:bg-surface-container hover:bg-surface-container transition-colors border border-white/[0.06] group">
              <div class="flex items-start gap-space-md min-w-0 pr-2">
                <div class="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 text-secondary mt-0.5 group-hover:scale-105 transition-transform">
                  <span class="material-symbols-outlined text-[22px]">local_library</span>
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-space-xs">
                    <span class="font-headline-sm text-body-lg text-on-surface font-semibold truncate">Library 3rd Floor</span>
                  </div>
                  <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-1">
                    Silent study booths & charging tables free
                  </p>
                  <p class="font-caption-editorial text-caption-editorial text-on-surface-variant italic mt-1">
                    Open till midnight • Quiet tonight
                  </p>
                </div>
              </div>
              <span class="material-symbols-outlined text-[20px] text-on-surface-variant">chevron_right</span>
            </a>

            <!-- Shortcut 3: Shuttle -->
            <a href="#bus" data-action-view="bus" class="w-full bg-surface-container-low rounded-xl p-space-md flex items-center justify-between shadow-sm active:bg-surface-container hover:bg-surface-container transition-colors border border-white/[0.06] group">
              <div class="flex items-start gap-space-md min-w-0 pr-2">
                <div class="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 text-tertiary mt-0.5 group-hover:scale-105 transition-transform">
                  <span class="material-symbols-outlined text-[22px]">directions_bus</span>
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-space-xs">
                    <span class="font-headline-sm text-body-lg text-on-surface font-semibold truncate">Waknaghat Bus</span>
                  </div>
                  <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-1">
                    Next Solan & Shimla shuttle at 5:30 PM
                  </p>
                  <p class="font-caption-editorial text-caption-editorial text-tertiary mt-1">
                    Boarding Gate 1 near SBI ATM
                  </p>
                </div>
              </div>
              <span class="material-symbols-outlined text-[20px] text-on-surface-variant">chevron_right</span>
            </a>
          </div>
        </div>

        <!-- Warm Pine Valley Photograph Strip -->
        <div class="mt-space-xl mb-space-sm">
          <div class="w-full rounded-xl overflow-hidden bg-surface-container-low shadow-md relative border border-white/[0.06]">
            <img class="w-full h-36 object-cover opacity-80" alt="Waknaghat Solan pine forests" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIuTKqsqvMOveHz5R5TMsjKijKNxaoGCvana0Lgp2mKKidZmq8_04nWfmFr-25nBgKCK7XKMQkU4pc0ASNC7yosKJPr0AMrDzfOEODhsKrW9iiWms_YdmR-pkM36P5AiSrdCWLKdOzeVHZvsBzjYdFIHSD1WCdOibLF4MxUQkVN1AvpqmxY6v9FI5SR97xYyiDXrpvNDveMjFdu3WZRUQJxTrWnnSYVVvbHnjTbBfv5PNuV8SqiPt7" />
            <div class="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/40 to-transparent p-space-md flex flex-col justify-end">
              <span class="font-label-sm text-label-sm text-primary tracking-wide font-semibold">Waknaghat Ridge</span>
              <p class="font-quote-editorial text-quote-editorial text-on-surface italic">
                "The mist usually lifts before morning lab hours."
              </p>
            </div>
          </div>
        </div>

        <!-- Today's Schedule Live Preview Stack -->
        <div class="mt-space-lg space-y-space-sm">
          <div class="flex items-center justify-between px-1" id="dash-schedule-status-header-wrap">
            <div>
              <span class="font-headline-sm text-headline-sm text-on-surface font-semibold">Today's Timeline</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant block" id="dash-today-schedule-sub">Timeline: Active</span>
            </div>
            <a href="#timetable" data-action-view="timetable" class="font-label-sm text-label-sm text-primary hover:underline">Full Timetable →</a>
          </div>
          <div class="space-y-space-xs" id="dash-upcoming-classes-preview">
            <!-- Dynamically populated by TimetableController -->
          </div>
        </div>

        <!-- Academic Vault Curated Picks Carousel -->
        <div class="mt-space-xl space-y-space-sm">
          <div class="flex items-center justify-between px-1">
            <span class="font-headline-sm text-headline-sm text-on-surface font-semibold">Academic Vault Quick Access</span>
            <a href="#resources" data-action-view="resources" class="font-label-sm text-label-sm text-primary hover:underline">Browse Vault →</a>
          </div>
          <div class="flex gap-3 overflow-x-auto no-scrollbar py-1" id="dash-fast-downloads-carousel">
            <!-- Dynamically populated -->
          </div>
        </div>

        <!-- Announcements / Circulars Preview Container -->
        <div class="mt-space-xl space-y-space-sm">
          <div class="flex items-center justify-between px-1">
            <span class="font-headline-sm text-headline-sm text-on-surface font-semibold">Latest Campus Dispatches</span>
            <a href="#announcements" data-action-view="announcements" class="font-label-sm text-label-sm text-primary hover:underline">All Circulars →</a>
          </div>
          <div class="space-y-2" id="dash-announcements-preview"></div>
        </div>

        <!-- Meal Preview Container -->
        <div id="dash-next-meal-preview" class="hidden"></div>
      </section>

      <!-- ==================================================================
           VIEW 2: CALM SCHEDULE (TIMETABLE)
           ================================================================== -->
      <section class="app-view-panel flex flex-col w-full space-y-space-md" id="view-timetable">
        <!-- Solan Hill Rhythm & Weather Vignette -->
        <div class="flex items-center justify-between py-space-sm text-on-surface-variant">
          <div class="flex items-center gap-space-xs">
            <span class="material-symbols-outlined text-[17px] text-secondary">cloud</span>
            <span class="font-caption-editorial text-caption-editorial italic">18°C Misty afternoon · Ridge breeze</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container-high text-secondary" id="timetable-live-clock-badge">LIVE TRACKER</span>
            <span class="font-label-sm text-label-sm tracking-wide text-primary font-bold">WEEK 6</span>
          </div>
        </div>

        <!-- Batch & Attendance Reassurance Card -->
        <div class="bg-surface-container rounded-xl p-space-md shadow-md border border-white/[0.06]">
          <div class="flex flex-wrap items-center justify-between gap-space-sm mb-space-sm">
            <div class="flex items-center gap-space-xs">
              <span class="material-symbols-outlined text-primary text-[20px]">school</span>
              <span class="font-headline-sm text-headline-sm text-on-surface font-semibold" id="timetable-batch-display-label">Batch 26BT12</span>
              <span class="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">CSE 1st Sem</span>
            </div>
            <!-- Semester & Batch Controls -->
            <div class="flex items-center gap-2">
              <select class="select-styled" id="timetable-sem-select" aria-label="Select Semester"></select>
              <select class="select-styled" id="timetable-batch-select" aria-label="Select Batch"></select>
            </div>
          </div>

          <!-- Reassurance Badge -->
          <div class="flex items-center gap-space-sm bg-surface-container-low rounded-lg p-space-sm border border-white/[0.04]">
            <div class="w-7 h-7 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-secondary text-[16px]" style="font-variation-settings: 'FILL' 1;">spa</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-body-sm text-body-sm text-on-surface">
                You are safe on attendance <span class="font-label-md text-label-md text-secondary font-bold">(89% total)</span>. No worries.
              </p>
            </div>
          </div>
        </div>

        <!-- Quick Batch Filter Chips -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1" id="quick-batch-container">
          <!-- Dynamically populated -->
        </div>

        <!-- Search & View Mode Switcher -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="relative w-full sm:w-80">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input type="text" id="timetable-search-input" placeholder="Search course, code or faculty..." class="w-full bg-surface-container-low pl-9 pr-9 py-2 rounded-xl text-on-surface placeholder:text-outline font-body-sm text-body-sm border border-white/[0.06] focus:outline-none focus:border-primary" />
            <button type="button" class="hidden absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary" id="btn-clear-timetable-search"><span class="material-symbols-outlined text-[16px]">close</span></button>
          </div>
          <div class="inline-flex rounded-xl bg-surface-container-low p-1 border border-white/[0.06]" id="timetable-view-mode-tabs">
            <button type="button" class="term-btn active" data-mode="today">Today</button>
            <button type="button" class="term-btn" data-mode="day">Day Flow</button>
            <button type="button" class="term-btn" data-mode="week">Week Matrix</button>
          </div>
        </div>

        <!-- Horizontal Day Flow Ribbon -->
        <div class="grid grid-cols-6 gap-2 py-1" id="timetable-day-pills">
          <!-- Dynamically rendered day cards (MON, TUE, WED, THU, FRI, SAT) -->
        </div>

        <!-- Timeline Section Heading -->
        <div class="flex items-center justify-between pt-2" id="timetable-timeline-wrapper">
          <div>
            <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold" id="schedule-day-title">Tuesday Timeline</h2>
            <span class="font-caption-editorial text-caption-editorial text-on-surface-variant italic" id="timetable-timeline-heading">Waknaghat Academic Blocks</span>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" id="btn-jump-period" class="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-high text-primary font-label-sm text-label-sm">Now</button>
            <span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-bold" id="schedule-classes-count">5 Classes</span>
          </div>
        </div>

        <!-- Period Scrubber Tracker -->
        <div id="timetable-live-tracker"></div>

        <!-- Schedule Stream Cards -->
        <div class="space-y-space-md" id="timetable-classes-list">
          <!-- Dynamically populated by TimetableController with Stitch calm cards -->
        </div>
      </section>

      <!-- ==================================================================
           VIEW 3: ANNAPURNA DINING (MESS)
           ================================================================== -->
      <section class="app-view-panel flex flex-col w-full space-y-space-md" id="view-mess">
        <!-- Mountain Kitchen Header -->
        <div class="pt-space-sm pb-space-xs flex flex-col gap-space-xs">
          <div class="flex items-center justify-between">
            <span class="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-primary tracking-tight font-bold">Annapurna Dining</span>
            <span class="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-label-sm font-semibold" id="mess-live-serving-badge">
              <span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              Hall A & B Open Soon
            </span>
          </div>
          <div class="flex flex-col gap-1 mt-1">
            <div class="flex items-center gap-space-xs text-on-surface">
              <span class="material-symbols-outlined text-[18px] text-primary" style="font-variation-settings: 'FILL' 1;">schedule</span>
              <p class="font-body-md text-body-md font-medium" id="mess-current-day-label">Dinner starts at 7:30 PM <span class="text-on-surface-variant font-normal">(in 40 mins)</span></p>
              <span class="font-label-sm text-label-sm text-on-surface-variant ml-2" id="mess-month-cycle-label">October 2026 Cycle</span>
            </div>
            <p class="font-caption-editorial text-caption-editorial text-primary-fixed-dim italic">
              Tonight is North Indian special · Warm aromas drifting across the pine court
            </p>
          </div>
        </div>

        <!-- Quick Day Picker Ribbon -->
        <div class="w-full overflow-x-auto no-scrollbar py-space-xs">
          <div class="flex items-center gap-2 min-w-max" id="mess-day-tabs">
            <!-- Dynamically populated with Mon to Sun tabs -->
          </div>
        </div>

        <!-- Main Feast Card: Tonight's Thali -->
        <div class="mt-space-xs flex flex-col rounded-xl bg-surface-container-low shadow-xl overflow-hidden border border-white/[0.08]">
          <div class="relative w-full h-48 overflow-hidden">
            <img class="w-full h-full object-cover" alt="Himalayan brass thali with slow-cooked Dal Makhani and Shahi Paneer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRGY7_pLkTkCoZ7-1p2DpJEBBmkMV3DOrVu6r-mU0rlx-MjCqv0vzKDAqLWVBiGiVjLq1AaBlm6oohN-CK2Z4uoqMGWwyP2pyLPoaxgWVLC7BjiUGsegcxrvLecJ7K-EvYrZeNdHWc3mrNESlWWS_6WH1AHN_TYbDFFsYl_t2OeCJAYBLOy1SlEyCoGPNXkxLGE3lqO-mqgh3viHJMufKhdS70bQZPJZWswRFMY7QYa6dxu_66wEMz" />
            <div class="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/40 to-transparent"></div>
            <div class="absolute bottom-3 left-space-md right-space-md flex items-center justify-between">
              <span class="font-headline-md text-headline-md text-primary tracking-tight font-bold drop-shadow-sm">Tonight's Thali</span>
              <span class="px-space-sm py-0.5 rounded-full bg-surface-container-highest/90 text-on-surface font-label-sm text-label-sm backdrop-blur-md">
                Hall A & B Special
              </span>
            </div>
          </div>

          <!-- Dining Counters Badges -->
          <div class="px-space-lg pt-space-md flex flex-wrap gap-space-xs">
            <span class="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-secondary-container/15 text-secondary font-label-sm text-label-sm">
              <span class="material-symbols-outlined text-[14px]">eco</span>
              Pure Veg Counter · Hall A
            </span>
            <span class="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-tertiary-container/20 text-tertiary font-label-sm text-label-sm">
              <span class="material-symbols-outlined text-[14px]">egg_alt</span>
              Egg Counter · Hall B
            </span>
          </div>

          <!-- Featured Dishes -->
          <div class="p-space-lg flex flex-col gap-space-md">
            <div class="flex items-start gap-space-sm">
              <div class="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0 mt-0.5 text-primary">
                <span class="material-symbols-outlined text-[18px]">skillet</span>
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-baseline justify-between">
                  <h4 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Shahi Paneer</h4>
                  <span class="font-label-sm text-label-sm text-primary font-bold">Main</span>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Slow-simmered in a warm, velvety tomato-cashew gravy with freshly ground spices.
                </p>
              </div>
            </div>

            <div class="flex items-start gap-space-sm">
              <div class="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0 mt-0.5 text-secondary">
                <span class="material-symbols-outlined text-[18px]">soup_kitchen</span>
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-baseline justify-between">
                  <h4 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Dal Makhani & Basmati</h4>
                  <span class="font-label-sm text-label-sm text-secondary font-bold">Classic</span>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Black lentils cooked overnight on charcoal with whole butter and fragrant long-grain steamed rice.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Full Daily Meals Container (Breakfast, Lunch, Snacks, Dinner) -->
        <div class="space-y-space-md" id="mess-meals-container">
          <!-- Dynamically populated by MessController -->
        </div>

        <!-- Night Milk Table & Rebate Pass Note -->
        <div class="rounded-xl bg-surface-container-low p-space-lg border border-white/[0.06] shadow-sm space-y-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">local_cafe</span>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Night Milk & Hostel Chai</h3>
          </div>
          <p class="font-body-sm text-body-sm text-on-surface-variant">
            Served daily from 9:15 PM to 10:15 PM at hostel counters. Carry your own travel mug or flask.
          </p>
          <div class="overflow-x-auto">
            <table class="milk-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Counter Flavor</th>
                  <th>Timings</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody id="milk-schedule-tbody">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ==================================================================
           VIEW 4: CAMPUS WAYFINDING & ACADEMIC BLOCKS (CAMPUS)
           ================================================================== -->
      <section class="app-view-panel flex flex-col w-full space-y-space-md" id="view-campus">
        <!-- Hill & Weather Whisper Bar -->
        <div class="bg-surface-container-low rounded-xl px-space-md py-space-sm flex items-center justify-between shadow-sm border border-white/[0.06]">
          <div class="flex items-center gap-space-sm min-w-0">
            <span class="material-symbols-outlined text-primary text-[20px] shrink-0" style="font-variation-settings: 'FILL' 1;">cloud</span>
            <div class="truncate">
              <p class="font-label-sm text-label-sm text-on-surface truncate font-semibold">16°C · Overcast over Waknaghat ridge</p>
              <p class="font-caption-editorial text-caption-editorial text-on-surface-variant italic truncate">Pine needle path between AB2 & LRC is slick from morning mist</p>
            </div>
          </div>
          <span class="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-label-sm font-semibold">Ridge Dry</span>
        </div>

        <!-- Search & Tactile Quick Filters -->
        <div class="bg-surface-container rounded-xl p-space-md shadow-md border border-white/[0.06]">
          <div class="relative flex items-center mb-space-sm">
            <span class="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">search</span>
            <input class="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-sm text-body-sm pl-10 pr-9 py-2.5 rounded-lg outline-none border border-white/[0.06] focus:border-primary transition-all" id="map-search-input" placeholder="Find a room, lab, or faculty office (e.g. CR01, CL-3)..." type="text" />
            <button type="button" class="hidden absolute right-3 text-on-surface-variant hover:text-primary" id="map-search-clear"><span class="material-symbols-outlined text-[16px]">close</span></button>
          </div>
          <div id="map-search-dropdown" class="hidden space-y-1 py-1"></div>
          <div class="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-1" id="map-category-filters">
            <button class="filter-chip active flex items-center gap-1" data-block="all">
              <span>All Blocks</span>
            </button>
            <button class="filter-chip flex items-center gap-1" data-block="cr">
              <span class="material-symbols-outlined text-[15px]">meeting_room</span>
              <span>CR Rooms</span>
            </button>
            <button class="filter-chip flex items-center gap-1" data-block="cl">
              <span class="material-symbols-outlined text-[15px]">terminal</span>
              <span>Labs (CL)</span>
            </button>
            <button class="filter-chip flex items-center gap-1" data-block="food">
              <span class="material-symbols-outlined text-[15px]">coffee</span>
              <span>Food & Chai</span>
            </button>
            <button class="filter-chip flex items-center gap-1" data-block="lrc">
              <span class="material-symbols-outlined text-[15px]">local_library</span>
              <span>LRC</span>
            </button>
          </div>
        </div>

        <!-- Route Mode Header Bar & Quick Buildings -->
        <div class="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar" id="map-header-mode-bar">
          <div class="flex items-center gap-1" id="map-quick-buildings"></div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button type="button" id="btn-shortest-path" class="px-2.5 py-1 rounded-lg bg-surface-container text-xs hover:bg-surface-container-high">Shortest</button>
            <button type="button" id="btn-accessible-path" class="px-2.5 py-1 rounded-lg bg-surface-container text-xs hover:bg-surface-container-high">Accessible</button>
            <button type="button" id="btn-clear-active-route" class="hidden px-2.5 py-1 rounded-lg bg-error-container text-on-error-container text-xs">Clear</button>
          </div>
        </div>

        <!-- Hilltop Campus Visual Context Card -->
        <div class="relative rounded-xl overflow-hidden bg-surface-container shadow-md border border-white/[0.06]">
          <div class="bg-cover bg-center w-full h-36 relative" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDcqS3PUZmN41zjZw1stQ5u8t0e1zY_PhACjvn53THXf7rdTYb3mJ2h9GSnomg42oItEOC-hEAtSSxWtTh_UpkrnE9KChDwpSDT_qbiBH870vFjGlwLcmH5FZQwlJlBKPSEtWDuJYTTOLeQuFZG4OdqzoEFnZeR3nruVpobqV04rkcR1AWnHOqBx7BfqluisYV9qudLeHzRoiCbOfKTdz1bvRGlIMKyZcmN_L4dVT6hJk9ll1BH-9kz')">
            <div class="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/60 to-transparent"></div>
            <div class="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <div>
                <span class="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">Tiered Hill Topography</span>
                <p class="font-headline-sm text-headline-sm text-on-surface font-semibold leading-tight">Waknaghat Campus Layout</p>
              </div>
              <span class="font-caption-editorial text-caption-editorial text-on-surface-variant italic bg-surface-container-lowest/80 px-2 py-0.5 rounded-md">1,550m Altitude</span>
            </div>
          </div>
          <div class="p-space-md pt-2">
            <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              The campus follows the natural mountain spine. Higher tiered blocks (AB1, AB2) connect via covered pine staircases down toward the Annapurna dining terrace and the lower Highway Gate 1.
            </p>
          </div>
        </div>

        <!-- Interactive Campus Vector SVG Viewport -->
        <div class="relative w-full rounded-xl bg-surface-container-low border border-white/[0.08] shadow-md p-4" id="map-viewport-box">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[20px]">map</span>
              <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Interactive Campus Map</h3>
            </div>
            <div class="flex items-center gap-1.5">
              <button type="button" class="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer" id="btn-map-zoom-in" title="Zoom In">+</button>
              <button type="button" class="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer" id="btn-map-zoom-out" title="Zoom Out">−</button>
              <button type="button" class="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer" id="btn-map-reset" title="Reset View">↺</button>
            </div>
          </div>
          <div class="w-full h-80 rounded-lg overflow-hidden bg-surface-container-lowest relative flex items-center justify-center" id="map-world-layer">
            <svg class="w-full h-full" id="campus-vector-svg" viewBox="0 0 1000 700"></svg>
            <div id="map-hud-overlay-layer"></div>
          </div>
        </div>

        <!-- Academic Blocks Directory -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[20px]">apartment</span>
              <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Academic Blocks & Venues</h2>
            </div>
            <span class="font-caption-editorial text-caption-editorial text-on-surface-variant italic">Tap card for room directions</span>
          </div>

          <!-- AB-2 -->
          <article class="block-card rounded-xl bg-surface-container p-space-md shadow-md transition-all border-l-4 border-l-primary border border-white/[0.06] cursor-pointer" data-venue="AB2" onclick="if(window.CampusMap) CampusMap.showBuildingDetails('ab2')">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 rounded-full bg-primary/15 text-primary font-label-sm text-label-sm font-bold">AB-2</span>
                  <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Core Tech Wing</span>
                </div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Computer Centre & Lecture Halls</h3>
              </div>
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high text-primary">
                <span class="material-symbols-outlined text-[18px]">near_me</span>
              </span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-2">
              Houses Computer Labs (CL-1 through CL-8), Lecture Theatres LT-1, LT-2, LT-3, and Dean of Academics offices on the 2nd tier.
            </p>
          </article>

          <!-- AB-1 -->
          <article class="block-card rounded-xl bg-surface-container p-space-md shadow-md transition-all border-l-4 border-l-secondary border border-white/[0.06] cursor-pointer" data-venue="AB1" onclick="if(window.CampusMap) CampusMap.showBuildingDetails('ab1')">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-label-sm text-label-sm font-bold">AB-1</span>
                  <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Instructional Wing</span>
                </div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Classrooms CR-1 to CR-14 & Basic Sciences</h3>
              </div>
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high text-secondary">
                <span class="material-symbols-outlined text-[18px]">near_me</span>
              </span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-2">
              Main theoretical lecture rooms CR01 to CR14, Physics & Chemistry laboratories, and Mathematics department faculty suites.
            </p>
          </article>

          <!-- LRC -->
          <article class="block-card rounded-xl bg-surface-container p-space-md shadow-md transition-all border-l-4 border-l-tertiary border border-white/[0.06] cursor-pointer" data-venue="LRC" onclick="if(window.CampusMap) CampusMap.showBuildingDetails('lrc')">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 rounded-full bg-tertiary/15 text-tertiary font-label-sm text-label-sm font-bold">LRC</span>
                  <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Learning Resource Centre</span>
                </div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Central Library & Reading Pods</h3>
              </div>
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high text-tertiary">
                <span class="material-symbols-outlined text-[18px]">near_me</span>
              </span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-2">
              3-floor library complex with silent study bays, journal archives, IEEE digital access terminals, and 24x7 reading lounge during exams.
            </p>
          </article>
        </div>

        <!-- Venue / Building Info Drawer Element -->
        <aside class="map-venue-drawer" id="map-venue-drawer" aria-label="Building Information Drawer">
          <div class="flex items-center justify-between p-4 border-b border-white/[0.06]">
            <span class="font-headline-sm text-headline-sm text-on-surface font-semibold">Building Details</span>
            <button type="button" class="text-on-surface-variant hover:text-primary" id="btn-close-map-drawer"><span class="material-symbols-outlined">close</span></button>
          </div>
          <div class="p-4 space-y-3">
            <button type="button" id="btn-drawer-directions" class="btn-attendance-toggle attended w-full justify-center">Get Directions</button>
            <button type="button" id="btn-show-pin-on-map" class="btn-attendance-toggle w-full justify-center">Highlight on Map</button>
          </div>
        </aside>
      </section>

      <!-- ==================================================================
           VIEW 5: NH-5 HIGHWAY TRANSIT & BUS GUIDE (BUS)
           ================================================================== -->
      <section class="app-view-panel flex flex-col w-full space-y-space-md" id="view-bus">
        <div class="pt-space-sm pb-space-xs flex flex-col">
          <span class="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">Himalayan Highway Transit</span>
          <h1 class="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface font-bold tracking-tight">NH-5 Bus Guide</h1>
          <p class="font-body-md text-body-md text-on-surface-variant mt-1 leading-snug">
            How to navigate state buses, local HRTC shuttles, and shared cabs directly from Waknaghat chowk.
          </p>
        </div>

        <!-- Which Side of NH-5 Do I Stand On? -->
        <div class="rounded-xl bg-surface-container-low p-space-lg shadow-md border border-white/[0.08] space-y-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[22px]">help_center</span>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Which side of NH-5 do I stand on?</h3>
          </div>

          <!-- Uphill Side -->
          <div class="rounded-lg bg-surface-container p-4 border-l-4 border-l-primary">
            <div class="flex items-center gap-2 mb-1">
              <span class="material-symbols-outlined text-primary text-[20px]">north</span>
              <span class="font-headline-sm text-headline-sm text-on-surface font-semibold text-[15px]">Uphill Side (Mountain Rock Face)</span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant pl-7">
              Buses going up to <strong class="text-on-surface font-semibold">Shimla, Kufri, Tutikandi ISBT, and Sanjauli</strong>. Wait near the wooden tea shack under the rock face.
            </p>
          </div>

          <!-- Downhill Side -->
          <div class="rounded-lg bg-surface-container p-4 border-l-4 border-l-secondary">
            <div class="flex items-center gap-2 mb-1">
              <span class="material-symbols-outlined text-secondary text-[20px]">south</span>
              <span class="font-headline-sm text-headline-sm text-on-surface font-semibold text-[15px]">Downhill Side (Valley / Railing Side)</span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant pl-7">
              Buses heading down to <strong class="text-on-surface font-semibold">Kandaghat, Solan Mall Road, Kumarhatti, Chandigarh Sector 43, and Delhi ISBT</strong>.
            </p>
          </div>
        </div>

        <!-- Campus Gate 1 Shuttle Live Widget -->
        <div class="rounded-xl bg-surface-container p-space-md shadow-md border border-white/[0.06]">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[20px]">airport_shuttle</span>
              <span class="font-headline-sm text-headline-sm text-on-surface font-semibold text-[16px]">Gate 1 Chowk Shuttle</span>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-label-sm text-label-sm font-bold">Regular Run</span>
          </div>
          <div class="flex items-baseline gap-2 mb-1">
            <span class="font-headline-md text-headline-md text-primary font-bold">5:15 PM</span>
            <span class="font-body-sm text-body-sm text-on-surface-variant">Next van departure from Gate 1</span>
          </div>
          <p class="font-caption-editorial text-caption-editorial text-on-surface-variant italic">
            💡 Van leaves from near security post. Fare is ₹10. Seats usually fill 5-7 minutes before scheduled push.
          </p>
        </div>

        <!-- Street Wisdom Checklist -->
        <div class="rounded-xl bg-surface-container-low p-space-md shadow-sm border border-white/[0.06] space-y-2">
          <p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Street Wisdom Checklist</p>
          <div class="flex items-start gap-2.5 p-2.5 rounded bg-surface-container">
            <span class="material-symbols-outlined text-primary text-[18px] mt-0.5">payments</span>
            <p class="font-body-sm text-body-sm text-on-surface leading-tight">
              Carry small paper cash (₹20, ₹50 notes). Highway cell networks can dip inside deep turns, so UPI sometimes stalls mid-ticket.
            </p>
          </div>
          <div class="flex items-start gap-2.5 p-2.5 rounded bg-surface-container">
            <span class="material-symbols-outlined text-primary text-[18px] mt-0.5">record_voice_over</span>
            <p class="font-body-sm text-body-sm text-on-surface leading-tight">
              Always wave your hand early and shout “<em>Bhaiya Shimla jayegi?</em>” or “<em>Solan bypass?</em>” to the conductor standing at the footboard.
            </p>
          </div>
          <div class="flex items-start gap-2.5 p-2.5 rounded bg-surface-container">
            <span class="material-symbols-outlined text-secondary text-[18px] mt-0.5">bedtime</span>
            <p class="font-body-sm text-body-sm text-on-surface leading-tight">
              Last safe return bus from Shimla Old ISBT drops at Waknaghat chowk around 8:40 PM. Do not rely on local transport past 9:00 PM without prior shared cab.
            </p>
          </div>
        </div>

        <!-- Waknaghat Cab Union Stand -->
        <div class="rounded-xl bg-surface-container p-space-md flex items-center justify-between shadow-sm border border-white/[0.06]">
          <div class="flex items-center gap-space-sm min-w-0">
            <div class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 text-primary">
              <span class="material-symbols-outlined text-[20px]">local_taxi</span>
            </div>
            <div class="truncate">
              <p class="font-headline-sm text-headline-sm text-on-surface font-semibold text-[15px] truncate">Waknaghat Cab Union Stand</p>
              <p class="font-caption-editorial text-caption-editorial text-on-surface-variant italic truncate">Standard fixed student rate: ₹250 to Kandaghat</p>
            </div>
          </div>
          <a class="shrink-0 px-3.5 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-bold shadow hover:bg-primary-container transition-colors flex items-center gap-1.5" href="tel:01792239200">
            <span class="material-symbols-outlined text-[16px]">call</span>
            <span>Call Stand</span>
          </a>
        </div>

        <!-- Bus Schedule Grid -->
        <div class="space-y-3 pt-2">
          <div class="flex items-center justify-between">
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Scheduled Departures</h3>
            <div class="flex items-center gap-2">
              <div id="bus-filter-pills" class="flex gap-1"></div>
              <input type="text" id="bus-search-input" placeholder="Filter destination..." class="select-styled py-1 text-xs" />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3" id="bus-destinations-grid">
            <!-- Dynamically populated by BusGuideController -->
          </div>
        </div>
      </section>

      <!-- ==================================================================
           VIEW 6: ACADEMIC VAULT (RESOURCES)
           ================================================================== -->
      <section class="app-view-panel flex flex-col w-full space-y-space-md" id="view-resources">
        <!-- Header Intro Section -->
        <div class="pt-space-sm pb-space-xs flex flex-col">
          <div class="flex items-center gap-space-xs text-primary mb-1">
            <span class="material-symbols-outlined text-[18px]">auto_stories</span>
            <span class="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">Peer Archive & Repository</span>
          </div>
          <h1 class="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface font-bold tracking-tight">Academic Vault</h1>
          <p class="font-body-md text-body-md text-on-surface-variant mt-1 leading-snug">
            Handwritten notes, solved papers & lab roadmaps passed down from JUIT seniors.
          </p>
        </div>

        <!-- Senior Tip Card -->
        <div class="bg-gradient-to-br from-primary-container/20 via-surface-container to-surface-container-high rounded-xl p-space-md shadow-md border border-white/[0.06]">
          <div class="flex items-start gap-space-sm">
            <div class="w-8 h-8 rounded-full bg-primary-container/30 flex items-center justify-center shrink-0 mt-0.5">
              <span class="material-symbols-outlined text-primary text-[20px]" style="font-variation-settings: 'FILL' 1;">lightbulb</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1 mb-1">
                <span class="font-label-md text-label-md text-primary font-bold">Senior Advice for T-2 Exams</span>
                <span class="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-full">Waknaghat Tips</span>
              </div>
              <p class="font-body-sm text-body-sm text-on-surface leading-relaxed">
                Don’t cram 500-page textbooks. Focus on the 4-year PYQ patterns and tutorial sheets—they cover 80% of test rubrics.
              </p>
            </div>
          </div>
        </div>

        <!-- Search & Filter Bar -->
        <div class="flex flex-col gap-space-sm">
          <div class="relative w-full">
            <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input class="w-full h-12 pl-11 pr-4 bg-surface-container rounded-xl font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-high border border-white/[0.06] shadow-sm transition-all" id="resource-search-input" placeholder="Search subject, course code (e.g. 18B11CI111), or topic..." type="search" />
          </div>
          <!-- Category & Subject Pills -->
          <div class="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-1" id="resource-type-filters">
            <button class="filter-chip active" data-filter="all">All (42)</button>
            <button class="filter-chip" data-filter="pyq">PYQ Solved Banks (18)</button>
            <button class="filter-chip" data-filter="tutorials">Tutorial Sheets (12)</button>
            <button class="filter-chip" data-filter="lab">Lab Manuals (8)</button>
            <button class="filter-chip" data-filter="cheatsheet">Formula Cheat-sheets (4)</button>
          </div>
          <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1" id="resource-subject-filters"></div>
          <div class="hidden" id="resource-sem-filter"></div>
          <div class="flex justify-end">
            <button type="button" id="btn-add-resource" class="text-xs text-primary hover:underline flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">add</span>
              <span>Submit Resource Note</span>
            </button>
          </div>
        </div>

        <!-- Curated Subject Packs Section -->
        <div class="space-y-3 pt-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary text-[20px]">folder_special</span>
              <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">Curated Subject Packs</h2>
            </div>
            <span class="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">Updated Winter ’26</span>
          </div>

          <!-- Subject Pack 1: SDF -->
          <div class="subject-card bg-surface-container rounded-xl p-space-md shadow-md flex flex-col gap-space-sm border border-white/[0.06]">
            <div class="flex items-start justify-between gap-space-sm">
              <div class="flex flex-col min-w-0">
                <span class="font-label-sm text-label-sm uppercase font-bold tracking-wide text-secondary bg-secondary-container/20 px-2 py-0.5 rounded-full w-max mb-1">
                  Sem 1 CSE • 18B11CI111
                </span>
                <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold leading-tight">Software Development Fundamentals (SDF)</h3>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Verified Faculty & Senior Notes by 4th-Year Toppers</p>
              </div>
              <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-primary">
                <span class="material-symbols-outlined text-[24px]">terminal</span>
              </div>
            </div>

            <div class="flex flex-col gap-2 mt-1">
              <div class="p-3 bg-surface-container-low rounded-lg flex items-center justify-between gap-3 border border-white/[0.04]">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 text-on-surface-variant">
                    <span class="material-symbols-outlined text-[18px]">description</span>
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span class="font-label-md text-label-md text-on-surface truncate font-semibold">Complete C Pointers & Dynamic Allocation Guide</span>
                    <span class="font-label-sm text-label-sm text-on-surface-variant">PDF • 4.2 MB • Handwritten Diagram Set</span>
                  </div>
                </div>
                <button type="button" class="px-3 py-1 rounded bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold hover:bg-primary hover:text-on-primary transition-colors shrink-0">Open</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Dynamic Resources Grid Container -->
        <div class="space-y-3 pt-2">
          <div class="flex items-center justify-between">
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">All Archived Resources</h3>
            <span class="font-label-sm text-label-sm text-on-surface-variant" id="resources-count-label">42 items</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3" id="resources-grid-container">
            <!-- Dynamically populated by ResourcesController -->
          </div>
        </div>
      </section>

      <!-- ==================================================================
           VIEW 7: STUDENT UTILITIES (UTILITIES)
           ================================================================== -->
      <section class="app-view-panel flex flex-col w-full space-y-space-md" id="view-utilities">
        <div class="pt-space-sm pb-space-xs flex flex-col">
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-label-sm font-bold">WAKNAGHAT 1,550M</span>
            <span class="text-on-surface-variant font-label-sm text-label-sm tracking-widest uppercase">Academic Tools</span>
          </div>
          <h1 class="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface font-bold tracking-tight">Student Utilities</h1>
          <p class="font-body-md text-body-md text-on-surface-variant mt-0.5 leading-relaxed">
            Simple tools to stay on track without the math anxiety. Designed for calm pacing between hills and lectures.
          </p>
        </div>

        <!-- SGPA / CGPA Target Estimator Card (Projection Studio) -->
        <div class="w-full bg-surface-container rounded-xl p-space-md shadow-md flex flex-col gap-space-md border border-white/[0.06]">
          <div class="flex items-start justify-between">
            <div class="flex flex-col">
              <span class="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Projection Studio</span>
              <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Semester 1 SGPA Target</h3>
            </div>
            <div class="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-[20px]">calculate</span>
            </div>
          </div>

          <div class="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1 border border-white/[0.04]">
            <div class="flex items-baseline gap-2">
              <span class="font-headline-lg text-headline-lg text-primary tracking-tight font-bold" id="projected-sgpa-display">8.65</span>
              <span class="font-label-lg text-label-lg text-on-surface-variant font-medium">Projected SGPA</span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant">Based on 5 core subjects & 2 labs (19.5 registered credits)</p>
          </div>

          <!-- Interactive Course Modules -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider pb-1">
              <span>Course & Credits</span>
              <span>Simulated Grade</span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg bg-surface-container-high">
              <div class="flex flex-col pr-2">
                <span class="font-label-lg text-label-lg text-on-surface font-semibold">Software Development</span>
                <span class="font-body-sm text-body-sm text-on-surface-variant">4.0 Credits • CS101</span>
              </div>
              <select class="select-styled py-1 text-primary font-bold">
                <option selected>A (9 pts)</option>
                <option>A+ (10 pts)</option>
                <option>B+ (8 pts)</option>
                <option>B (7 pts)</option>
              </select>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg bg-surface-container-high">
              <div class="flex flex-col pr-2">
                <span class="font-label-lg text-label-lg text-on-surface font-semibold">Engineering Maths</span>
                <span class="font-body-sm text-body-sm text-on-surface-variant">4.0 Credits • MA102</span>
              </div>
              <select class="select-styled py-1 text-primary font-bold">
                <option>A+ (10 pts)</option>
                <option>A (9 pts)</option>
                <option selected>B+ (8 pts)</option>
                <option>B (7 pts)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Safe Bunk Forecaster (Attendance) -->
        <div class="w-full bg-surface-container rounded-xl p-space-md shadow-md flex flex-col gap-space-md border border-white/[0.06]">
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">Attendance Forecaster</span>
              <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Safe Bunk Forecaster</h3>
            </div>
            <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary-container/20 text-secondary font-label-md text-label-md font-bold">
              Safe Harbor
            </span>
          </div>

          <div class="flex items-center gap-space-md p-space-md rounded-xl bg-surface-container-low border border-white/[0.04]">
            <div class="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg class="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path class="text-surface-container-highest" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3.5"></path>
                <path class="text-secondary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="89.4, 100" stroke-linecap="round" stroke-width="3.5"></path>
              </svg>
              <span class="absolute font-label-sm text-label-sm font-bold text-on-surface">89.4%</span>
            </div>
            <div class="flex flex-col justify-center min-w-0">
              <span class="font-headline-sm text-headline-sm text-on-surface font-semibold">89.4% Aggregate</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant truncate">Mandatory university threshold: 80.0%</span>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 rounded-lg bg-surface-container-high">
            <span class="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">event_seat</span>
            <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              You can safely take <span class="font-bold text-on-surface">3 more lectures off</span> across the semester before hitting the university 80% warning limit. Keep them for heavy snow or travel delays.
            </p>
          </div>
        </div>

        <!-- Pomodoro Pine Focus Timer -->
        <div class="w-full bg-surface-container rounded-xl p-space-md shadow-md flex flex-col gap-space-md border border-white/[0.06]">
          <div class="flex items-start justify-between">
            <div class="flex flex-col">
              <span class="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Quiet Rhythm</span>
              <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Waknaghat Focus Session</h3>
            </div>
            <div class="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-secondary">
              <span class="material-symbols-outlined text-[20px]">forest</span>
            </div>
          </div>

          <div class="flex flex-col items-center justify-center py-6 bg-surface-container-low rounded-xl relative overflow-hidden border border-white/[0.04]">
            <span class="font-headline-lg lg:font-headline-xl text-headline-lg lg:text-headline-xl text-on-surface font-bold tracking-tight" id="pomo-time-display">25:00</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase mt-1">Single Sprint Cycle</span>
            <div class="flex items-center gap-2 mt-2">
              <button type="button" id="btn-pomo-focus" class="px-2 py-0.5 rounded bg-surface-container text-xs">Focus (25m)</button>
              <button type="button" id="btn-pomo-short" class="px-2 py-0.5 rounded bg-surface-container text-xs">Short (5m)</button>
              <button type="button" id="btn-pomo-long" class="px-2 py-0.5 rounded bg-surface-container text-xs">Long (15m)</button>
            </div>
            <div class="flex items-center gap-space-md mt-space-md">
              <button type="button" aria-label="Reset timer" class="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center active:scale-95 transition-transform" id="btn-pomo-reset">
                <span class="material-symbols-outlined text-[20px]">restart_alt</span>
              </button>
              <button type="button" class="h-12 px-6 rounded-full bg-primary-container text-on-primary-container font-label-lg text-label-lg flex items-center gap-2 active:scale-95 transition-transform shadow-md font-bold" id="btn-pomo-start-pause">
                <span class="material-symbols-outlined text-[20px]">play_arrow</span>
                <span>Start Pacing</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Campus Help Contacts -->
        <div class="w-full bg-surface-container rounded-xl p-space-md shadow-md flex flex-col gap-space-md border border-white/[0.06]">
          <div class="flex flex-col">
            <span class="font-label-sm text-label-sm uppercase tracking-wider text-error font-bold">Support Network</span>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Quick Campus Help</h3>
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between p-3 rounded-lg bg-surface-container-high">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-error">
                  <span class="material-symbols-outlined text-[20px]">medical_services</span>
                </div>
                <div class="flex flex-col">
                  <span class="font-label-lg text-label-lg text-on-surface font-semibold">Dispensary & Health Centre</span>
                  <span class="font-body-sm text-body-sm text-on-surface-variant">Gate 2 • Dr. Sharma (24/7 on duty)</span>
                </div>
              </div>
              <a class="h-9 px-3.5 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md font-bold flex items-center gap-1.5 shadow" href="tel:01792239200">
                <span class="material-symbols-outlined text-[16px]">call</span>
                <span>Call</span>
              </a>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg bg-surface-container-high">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                  <span class="material-symbols-outlined text-[20px]">night_shelter</span>
                </div>
                <div class="flex flex-col">
                  <span class="font-label-lg text-label-lg text-on-surface font-semibold">Warden Duty Desk</span>
                  <span class="font-body-sm text-body-sm text-on-surface-variant">Hostel Block • Floor Patrol Lead</span>
                </div>
              </div>
              <a class="h-9 px-3.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md font-bold flex items-center gap-1.5 shadow" href="tel:01792239300">
                <span class="material-symbols-outlined text-[16px]">call</span>
                <span>Desk</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Full Interactive Calculators Container -->
        <div id="utilities-tab-content" class="space-y-4"></div>
      </section>

      <!-- ==================================================================
           VIEW 8: CAMPUS NOTICES (ANNOUNCEMENTS)
           ================================================================== -->
      <section class="app-view-panel flex flex-col w-full space-y-space-md" id="view-announcements">
        <div class="w-full bg-surface-container-low rounded-xl p-3 flex items-center justify-between shadow-sm border border-white/[0.06]">
          <div class="flex items-center space-x-2">
            <span class="material-symbols-outlined text-[18px] text-primary" style="font-variation-settings: 'FILL' 1;">landscape</span>
            <span class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Waknaghat 1,550m</span>
          </div>
          <div class="flex items-center space-x-3">
            <span class="inline-flex items-center space-x-1 font-label-sm text-label-sm text-secondary font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              <span>Misty 14°C</span>
            </span>
            <span class="text-outline-variant font-label-sm text-label-sm">•</span>
            <span class="font-label-sm text-label-sm text-primary font-medium">Valley Shuttles On-Time</span>
          </div>
        </div>

        <div class="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface font-bold tracking-tight">Campus Noticeboard</h2>
            <p class="font-body-md text-body-md text-on-surface-variant">Official circulars, mess updates, and ridge dispatches.</p>
          </div>
          <div class="relative w-full sm:w-64">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input type="text" id="announcements-search-input" placeholder="Search notices..." class="select-styled w-full pl-9 py-1.5 text-xs" />
          </div>
        </div>

        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1" id="announcements-category-filters">
          <button class="filter-chip active" data-category="all">All Notices</button>
          <button class="filter-chip" data-category="urgent">Urgent & Exams</button>
          <button class="filter-chip" data-category="mess">Hostel & Mess</button>
          <button class="filter-chip" data-category="clubs">Fests & Clubs</button>
        </div>

        <!-- Pinned Urgent Circular Card -->
        <div class="notice-card relative overflow-hidden bg-surface-container-high rounded-xl p-5 shadow-xl flex flex-col space-y-3 border border-error/30" data-category="urgent">
          <div class="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-error/10 blur-2xl pointer-events-none"></div>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm uppercase tracking-wider font-bold flex items-center space-x-1">
                <span class="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                <span>Mandatory</span>
              </span>
              <span class="font-label-sm text-label-sm text-on-surface-variant">Today, 4:30 PM</span>
            </div>
            <span class="material-symbols-outlined text-primary text-[18px]" style="font-variation-settings: 'FILL' 1;">push_pin</span>
          </div>
          <div class="space-y-1">
            <span class="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wide">Controller of Examinations (COE)</span>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold leading-snug">T-2 Mid-Semester Schedule & Seating Allotment Released</h3>
          </div>
          <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Examination halls assigned across AB1, AB2, and DLC auditorium. Seating roll matrices posted on ground floor display kiosks and online portal.
          </p>
        </div>

        <!-- Dynamic Notices Cards Stack -->
        <div class="space-y-3" id="announcements-cards-container">
          <!-- Dynamically populated by AnnouncementsController -->
        </div>
      </section>

      <!-- ==================================================================
           VIEW 9: CAMPUS LIFE & EVENTS (EVENTS-CLUBS)
           ================================================================== -->
      <section class="app-view-panel flex flex-col w-full space-y-space-md" id="view-events-clubs">
        <div class="pt-space-sm pb-space-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface font-bold tracking-tight">Campus Life & Events</h2>
            <p class="font-body-md text-body-md text-on-surface-variant mt-0.5">What's happening around Waknaghat ridge and Open Air Theatre.</p>
          </div>
          <input type="text" id="events-clubs-search" placeholder="Search events & clubs..." class="select-styled py-1.5 text-xs w-full sm:w-64" />
        </div>

        <!-- Category Pills -->
        <div class="flex gap-2 overflow-x-auto no-scrollbar py-1">
          <button class="filter-chip active" id="tab-btn-events">All Happenings</button>
          <button class="filter-chip" id="tab-btn-clubs">Student Societies</button>
        </div>

        <!-- Featured Flagship Fest Card: Murious 19.0 -->
        <div class="relative bg-surface-container rounded-xl overflow-hidden shadow-xl border border-white/[0.06]">
          <div class="relative h-48 w-full">
            <img class="w-full h-full object-cover" alt="Murious Tech Fest Open Air Theatre twilight stage" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUkvvbcnzi9EAkbaSb-1SFoxc7zcFUZcP-e0U9y9q5_Hdm8L-xpIyKWrR31c9MnabilWcQsq_jan6be12_ysdgnASWqghdNVrz05M6sQ_NsKEh6RRIhx1co2udAkYEwVnHBuJYQ3l2ZPl_022cGryrOu_KU0D2GfcOqGc29NoWE3Onj9_WyQW3sSpj2OxsWDPDE9CrSR0B_45-EkLezXpDVmH0E8k4qgM1oqULyqKFhQRss2KmHMt9" />
            <div class="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/60 to-transparent"></div>
            <div class="absolute top-3 left-3 flex gap-2">
              <span class="bg-primary-container text-on-primary-container px-2.5 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider font-bold shadow-md">
                Flagship Fest
              </span>
              <span class="bg-surface-container-lowest/80 backdrop-blur-md text-secondary px-2.5 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1 font-bold">
                <span class="material-symbols-outlined text-[13px]">military_tech</span> ₹1.5L Pool
              </span>
            </div>
          </div>
          <div class="p-5 flex flex-col gap-3.5">
            <div>
              <div class="flex items-center gap-1.5 text-primary mb-1">
                <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                <span class="font-label-md text-label-md font-semibold">Oct 9 – Oct 11 • Open Air Theatre & AB2</span>
              </div>
              <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Murious 19.0 — National Tech Symposium</h3>
            </div>
            <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              North India's premier technical fest featuring 24-hr Hackathon, WebCraft, and Drone Racing. Over ₹1.5 Lakhs in prize pools across technical, design, and hardware tracks.
            </p>
            <div class="flex items-center gap-2 bg-surface-container-high px-3 py-2 rounded-lg">
              <span class="material-symbols-outlined text-primary text-[18px]">verified</span>
              <p class="font-label-sm text-label-sm text-on-surface-variant">
                Organized by <span class="text-on-surface font-semibold">TIEDC & Technical Council</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Interactive Events & Clubs Container -->
        <div class="space-y-3" id="events-clubs-container">
          <!-- Dynamically populated by EventsClubsController -->
        </div>
      </section>

      <!-- ==================================================================
           VIEW 10: ACADEMIC CALENDAR (CALENDAR)
           ================================================================== -->
      <section class="app-view-panel flex flex-col w-full space-y-space-md" id="view-calendar">
        <div class="pt-space-sm pb-space-xs flex flex-col">
          <span class="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">Official University Schedule</span>
          <h1 class="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface font-bold tracking-tight">Academic Calendar</h1>
        </div>
        <div class="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
          <div class="flex items-center gap-2">
            <button class="term-btn active" id="btn-cal-odd">Odd Sem (July – Dec 2026)</button>
            <button class="term-btn" id="btn-cal-even">Even Sem (Jan – May 2027)</button>
            <span class="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-secondary" id="calendar-active-term-pill">Odd Sem 2026</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="relative">
              <input type="text" id="calendar-search-input" placeholder="Search calendar..." class="select-styled py-1 text-xs" />
              <button type="button" class="hidden absolute right-2 top-1/2 -translate-y-1/2" id="calendar-search-clear">✕</button>
            </div>
            <button type="button" id="btn-export-ics-main" class="px-2.5 py-1 rounded bg-surface-container text-xs text-primary hover:bg-surface-container-high">Export .ics</button>
            <div id="calendar-view-switcher" class="hidden"></div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" id="btn-month-prev" class="px-2 py-1 rounded bg-surface-container text-xs">◀ Prev</button>
          <button type="button" id="btn-month-next" class="px-2 py-1 rounded bg-surface-container text-xs">Next ▶</button>
        </div>
        <div class="rounded-xl bg-surface-container-low p-space-md border border-white/[0.06] shadow-sm" id="calendar-timeline-container">
          <!-- Dynamically populated by CalendarController -->
        </div>
      </section>

      <!-- ==================================================================
           VIEW 11: ATTENDANCE TRACKER (ACADEMICS)
           ================================================================== -->
      <section class="app-view-panel flex flex-col w-full space-y-space-md" id="view-academics">
        <div class="pt-space-sm pb-space-xs flex flex-col">
          <span class="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">Target 80% Rule</span>
          <h1 class="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface font-bold tracking-tight">Attendance Studio</h1>
        </div>
        <div class="flex gap-2 border-b border-white/[0.06] pb-2" id="academics-subnav-tabs">
          <button type="button" class="term-btn active" id="tab-btn-personal-attendance">My Attendance</button>
          <button type="button" class="term-btn" id="tab-btn-batch-attendance">Batch Matrix</button>
          <button type="button" class="term-btn" id="tab-btn-cgpa-checker">CGPA Predictor</button>
        </div>

        <div id="subpanel-personal-attendance" class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="font-headline-sm text-headline-sm font-semibold">Registered Courses</span>
            <div class="flex gap-2">
              <button type="button" id="btn-add-personal-main" class="px-2.5 py-1 rounded bg-surface-container text-xs text-primary">+ Add Course</button>
              <button type="button" id="btn-reset-attendance" class="px-2.5 py-1 rounded bg-surface-container text-xs text-error">Reset</button>
            </div>
          </div>
          <div class="space-y-3" id="academics-attendance-container"></div>
          <div id="academics-courses-list" class="space-y-2"></div>
        </div>

        <div id="subpanel-batch-attendance" class="hidden space-y-4">
          <input type="text" id="batch-matrix-search" placeholder="Search batch matrix..." class="select-styled w-full" />
          <div id="batch-attendance-container" class="space-y-2"></div>
        </div>

        <div id="subpanel-cgpa-checker" class="hidden space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-on-surface-variant block mb-1">Past Cumulative CGPA</label>
              <input type="number" step="0.01" id="cgpa-past-cgpa" class="select-styled w-full" placeholder="8.50" />
            </div>
            <div>
              <label class="text-xs text-on-surface-variant block mb-1">Past Completed Credits</label>
              <input type="number" id="cgpa-past-credits" class="select-styled w-full" placeholder="40" />
            </div>
          </div>
          <div class="flex gap-2">
            <button type="button" id="btn-add-cgpa-course" class="px-2.5 py-1 rounded bg-surface-container text-xs text-primary">+ Add Course</button>
            <button type="button" id="btn-reset-cgpa-courses" class="px-2.5 py-1 rounded bg-surface-container text-xs text-error">Reset</button>
          </div>
          <div id="academics-cgpa-container" class="space-y-2"></div>
          <div class="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
            <span>Projected SGPA: <strong id="calc-sgpa-result" class="text-primary font-bold">--</strong></span>
            <span>Cumulative CGPA: <strong id="calc-cgpa-result" class="text-secondary font-bold">--</strong></span>
          </div>

          <!-- Hidden predictor inputs for controller compatibility -->
          <div class="hidden">
            <input type="number" id="pred-past-cgpa" />
            <input type="number" id="pred-past-credits" />
            <input type="number" id="pred-current-credits" />
            <input type="number" id="pred-target-cgpa" />
            <span id="pred-result-sgpa"></span>
            <div id="pred-diagnosis-banner"><span id="pred-diagnosis-text"></span></div>
            <button type="button" id="btn-simulate-odd"></button>
            <button type="button" id="btn-simulate-even"></button>
            <button type="button" id="btn-simulate-summer"></button>
            <button type="button" id="btn-sim-attend-plus"></button>
            <button type="button" id="btn-sim-miss-plus"></button>
            <button type="button" id="btn-sim-reset"></button>
            <button type="button" id="btn-add-custom-course"></button>
            <button type="button" id="btn-add-assignment"></button>
          </div>
        </div>
      </section>

      <!-- ==================================================================
           VIEW 12: CAMPUS PORTALS (PORTALS)
           ================================================================== -->
      <section class="app-view-panel flex flex-col w-full space-y-space-md" id="view-portals">
        <div class="pt-space-sm pb-space-xs flex flex-col">
          <span class="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">Direct Campus Access</span>
          <h1 class="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface font-bold tracking-tight">University Portals</h1>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-sm" id="dash-portal-tiles">
          <!-- Dynamically populated by PortalsController -->
        </div>
      </section>

      <!-- ==================================================================
           VIEW 13: SETTINGS & PREFERENCES (SETTINGS)
           ================================================================== -->
      <section class="app-view-panel flex flex-col w-full space-y-space-md" id="view-settings">
        <div class="pt-space-sm pb-space-xs flex flex-col">
          <h1 class="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface font-bold tracking-tight">Preferences & Profile</h1>
        </div>
        <div class="rounded-xl bg-surface-container-low p-space-lg border border-white/[0.06] shadow-sm space-y-4">
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Student Profile</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="font-label-sm text-label-sm text-on-surface-variant block mb-1">Your Name</label>
              <input type="text" id="onboard-name-input" class="select-styled w-full" placeholder="Enter student name" />
            </div>
            <div>
              <label class="font-label-sm text-label-sm text-on-surface-variant block mb-1">Assigned Batch</label>
              <select id="onboard-batch-select" class="select-styled w-full"></select>
            </div>
          </div>
          <div class="flex items-center justify-between pt-2">
            <span class="text-xs text-on-surface-variant" id="settings-display-batch"></span>
            <button type="button" class="btn-attendance-toggle attended" id="btn-set-user-batch">Save Profile</button>
          </div>
          <div class="pt-4 border-t border-white/[0.06]">
            <span class="text-xs text-on-surface-variant block mb-2">Theme Mode</span>
            <span id="current-theme-label" class="font-bold text-primary text-sm">Dark Theme</span>
          </div>
          <!-- Scholar Notes Section -->
          <div class="pt-4 border-t border-white/[0.06] space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-headline-sm text-headline-sm text-on-surface font-semibold">Personal Scholar Notes</span>
              <span id="notes-save-status" class="text-xs text-secondary"></span>
            </div>
            <textarea id="scholar-notes-textarea" rows="4" class="w-full bg-surface-container-lowest p-3 rounded-lg text-sm text-on-surface border border-white/[0.06] focus:border-primary" placeholder="Scratchpad notes..."></textarea>
            <button type="button" id="btn-save-notes" class="btn-attendance-toggle attended text-xs">Save Notes</button>
          </div>
        </div>
      </section>

      <!-- ==================================================================
           VIEW 14: ADMIN PASSCODE DASHBOARD (ADMIN)
           ================================================================== -->
      <section class="app-view-panel flex flex-col w-full space-y-space-md" id="view-admin">
        <div class="pt-space-sm pb-space-xs flex flex-col">
          <h1 class="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface font-bold tracking-tight">Admin Control Panel</h1>
        </div>
        <div class="rounded-xl bg-surface-container-low p-space-lg border border-white/[0.06] shadow-sm">
          <div id="admin-locked-banner" class="space-y-4 text-center py-8">
            <span class="material-symbols-outlined text-[48px] text-primary">lock</span>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Authorized Access Only</h3>
            <p class="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto">Enter administrator passcode to edit timetables, mess menus, and circulars.</p>
            <div class="flex items-center justify-center gap-2 max-w-xs mx-auto">
              <input type="password" id="admin-passcode-input" placeholder="Passcode (juit2026)" class="select-styled w-full" />
              <button type="button" id="btn-admin-unlock-submit" class="btn-attendance-toggle attended">Unlock</button>
            </div>
            <button type="button" id="btn-admin-quick-unlock" class="text-xs text-on-surface-variant hover:text-primary">Quick Demo Unlock</button>
          </div>
          <div id="admin-content-area" class="hidden space-y-4">
            <div id="admin-tabs-nav" class="flex gap-2 pb-2 border-b border-white/[0.06]"></div>
            <div class="flex gap-2">
              <button type="button" id="btn-admin-add-class" class="px-2.5 py-1 rounded bg-surface-container text-xs">+ Class</button>
              <button type="button" id="btn-admin-new-notice" class="px-2.5 py-1 rounded bg-surface-container text-xs">+ Notice</button>
              <button type="button" id="btn-admin-add-room" class="px-2.5 py-1 rounded bg-surface-container text-xs">+ Room</button>
              <button type="button" id="btn-admin-add-link" class="px-2.5 py-1 rounded bg-surface-container text-xs">+ Link</button>
              <button type="button" id="btn-save-mess-edits" class="px-2.5 py-1 rounded bg-surface-container text-xs text-secondary">Save Mess</button>
            </div>
            <!-- Excel import zone -->
            <div id="excel-dropzone" class="p-4 border-2 border-dashed border-white/[0.1] rounded-xl text-center">
              <input type="file" id="excel-file-input" class="hidden" />
              <span class="text-xs text-on-surface-variant">Drop Excel Timetable (.xls, .xlsx)</span>
            </div>
            <div id="excel-preview-results"></div>
            <div class="flex gap-2">
              <button type="button" id="btn-commit-import" class="hidden px-2.5 py-1 rounded bg-secondary text-on-secondary text-xs">Commit</button>
              <button type="button" id="btn-cancel-import" class="hidden px-2.5 py-1 rounded bg-surface-container text-xs">Cancel</button>
            </div>
            <div id="admin-panel-dynamic-view"></div>
          </div>
        </div>
      </section>

    </div>
  </main>

  <!-- ======================================================================
       MOBILE BOTTOM HUD DOCK (Visible on < lg screens)
       ====================================================================== -->
  <nav class="mobile-hud-dock fixed bottom-0 inset-x-0 z-50 pb-safe px-margin-mobile pointer-events-none lg:hidden" aria-label="Mobile Navigation Dock">
    <div class="max-w-md mx-auto mb-3 pointer-events-auto">
      <div class="bg-surface-container-low/95 backdrop-blur-xl rounded-full shadow-[0_12px_32px_-4px_rgba(10,13,19,0.7),0_2px_6px_-1px_rgba(245,158,11,0.04)] px-space-xs py-space-xs flex items-center justify-between border border-white/[0.08]">
        <a aria-current="page" class="flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 rounded-full transition-all text-primary bg-primary/10 active" data-view="dash" href="#dash">
          <span class="material-symbols-outlined text-[20px]">cottage</span>
          <span class="font-label-sm text-label-sm mt-0.5">Home</span>
        </a>
        <a class="flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 rounded-full text-on-surface-variant hover:text-on-surface transition-all" data-view="timetable" href="#timetable">
          <span class="material-symbols-outlined text-[20px]">calendar_today</span>
          <span class="font-label-sm text-label-sm mt-0.5">Classes</span>
        </a>
        <a class="flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 rounded-full text-on-surface-variant hover:text-on-surface transition-all" data-view="campus" href="#campus">
          <span class="material-symbols-outlined text-[20px]">explore</span>
          <span class="font-label-sm text-label-sm mt-0.5">Campus</span>
        </a>
        <a class="flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 rounded-full text-on-surface-variant hover:text-on-surface transition-all" data-view="mess" href="#mess">
          <span class="material-symbols-outlined text-[20px]">restaurant</span>
          <span class="font-label-sm text-label-sm mt-0.5">Mess</span>
        </a>
        <a class="flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 rounded-full text-on-surface-variant hover:text-on-surface transition-all" data-view="resources" href="#resources">
          <span class="material-symbols-outlined text-[20px]">menu_book</span>
          <span class="font-label-sm text-label-sm mt-0.5">Vault</span>
        </a>
        <button type="button" class="flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 rounded-full text-on-surface-variant hover:text-on-surface transition-all relative cursor-pointer" id="btn-mobile-hud-more" aria-label="More navigation options">
          <span class="material-symbols-outlined text-[20px]">more_horiz</span>
          <span class="font-label-sm text-label-sm mt-0.5">More</span>
        </button>
      </div>
    </div>
  </nav>

  <!-- ======================================================================
       MOBILE SLIDE-OVER DRAWER
       ====================================================================== -->
  <div class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" id="mobile-drawer-backdrop"></div>
  <aside class="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-surface-container-low z-50 transform translate-x-full transition-transform duration-300 ease-in-out p-5 flex flex-col justify-between overflow-y-auto border-l border-white/[0.08]" id="mobile-drawer" aria-label="Campus Menu Drawer">
    <div class="space-y-5">
      <div class="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[22px]">school</span>
          <span class="font-headline-sm text-headline-sm text-primary font-bold">JUIT Hub</span>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer" id="btn-close-mobile-drawer">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div class="p-3 rounded-xl bg-surface-container flex items-center gap-3" id="mobile-sidebar-user-card">
        <div class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
          <span class="material-symbols-outlined text-[18px]">account_circle</span>
        </div>
        <div class="truncate">
          <p class="font-label-md text-label-md text-on-surface font-semibold truncate">JUIT Scholar</p>
          <p class="font-label-sm text-label-sm text-secondary truncate">Batch 26BT12 · Solan Hills</p>
        </div>
      </div>

      <div class="space-y-1">
        <span class="font-label-sm text-label-sm text-on-surface-variant/70 uppercase tracking-wider font-semibold">All Modules</span>
        <nav class="flex flex-col space-y-1 pt-1">
          <a class="nav-link" href="#dash" data-view="dash"><span class="material-symbols-outlined">cottage</span><span>Home</span></a>
          <a class="nav-link" href="#timetable" data-view="timetable"><span class="material-symbols-outlined">calendar_today</span><span>Classes & Timetable</span></a>
          <a class="nav-link" href="#campus" data-view="campus"><span class="material-symbols-outlined">explore</span><span>Campus Wayfinding</span></a>
          <a class="nav-link" href="#mess" data-view="mess"><span class="material-symbols-outlined">restaurant</span><span>Annapurna Dining</span></a>
          <a class="nav-link" href="#resources" data-view="resources"><span class="material-symbols-outlined">menu_book</span><span>Academic Vault</span></a>
          <a class="nav-link" href="#utilities" data-view="utilities"><span class="material-symbols-outlined">calculate</span><span>Student Utilities</span></a>
          <a class="nav-link" href="#announcements" data-view="announcements"><span class="material-symbols-outlined">campaign</span><span>Campus Notices</span></a>
          <a class="nav-link" href="#events-clubs" data-view="events-clubs"><span class="material-symbols-outlined">celebration</span><span>Life & Events</span></a>
          <a class="nav-link" href="#bus" data-view="bus"><span class="material-symbols-outlined">directions_bus</span><span>NH-5 Bus Transit</span></a>
          <a class="nav-link" href="#calendar" data-view="calendar"><span class="material-symbols-outlined">date_range</span><span>Academic Calendar</span></a>
          <a class="nav-link" href="#academics" data-view="academics"><span class="material-symbols-outlined">checklist</span><span>Attendance Tracker</span></a>
          <a class="nav-link" href="#portals" data-view="portals"><span class="material-symbols-outlined">hub</span><span>Campus Portals</span></a>
        </nav>
      </div>
    </div>

    <div class="pt-4 border-t border-white/[0.06] space-y-3">
      <a href="#settings" data-view="settings" class="nav-link"><span class="material-symbols-outlined">tune</span><span>Preferences</span></a>
      <a href="#admin" data-view="admin" class="nav-link"><span class="material-symbols-outlined">lock</span><span>Admin Portal</span></a>
    </div>
  </aside>

  <!-- ======================================================================
       MODALS: SEARCH, NOTIFICATIONS, PDF PREVIEW, ROUTE, ONBOARDING
       ====================================================================== -->
  <!-- Search Modal -->
  <div class="hidden fixed inset-0 modal-backdrop z-50 flex items-start justify-center pt-20 px-4" id="search-modal-backdrop">
    <div class="modal-card w-full max-w-xl p-5 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Campus Search</h3>
        <button type="button" class="text-on-surface-variant hover:text-primary cursor-pointer" id="btn-close-search-modal">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <input type="text" id="search-modal-input" placeholder="Search subjects, faculty, classrooms, mess, bus..." class="w-full bg-surface-container-lowest p-3 rounded-xl border border-white/[0.08] text-on-surface focus:outline-none focus:border-primary" />
      <div class="max-h-60 overflow-y-auto space-y-2" id="search-modal-results"></div>
    </div>
  </div>

  <!-- Notification Drawer -->
  <aside class="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-surface-container-low z-50 transform translate-x-full transition-transform duration-300 p-5 flex flex-col justify-between border-l border-white/[0.08]" id="notification-drawer">
    <div class="space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Dispatches & Alerts</h3>
        <div class="flex items-center gap-2">
          <button type="button" id="btn-mark-all-read" class="text-xs text-primary hover:underline">Mark read</button>
          <button type="button" class="text-on-surface-variant hover:text-primary cursor-pointer" id="btn-close-notif-drawer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
      <div class="space-y-2 overflow-y-auto max-h-[75vh]" id="notification-items-list"></div>
    </div>
  </aside>

  <!-- PDF Preview Modal -->
  <div class="hidden fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4" id="pdf-preview-modal">
    <div class="modal-card w-full max-w-4xl h-[85vh] p-4 flex flex-col justify-between">
      <div class="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold truncate" id="preview-modal-title">Resource Preview</h3>
        <div class="flex items-center gap-2">
          <a href="#" id="preview-modal-newtab" target="_blank" class="text-xs text-on-surface-variant hover:text-primary">New Tab</a>
          <a href="#" id="preview-modal-download" class="btn-attendance-toggle attended" download>Download</a>
          <button type="button" id="preview-modal-close" class="text-on-surface-variant hover:text-primary cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
      <div class="flex-1 w-full mt-2 bg-surface-container-lowest rounded-lg overflow-hidden">
        <iframe id="preview-modal-iframe" class="w-full h-full border-0"></iframe>
      </div>
    </div>
  </div>

  <!-- Route Navigation Modal -->
  <div class="hidden fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4" id="map-route-modal">
    <div class="modal-card w-full max-w-md p-5 space-y-4" id="map-route-modal-card">
      <div class="flex items-center justify-between">
        <h3 class="font-headline-sm text-headline-sm font-semibold">Campus Route</h3>
        <button type="button" id="btn-close-route-modal" class="text-on-surface-variant hover:text-primary cursor-pointer"><span class="material-symbols-outlined">close</span></button>
      </div>
      <div class="space-y-2 text-sm">
        <div class="flex items-center gap-2"><span>Start:</span><strong id="route-start-point" class="text-primary">AB1</strong></div>
        <div class="flex items-center gap-2"><span>Dest:</span><strong id="route-dest-point" class="text-secondary">CR-02</strong></div>
        <div class="flex gap-2 pt-1">
          <button type="button" id="btn-route-fast" class="px-2 py-1 rounded bg-surface-container text-xs">Fast</button>
          <button type="button" id="btn-route-accessible" class="px-2 py-1 rounded bg-surface-container text-xs">Accessible</button>
        </div>
      </div>
      <div id="route-steps-container" class="space-y-1.5 max-h-48 overflow-y-auto text-xs text-on-surface-variant"></div>
      <button type="button" id="btn-view-route-details" class="btn-attendance-toggle attended w-full justify-center">Show Full Route Details</button>
    </div>
  </div>

  <!-- Onboarding Modal -->
  <div class="hidden fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4" id="onboarding-modal-backdrop">
    <div class="modal-card w-full max-w-md p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[24px]">school</span>
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Welcome to JUIT Hub</h3>
        </div>
        <button type="button" id="btn-close-onboarding-modal" class="text-on-surface-variant hover:text-primary cursor-pointer"><span class="material-symbols-outlined">close</span></button>
      </div>
      <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
        Personalize your daily timetable, Annapurna dining views, and attendance tracking with your academic details.
      </p>
      <form id="onboarding-profile-form" class="space-y-3">
        <div>
          <label class="text-xs text-on-surface-variant block mb-1">Programme</label>
          <select id="onboard-programme-select" class="select-styled w-full"></select>
        </div>
        <div>
          <label class="text-xs text-on-surface-variant block mb-1">Branch</label>
          <select id="onboard-branch-select" class="select-styled w-full"></select>
        </div>
        <div>
          <label class="text-xs text-on-surface-variant block mb-1">Semester</label>
          <select id="onboard-sem-select" class="select-styled w-full"></select>
        </div>
        <div class="hidden">
          <select id="onboard-role-select"></select>
        </div>
        <button type="submit" class="btn-attendance-toggle attended w-full justify-center py-2.5 font-bold">Enter JUIT Hub</button>
      </form>
    </div>
  </div>

  <!-- Universal Modal Container -->
  <div class="hidden fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4" id="universal-modal">
    <div class="modal-card w-full max-w-lg p-5" id="universal-modal-content"></div>
  </div>

  <!-- Inline Helper Scripts -->
  <script>
    function toggleAlarm(btn) {
      const icon = document.getElementById('alarmIcon');
      const text = document.getElementById('alarmText');
      const isSet = btn.classList.contains('bg-secondary');
      if (!isSet) {
        btn.className = "inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md active:scale-95 transition-all shadow-sm font-bold cursor-pointer";
        if (icon) icon.textContent = 'alarm_on';
        if (text) text.textContent = 'Alarm Set for 8:15 AM';
      } else {
        btn.className = "inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md active:scale-95 transition-all shadow-sm font-bold cursor-pointer";
        if (icon) icon.textContent = 'alarm';
        if (text) text.textContent = 'Set 8:15 AM Alarm';
      }
    }
  </script>

  <!-- Application Controllers & Data -->
  <script src="data/juit_data.js"></script>
  <script src="js/theme.js"></script>
  <script src="js/timetable.js"></script>
  <script src="js/mess.js"></script>
  <script src="js/map.js"></script>
  <script src="js/resources.js"></script>
  <script src="js/utilities.js"></script>
  <script src="js/announcements.js"></script>
  <script src="js/events-clubs.js"></script>
  <script src="js/calendar.js"></script>
  <script src="js/academics.js"></script>
  <script src="js/portals.js"></script>
  <script src="js/admin.js"></script>
  <script src="js/bus-guide.js"></script>
  <script src="js/app.js"></script>
</body>

</html>
'''

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("index.html successfully updated! Size:", len(html))

if __name__ == '__main__':
    build_complete()
