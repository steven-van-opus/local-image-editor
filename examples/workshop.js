'use strict';

// Original fictional dashboard used by the built-in sample.
const workshopSample = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760">
  <defs>
    <style>
      text { font-family: system-ui, sans-serif; fill: #222f29 }
      .title { font-size: 42px; font-weight: 700; letter-spacing: -1.6px }
      .brand { font-size: 23px; font-weight: 750; letter-spacing: -.5px }
      .heading { font-size: 23px; font-weight: 670 }
      .body { font-size: 17px }
      .label { font-size: 13px; font-weight: 680; letter-spacing: 1.25px }
      .value { font-size: 32px; font-weight: 700; letter-spacing: -.75px }
      .muted { fill: #55685f }
      .forest { fill: #154a3b }
      .light { fill: #ebf8ef }
    </style>
  </defs>
  <rect width="1200" height="760" fill="#edede5"/>
  <rect x="24" y="24" width="1152" height="712" rx="20" fill="#fffef9" stroke="#d5dcd2"/>
  <g fill="#8d9e94">
    <circle cx="48" cy="48" r="4"/><circle cx="65" cy="48" r="4"/><circle cx="82" cy="48" r="4"/>
  </g>
  <rect x="443" y="37" width="314" height="22" rx="11" fill="#edeee7"/>
  <text x="600" y="52" text-anchor="middle" font-size="11" class="muted">workspace.fieldwork.example</text>
  <path d="M24 72h1152" stroke="#e0e4d8"/>
  <path d="M250 72v664" stroke="#e0e4d8"/>
  <rect x="49" y="96" width="33" height="33" rx="8" fill="#154a3b"/>
  <path d="M58 117c3-10 9-12 16-12-1 8-5 14-13 14m-2 2 10-10" fill="none" stroke="#def3c4" stroke-width="2" stroke-linecap="round"/>
  <text x="94" y="121" class="brand">Fieldwork</text>
  <text x="50" y="173" class="label muted">WORKSPACE</text>
  <rect x="41" y="189" width="193" height="43" rx="9" fill="#e5efe0"/>
  <circle cx="63" cy="210" r="5" fill="#3d705c"/>
  <text x="81" y="216" class="body forest">Overview</text>
  <text x="81" y="263" class="body muted">Schedule</text>
  <text x="81" y="309" class="body muted">People</text>
  <text x="81" y="355" class="body muted">Notes</text>
  <path d="M46 657h179" stroke="#e0e4d8"/>
  <circle cx="64" cy="687" r="16" fill="#ddebd9"/>
  <text x="64" y="692" text-anchor="middle" font-size="12" font-weight="700" class="forest">IE</text>
  <text x="89" y="685" font-size="14" font-weight="650">Indigo Ellis</text>
  <text x="89" y="705" font-size="12" class="muted">Workshop coordinator</text>

  <text x="287" y="120" class="label muted">AUGUST WORKSHOP</text>
  <text x="286" y="173" class="title">Workshop overview</text>
  <text x="287" y="211" class="body muted">Preparations for the summer ceramics session.</text>
  <rect x="1003" y="140" width="138" height="36" rx="18" fill="#e6f0e2"/>
  <circle cx="1020" cy="158" r="4" fill="#69905f"/>
  <text x="1031" y="163" font-size="14" class="forest">Open for signup</text>
  <rect x="287" y="243" width="854" height="157" rx="15" fill="#194f40"/>

  <path d="M929 243c22 39 51 74 99 60 26-7 43-28 55-60m-90 157c0-57 29-86 79-83 28 1 49 16 69 30m-235 53c16-29 25-63 10-94-12-24-32-43-60-63m214 157c23-16 45-18 71-10" fill="none" stroke="#78a88a" stroke-width="1.5" opacity=".8"/>
  <text x="312" y="278" class="label light">NEXT SESSION</text>
  <text x="312" y="321" class="heading light">Hand-built clay vessels</text>
  <text x="312" y="352" class="body light">Saturday, August 22 · Studio North</text>

  <g fill="#f4f5ed" stroke="#e4e8df">
    <rect x="287" y="422" width="269" height="105" rx="12"/>
    <rect x="573" y="422" width="269" height="105" rx="12"/>
    <rect x="859" y="422" width="282" height="105" rx="12"/>
  </g>
  <text x="308" y="454" class="label muted">PLACES FILLED</text>
  <text x="308" y="499" class="value">12 / 16</text>
  <text x="594" y="454" class="label muted">MATERIALS</text>
  <text x="594" y="499" class="value">Ready</text>
  <text x="880" y="454" class="label muted">CHECK-IN</text>
  <text x="880" y="499" class="value">9:30 am</text>

  <text x="288" y="568" class="heading">Day-of details</text>
  <path d="M288 590h852m-852 51h852m-852 51h852" stroke="#e0e4d8"/>
  <text x="288" y="621" class="body muted">Coordinator email</text>
  <text x="604" y="621" class="body">indigo@fieldwork.example</text>
  <text x="288" y="672" class="body muted">Studio access code</text>
  <text x="604" y="672" class="body" font-weight="650" letter-spacing="1.5">849261</text>
</svg>
`;
