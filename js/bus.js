/**
 * JUIT Bus Travel Guide Controller & Structured Route Knowledge Base
 * Jaypee University of Information Technology (JUIT), Waknaghat
 * 
 * Strict Philosophy:
 * - NO fake real-time bus tracking, fake GPS, or fake arrival countdowns.
 * - Practical visual transit guide: Where to go, which direction, which bus, where to change, and where to get off.
 */

const JUIT_BUS_ROUTES = [
  {
    id: 'shimla',
    name: 'Shimla',
    tagline: 'Himachal Capital, Mall Road, Ridge & Heritage Hub',
    category: 'State Capital',
    tags: ['shimla', 'isbt', 'tutikandi', 'old bus stand', 'mall road', 'ridge', 'cart road'],
    direction: 'uphill',
    directionLabel: '▲ Uphill / Shimla-Bound Side',
    highwaySide: 'Stand on the Uphill / Mountain side of NH-5 at Waknaghat (towards Shoghi & Shimla)',
    busBoardText: 'SHIMLA / SHIMLA ISBT / OLD BUS STAND',
    conductorPhrase: '“Bhaiya, Shimla jayegi? ISBT ya Old Bus Stand?”',
    transfers: 0,
    transferPoint: null,
    approxTime: '~35–50 minutes',
    approxFare: '₹35 – ₹50 (HRTC / Private Ordinary)',
    typicalFrequency: 'High — buses every 10–20 mins from 6:30 AM to 8:30 PM',
    simpleRouteSummary: 'JUIT Campus → Waknaghat Junction → Board Shimla-bound Bus → Shimla ISBT Tutikandi / Old Bus Stand',
    route: [
      {
        step: 1,
        title: 'JUIT Campus',
        instruction: 'Walk or take a shared local cab/shuttle up from JUIT gate to Waknaghat Junction on NH-5 (~2.5 km, ~25 min walk or 5 min cab).',
        type: 'start',
        icon: 'school',
        badge: 'Origin'
      },
      {
        step: 2,
        title: 'Waknaghat Junction (NH-5 Highway)',
        instruction: 'Cross safely to the UPHILL (mountain side) of the highway where the waiting shelter and roadside dhabas are located.',
        type: 'highway',
        icon: 'signpost',
        badge: 'Boarding Point'
      },
      {
        step: 3,
        title: 'Board Shimla-Bound Bus',
        instruction: 'Flag down any HRTC (green/blue) or private bus showing "SHIMLA" on the destination display. Confirm with conductor: “Shimla jayegi?”.',
        type: 'board',
        icon: 'directions_bus',
        badge: 'Direct Service'
      },
      {
        step: 4,
        title: 'Shoghi & Tara Devi Bypass',
        instruction: 'Bus ascends through Shoghi toll and Tara Devi hill ridge. Stay seated until Shimla outskirts.',
        type: 'transit',
        icon: 'altitude',
        badge: 'Transit'
      },
      {
        step: 5,
        title: 'Arrival in Shimla (Tutikandi ISBT or Old Bus Stand)',
        instruction: 'Get off at Shimla ISBT Tutikandi (major terminal) or Old Bus Stand on Cart Road. Connect to city lifts for Mall Road.',
        type: 'finish',
        icon: 'location_on',
        badge: 'Terminus'
      }
    ],
    arrivalPoints: [
      {
        name: 'Shimla ISBT Tutikandi (New Bus Stand)',
        desc: 'Main multi-storey terminal. Best if connecting to Delhi/Chandigarh/Manali or if heading to town via the municipal lift / local shuttle.'
      },
      {
        name: 'Shimla Old Bus Stand (Cart Road)',
        desc: 'Located closer to central Shimla and Lakkar Bazaar. Some local ordinary HRTC buses stop or terminate here directly.'
      }
    ],
    reverseRoute: {
      title: 'Shimla → JUIT Campus (Return Journey)',
      steps: [
        'Head to Shimla ISBT Tutikandi (Ground/Lower departure bays) or Old Bus Stand.',
        'Look for buses heading towards Solan, Chandigarh, Kalka, or Delhi (downhill highway route).',
        'Before boarding, explicitly ask the conductor: “Bhaiya, Waknaghat utaroge?” (confirm Waknaghat stoppage).',
        'De-board at Waknaghat Junction on NH-5.',
        'Walk down the scenic JUIT road or take a local taxi/shuttle back to campus gate.'
      ]
    },
    missedBusAdvice: 'Shimla is the most frequent highway corridor from Waknaghat. If a crowded bus does not stop, simply wait 10–15 minutes for the next HRTC or private service. Shared Maruti cabs also frequent this stretch.',
    travelTips: [
      'Traffic between Shoghi and Tutikandi can slow down during tourist weekends and snow seasons.',
      'From Tutikandi ISBT, local HRTC city mudrika buses run every 10 mins to the Lift (Cart Road) for ₹10.',
      'Last regular buses back from Shimla towards Waknaghat depart Tutikandi around 9:00 PM – 9:30 PM.'
    ]
  },
  {
    id: 'solan',
    name: 'Solan',
    tagline: 'Mushroom City, Mall Road, Shoolini Temple & Markets',
    category: 'Commercial Hub',
    tags: ['solan', 'saproon', 'old bus stand', 'mall road', 'shoolini', 'kotlanala'],
    direction: 'downhill',
    directionLabel: '▼ Downhill / Solan-Bound Side',
    highwaySide: 'Stand on the Downhill / Valley side of NH-5 at Waknaghat (towards Kandaghat & Solan)',
    busBoardText: 'SOLAN / CHANDIGARH / DELHI / KALKA',
    conductorPhrase: '“Bhaiya, Solan Old Bus Stand jaa rahi hai?”',
    transfers: 0,
    transferPoint: null,
    approxTime: '~35–45 minutes',
    approxFare: '₹30 – ₹45 (HRTC / Private)',
    typicalFrequency: 'Very High — buses every 10–15 mins throughout the day',
    simpleRouteSummary: 'JUIT Campus → Waknaghat Junction → Board Downhill Bus → Solan Old Bus Stand / Saproon',
    route: [
      {
        step: 1,
        title: 'JUIT Campus to Highway',
        instruction: 'Reach Waknaghat Junction from campus via link road (~2.5 km).',
        type: 'start',
        icon: 'school',
        badge: 'Origin'
      },
      {
        step: 2,
        title: 'Waknaghat Downhill Side',
        instruction: 'Stand on the valley side of NH-5 (facing south/downhill). Buses arriving from Shimla slow down here to pick up commuters.',
        type: 'highway',
        icon: 'signpost',
        badge: 'Boarding Point'
      },
      {
        step: 3,
        title: 'Board any Solan/Chandigarh Bus',
        instruction: 'Almost all buses heading towards Solan, Chandigarh, or Delhi pass through Solan. Ask conductor: “Solan jayegi?”.',
        type: 'board',
        icon: 'directions_bus',
        badge: 'Direct Service'
      },
      {
        step: 4,
        title: 'Kandaghat & Salogra Descent',
        instruction: 'Bus passes Kandaghat junction and Salogra railway crossing before entering Solan valley.',
        type: 'transit',
        icon: 'route',
        badge: 'En Route'
      },
      {
        step: 5,
        title: 'Solan De-boarding',
        instruction: 'Get down at Solan Old Bus Stand (closer to Mall Road & market) or New ISBT Saproon (on the bypass).',
        type: 'finish',
        icon: 'location_on',
        badge: 'Terminus'
      }
    ],
    arrivalPoints: [
      {
        name: 'Solan Old Bus Stand',
        desc: 'Heart of the town, 2-minute walk to Solan Mall Road, cafes, bookshops, and banks.'
      },
      {
        name: 'New ISBT Saproon',
        desc: 'Located on the highway bypass. Inter-state long-distance buses generally halt here.'
      }
    ],
    reverseRoute: {
      title: 'Solan → JUIT Campus (Return Journey)',
      steps: [
        'Reach Solan Old Bus Stand or Saproon Bypass boarding point.',
        'Board any bus displaying "SHIMLA" (uphill direction).',
        'Tell the conductor: “Waknaghat ka ticket dena”.',
        'Get down at Waknaghat Junction and descend to JUIT.'
      ]
    },
    missedBusAdvice: 'Buses to Solan are extremely frequent because all downhill traffic from Shimla uses this highway. Local private operators (e.g., Kanwar, New Himachal) also run local shuttles.',
    travelTips: [
      'If you need Solan Mall Road, ensure the bus goes via the Old Bus Stand and not exclusively via the Solan Bypass flyover.',
      'Last regular buses from Solan back to Waknaghat run until approximately 9:30 PM.'
    ]
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh (ISBT 43)',
    tagline: 'Tricity Hub, Metro Transit, Rail & Airport Connections',
    category: 'Transit Hub',
    tags: ['chandigarh', 'isbt 43', 'sector 43', 'sector 17', 'mohali', 'panchkula', 'elante'],
    direction: 'downhill',
    directionLabel: '▼ Downhill / Chandigarh Side',
    highwaySide: 'Stand on the Downhill / Valley side of NH-5 at Waknaghat (towards Solan & Chandigarh)',
    busBoardText: 'CHANDIGARH / ISBT 43 / DELHI',
    conductorPhrase: '“Bhaiya, Chandigarh 43 ISBT jayegi?”',
    transfers: 0,
    transferPoint: null,
    approxTime: '~2.5–3.5 hours',
    approxFare: '₹120 – ₹180 (HRTC / Haryana Roadways Ordinary); ₹280+ (Deluxe)',
    typicalFrequency: 'Regular — direct downhill buses every 20–30 mins',
    simpleRouteSummary: 'JUIT Campus → Waknaghat → Board Chandigarh-bound Downhill Bus → Chandigarh ISBT Sector 43',
    route: [
      {
        step: 1,
        title: 'JUIT Campus to Waknaghat',
        instruction: 'Reach Waknaghat Junction on NH-5.',
        type: 'start',
        icon: 'school',
        badge: 'Origin'
      },
      {
        step: 2,
        title: 'Board Downhill Bus at Waknaghat',
        instruction: 'Stand on the downhill side. Look for buses with destination boards: "CHANDIGARH 43" or "DELHI via CHANDIGARH".',
        type: 'board',
        icon: 'directions_bus',
        badge: 'Boarding Point'
      },
      {
        step: 3,
        title: 'Highway Route (Solan → Dharampur → Parwanoo)',
        instruction: 'Bus descends via Kumarhatti bypass, Dharampur, Jabli, and the Himalayan Expressway through Parwanoo and Pinjore.',
        type: 'transit',
        icon: 'moving',
        badge: 'Himalayan Expressway'
      },
      {
        step: 4,
        title: 'Zirakpur / Tribune Chowk Entrance',
        instruction: 'Bus enters Chandigarh through Panchkula/Tribune Chowk and proceeds straight to Sector 43.',
        type: 'transit',
        icon: 'traffic',
        badge: 'Tricity Entry'
      },
      {
        step: 5,
        title: 'Chandigarh ISBT Sector 43',
        instruction: 'All Himachal buses terminate at ISBT Sector 43 (Bays 1 to 10). From here, CTU local city buses connect to Railway Station, Airport, and Elante Mall.',
        type: 'finish',
        icon: 'location_on',
        badge: 'Terminus'
      }
    ],
    arrivalPoints: [
      {
        name: 'ISBT Sector 43',
        desc: 'Main interstate terminal for all Himachal, Punjab, and Jammu buses. Direct CTU AC city buses to Railway Station and Airport depart right from the terminal.'
      },
      {
        name: 'ISBT Sector 17',
        desc: 'Interstate terminal for Haryana, Delhi, and UP buses. Connect from 43 to 17 via CTU local bus (15 mins).'
      }
    ],
    reverseRoute: {
      title: 'Chandigarh → JUIT Campus (Return Journey)',
      steps: [
        'Go to ISBT Sector 43, Chandigarh.',
        'Head to Himachal Road Transport Corporation (HRTC) counters & bays (Bays 1 through 8).',
        'Board any bus heading towards Shimla, Theog, Rohru, or Rampur.',
        'Tell the conductor: “Waknaghat ka ticket dena” (confirm drop at Waknaghat).',
        'Get off at Waknaghat Junction and proceed to JUIT campus.'
      ]
    },
    missedBusAdvice: 'If there is no direct bus at Waknaghat right away, board any Solan or Dharampur bus, from where Chandigarh buses depart continuously.',
    travelTips: [
      'If travelling on Sunday evening or post-holiday rush, buses can be crowded; board early in the afternoon.',
      'Keep some cash on hand for the fare as roadside conductor POS machines occasionally lose cellular signal in hill tunnels.'
    ]
  },
  {
    id: 'kasauli',
    name: 'Kasauli',
    tagline: 'Pine-scented Cantonment, Sunset Point, Gilbert Trail & Church',
    category: 'Hill Station',
    tags: ['kasauli', 'dharampur', 'sunset point', 'gilbert trail', 'cantonment', 'monkey point'],
    direction: 'downhill',
    directionLabel: '▼ Downhill to Dharampur Transfer',
    highwaySide: 'Stand on the Downhill side at Waknaghat (towards Solan & Dharampur)',
    busBoardText: 'Bus 1: SOLAN / CHANDIGARH / KALKA → Change at DHARAMPUR',
    conductorPhrase: 'Bus 1: “Dharampur utar dena, Kasauli jana hai.” | Bus 2: “Kasauli jayegi?”',
    transfers: 1,
    transferPoint: 'Dharampur Junction',
    approxTime: '~1.5–2 hours total',
    approxFare: '₹60 – ₹90 total (₹40 to Dharampur + ₹20 to Kasauli)',
    typicalFrequency: 'Buses to Dharampur every 15 mins; Dharampur to Kasauli shuttles every 20–30 mins',
    simpleRouteSummary: 'JUIT Campus → Waknaghat → Bus 1 to Dharampur → CHANGE BUS → Bus 2 to Kasauli',
    route: [
      {
        step: 1,
        title: 'JUIT to Waknaghat',
        instruction: 'Reach Waknaghat Junction highway shelter.',
        type: 'start',
        icon: 'school',
        badge: 'Origin'
      },
      {
        step: 2,
        title: 'Board Downhill Bus to Dharampur (BUS 1)',
        instruction: 'Stand on downhill side. Board any bus going towards Solan / Chandigarh / Kalka. Request ticket to Dharampur (~45–55 min).',
        type: 'board',
        icon: 'directions_bus',
        badge: 'Bus 1'
      },
      {
        step: 3,
        title: 'TRANSFER AT DHARAMPUR (Change Here)',
        instruction: 'Get off at Dharampur Chowk (famous for Giani Da Dhaba). Walk 50m towards the Kasauli link road bus stand.',
        type: 'transfer',
        isTransfer: true,
        icon: 'transfer_within_a_station',
        badge: 'TRANSFER POINT'
      },
      {
        step: 4,
        title: 'Board Local Kasauli Shuttle (BUS 2)',
        instruction: 'Board the HRTC local shuttle or shared cab going up to Kasauli (~12 km scenic climb, ~25 min).',
        type: 'board',
        icon: 'airport_shuttle',
        badge: 'Bus 2'
      },
      {
        step: 5,
        title: 'Kasauli Heritage Bus Stand',
        instruction: 'Arrive at the Kasauli Main Bus Stand at Upper Mall road entrance.',
        type: 'finish',
        icon: 'location_on',
        badge: 'Terminus'
      }
    ],
    arrivalPoints: [
      {
        name: 'Kasauli Heritage Bus Stand',
        desc: 'Located right near Christ Church and Heritage Mall road. Motor vehicles beyond this point are restricted.'
      }
    ],
    reverseRoute: {
      title: 'Kasauli → JUIT Campus (Return Journey)',
      steps: [
        'At Kasauli Bus Stand, board a downhill shuttle bus or shared Alto cab to Dharampur Chowk.',
        'At Dharampur, cross over to the Uphill (Shimla-bound) side of NH-5.',
        'Board any Shimla-bound bus (HRTC or private) and ask for Waknaghat drop.',
        'De-board at Waknaghat Junction and return to campus.'
      ]
    },
    missedBusAdvice: 'If you miss the Dharampur-Kasauli local bus, frequent shared Maruti Altos and Eeco vans operate from Dharampur Chowk directly to Kasauli for ₹30–₹40 per passenger.',
    travelTips: [
      'The last regular return bus from Kasauli to Dharampur leaves around 6:00 PM – 6:30 PM. Plan your return accordingly!',
      'Comfortable walking shoes are recommended as Kasauli mall and trails are pedestrian-only.'
    ]
  },
  {
    id: 'chail',
    name: 'Chail',
    tagline: 'World’s Highest Cricket Ground, Chail Palace & Sadhupul',
    category: 'Hill Station',
    tags: ['chail', 'kandaghat', 'sadhupul', 'cricket ground', 'chail palace', 'kali tibba'],
    direction: 'downhill',
    directionLabel: '▼ Downhill to Kandaghat Transfer',
    highwaySide: 'Stand on the Downhill side at Waknaghat (towards Kandaghat)',
    busBoardText: 'Bus 1: KANDAGHAT (Downhill) → Change at KANDAGHAT for CHAIL',
    conductorPhrase: 'Bus 1: “Kandaghat utar dena.” | Bus 2: “Chail jayegi via Sadhupul?”',
    transfers: 1,
    transferPoint: 'Kandaghat Junction',
    approxTime: '~1.5 hours total',
    approxFare: '₹55 – ₹80 total (₹20 to Kandaghat + ₹40 to Chail)',
    typicalFrequency: 'Waknaghat to Kandaghat every 10 mins; Kandaghat to Chail every 45–60 mins',
    simpleRouteSummary: 'JUIT Campus → Waknaghat → Bus 1 to Kandaghat → CHANGE BUS → Bus 2 to Chail (via Sadhupul)',
    route: [
      {
        step: 1,
        title: 'JUIT to Waknaghat',
        instruction: 'Reach Waknaghat Junction.',
        type: 'start',
        icon: 'school',
        badge: 'Origin'
      },
      {
        step: 2,
        title: 'Board Bus to Kandaghat (BUS 1)',
        instruction: 'Take any downhill bus towards Solan/Chandigarh and de-board at Kandaghat (~15–20 mins).',
        type: 'board',
        icon: 'directions_bus',
        badge: 'Bus 1 (12 km)'
      },
      {
        step: 3,
        title: 'TRANSFER AT KANDAGHAT (Change Here)',
        instruction: 'At Kandaghat Bazaar, locate the Chail Road intersection right next to the local bus stop.',
        type: 'transfer',
        isTransfer: true,
        icon: 'transfer_within_a_station',
        badge: 'TRANSFER POINT'
      },
      {
        step: 4,
        title: 'Board Chail-Bound Bus (BUS 2)',
        instruction: 'Board the HRTC local bus heading to Chail via Sadhupul water stream (~29 km, ~1 hour winding valley ascent).',
        type: 'board',
        icon: 'directions_bus',
        badge: 'Bus 2 (29 km)'
      },
      {
        step: 5,
        title: 'Chail Main Bazaar',
        instruction: 'Arrive at Chail Bus Stand. Walk to Chail Palace and cricket ground.',
        type: 'finish',
        icon: 'location_on',
        badge: 'Terminus'
      }
    ],
    arrivalPoints: [
      {
        name: 'Chail Main Bus Stop',
        desc: 'Central bazaar stop. Cabs available for Kali Ka Tibba and Chail Wildlife Sanctuary.'
      },
      {
        name: 'Sadhupul Halt (En Route)',
        desc: 'Famous river dining and bridge stop between Kandaghat and Chail.'
      }
    ],
    reverseRoute: {
      title: 'Chail → JUIT Campus (Return Journey)',
      steps: [
        'Board bus from Chail Bus Stand back down to Kandaghat.',
        'At Kandaghat, walk to the NH-5 highway shelter (Shimla-bound uphill side).',
        'Board any Shimla-bound bus and request drop at Waknaghat.',
        'Get off at Waknaghat Junction and return to campus.'
      ]
    },
    missedBusAdvice: 'If you miss the Kandaghat-Chail HRTC bus, shared local taxis depart Kandaghat station regularly. Alternatively, JUIT students occasionally rent a local cab from Waknaghat directly.',
    travelTips: [
      'Stop at Sadhupul on the way if you want to experience the river stream seating.',
      'Last bus from Chail to Kandaghat leaves around 5:30 PM. Do not delay your return in the evening!'
    ]
  },
  {
    id: 'kufri',
    name: 'Kufri',
    tagline: 'Snow Views, Adventure Valley & Himalayan Nature Park',
    category: 'Adventure & Snow',
    tags: ['kufri', 'fagu', 'adventure', 'snow', 'yak ride', 'himalayan nature park', 'theog'],
    direction: 'uphill',
    directionLabel: '▲ Uphill to Shimla Transfer',
    highwaySide: 'Stand on the Uphill side at Waknaghat (towards Shimla)',
    busBoardText: 'Bus 1: SHIMLA ISBT → Change at SHIMLA for KUFRI / THEOG',
    conductorPhrase: 'Bus 1: “Shimla ISBT” | Bus 2: “Kufri / Dhalli hokar jayegi?”',
    transfers: 1,
    transferPoint: 'Shimla (ISBT Tutikandi or Lakkar Bazaar)',
    approxTime: '~1.5–2 hours total',
    approxFare: '₹70 – ₹100 total',
    typicalFrequency: 'Waknaghat to Shimla every 15 mins; Shimla to Kufri every 20 mins',
    simpleRouteSummary: 'JUIT Campus → Waknaghat → Bus 1 to Shimla → CHANGE BUS → Bus 2 to Kufri (via Sanjauli/Dhalli)',
    route: [
      {
        step: 1,
        title: 'Waknaghat to Shimla (BUS 1)',
        instruction: 'Board uphill bus to Shimla ISBT Tutikandi (~45 mins).',
        type: 'board',
        icon: 'directions_bus',
        badge: 'Bus 1'
      },
      {
        step: 2,
        title: 'TRANSFER IN SHIMLA (Change Here)',
        instruction: 'At Shimla, board any bus departing for Theog, Rampur, Narkanda, or Kufri (from ISBT Tutikandi or Lakkar Bazaar).',
        type: 'transfer',
        isTransfer: true,
        icon: 'transfer_within_a_station',
        badge: 'TRANSFER POINT'
      },
      {
        step: 3,
        title: 'Sanjauli & Dhalli Tunnel Route',
        instruction: 'Bus crosses through the new Dhalli tunnel and climbs into the pine forests leading to Kufri ridge.',
        type: 'transit',
        icon: 'filter_drama',
        badge: 'Mountain Climb'
      },
      {
        step: 4,
        title: 'Kufri Main Chowk',
        instruction: 'De-board at Kufri junction. Access horse riding point, Adventure Valley, and Mahasu Peak.',
        type: 'finish',
        icon: 'location_on',
        badge: 'Terminus'
      }
    ],
    arrivalPoints: [
      {
        name: 'Kufri Chowk (Highway Stop)',
        desc: 'Main drop-off on Hindustan-Tibet road. Walk directly to amusement parks and Mahasu trail.'
      }
    ],
    reverseRoute: {
      title: 'Kufri → JUIT Campus (Return Journey)',
      steps: [
        'At Kufri Chowk, flag down any downhill bus heading towards Shimla.',
        'At Shimla ISBT Tutikandi, change to a Solan or Chandigarh bound bus.',
        'De-board at Waknaghat Junction and return to campus.'
      ]
    },
    missedBusAdvice: 'Any bus coming downhill from Rampur, Kinnaur, Rohru, or Theog passes through Kufri towards Shimla, providing very high frequency during daytime hours.',
    travelTips: [
      'In January and February, heavy snow can cause traffic jams between Dhalli and Kufri; check weather beforehand.',
      'Wear warm layers even in summer months as Kufri sits at ~2,720m (much cooler than Waknaghat).'
    ]
  },
  {
    id: 'narkanda',
    name: 'Narkanda',
    tagline: 'Hatu Peak, Apple Orchards, Skiing & Himalayan Panorama',
    category: 'Adventure & Snow',
    tags: ['narkanda', 'hatu peak', 'theog', 'skiing', 'apple orchards', 'rampur highway'],
    direction: 'uphill',
    directionLabel: '▲ Uphill via Shimla & Theog',
    highwaySide: 'Stand on the Uphill side at Waknaghat (towards Shimla)',
    busBoardText: 'Bus 1 to SHIMLA → Bus 2 to RAMPUR / NARKANDA',
    conductorPhrase: '“Bhaiya, Narkanda hokar jayegi na?”',
    transfers: 1,
    transferPoint: 'Shimla (ISBT / Lakkar Bazaar)',
    approxTime: '~3–3.5 hours total',
    approxFare: '₹140 – ₹190 total',
    typicalFrequency: 'Buses to Narkanda/Rampur depart Shimla every 30–45 mins',
    simpleRouteSummary: 'JUIT Campus → Waknaghat → Shimla ISBT → CHANGE BUS → Bus 2 towards Rampur (Drop at Narkanda)',
    route: [
      {
        step: 1,
        title: 'Waknaghat to Shimla ISBT',
        instruction: 'Take morning uphill bus from Waknaghat to Shimla Tutikandi ISBT (~45 mins).',
        type: 'board',
        icon: 'directions_bus',
        badge: 'Bus 1'
      },
      {
        step: 2,
        title: 'TRANSFER AT SHIMLA',
        instruction: 'Find bays for Rampur / Kinnaur / Rohru / Kumarsain. Confirm the bus goes via Narkanda.',
        type: 'transfer',
        isTransfer: true,
        icon: 'transfer_within_a_station',
        badge: 'TRANSFER POINT'
      },
      {
        step: 3,
        title: 'NH-5 Ascent via Theog',
        instruction: 'The bus follows NH-5 past Fagu, Theog, and Matiana through scenic apple belt ridges.',
        type: 'transit',
        icon: 'landscape',
        badge: 'Apple Valley'
      },
      {
        step: 4,
        title: 'Narkanda Main Bazaar',
        instruction: 'Get off at Narkanda Chowk (~2,700m). Base point for Hatu Peak trek (7 km) and ski slopes.',
        type: 'finish',
        icon: 'location_on',
        badge: 'Terminus'
      }
    ],
    arrivalPoints: [
      {
        name: 'Narkanda Bazaar',
        desc: 'Central junction with local cafes, guest houses, and the road leading up to Hatu Mata Temple.'
      }
    ],
    reverseRoute: {
      title: 'Narkanda → JUIT Campus (Return Journey)',
      steps: [
        'At Narkanda Bazaar, board any bus heading downhill to Shimla.',
        'At Shimla ISBT Tutikandi, board a Solan/Chandigarh bus to Waknaghat.',
        'Get down at Waknaghat and return to campus.'
      ]
    },
    missedBusAdvice: 'If late, take any bus to Theog, then transfer to a local Shimla shuttle. Long-distance buses from Kinnaur/Rampur run through the night.',
    travelTips: [
      'Start early in the morning (around 7:30 AM – 8:00 AM from Waknaghat) to enjoy daylight at Hatu Peak.',
      'Hatu Peak trek is ~7 km uphill from Narkanda bazaar; shared local jeeps are available on weekends.'
    ]
  },
  {
    id: 'kalka',
    name: 'Kalka (Railway Station)',
    tagline: 'UNESCO World Heritage Toy Train Terminal & Broad Gauge Hub',
    category: 'Transit Hub',
    tags: ['kalka', 'railway', 'toy train', 'shatabdi', 'howrah mail', 'delhi trains'],
    direction: 'downhill',
    directionLabel: '▼ Downhill towards Kalka/Pinjore',
    highwaySide: 'Stand on the Downhill side at Waknaghat (towards Solan & Kalka)',
    busBoardText: 'KALKA / PINJORE / CHANDIGARH',
    conductorPhrase: '“Kalka Railway Station mod / bypass utar dena.”',
    transfers: 0,
    transferPoint: null,
    approxTime: '~2–2.5 hours',
    approxFare: '₹80 – ₹130 (HRTC / Haryana Roadways)',
    typicalFrequency: 'Regular — downhill buses every 20–30 mins',
    simpleRouteSummary: 'JUIT Campus → Waknaghat → Board Downhill Bus to Kalka / Pinjore Bypass → Kalka Station',
    route: [
      {
        step: 1,
        title: 'JUIT to Waknaghat',
        instruction: 'Reach Waknaghat Junction.',
        type: 'start',
        icon: 'school',
        badge: 'Origin'
      },
      {
        step: 2,
        title: 'Board Downhill Bus at Waknaghat',
        instruction: 'Board bus displaying Kalka, Pinjore, or Chandigarh. Request drop at Kalka bypass / Kalka crossing.',
        type: 'board',
        icon: 'directions_bus',
        badge: 'Direct Service'
      },
      {
        step: 3,
        title: 'Descent via Parwanoo',
        instruction: 'Bus leaves the mountain curves after Parwanoo and enters the plains at Pinjore/Kalka border.',
        type: 'transit',
        icon: 'straighten',
        badge: 'Plains Entry'
      },
      {
        step: 4,
        title: 'Kalka Railway Station / Bus Stand',
        instruction: 'Get off at Kalka Bus Stand or Kalka Railway Station Chowk (2 mins to railway station entrance).',
        type: 'finish',
        icon: 'train',
        badge: 'Railhead'
      }
    ],
    arrivalPoints: [
      {
        name: 'Kalka Railway Station (KLK)',
        desc: 'Broad gauge terminal for New Delhi Kalka Shatabdi Express, Netaji Express, and Paschim Express, as well as the UNESCO Toy Train.'
      }
    ],
    reverseRoute: {
      title: 'Kalka → JUIT Campus (Return Journey)',
      steps: [
        'At Kalka Railway Station or Kalka Bypass, board any HRTC bus going uphill to Shimla.',
        'Tell the conductor: “Waknaghat utarna hai”.',
        'Get off at Waknaghat Junction and return to campus.'
      ]
    },
    missedBusAdvice: 'If a direct Kalka bus is unavailable, take any Chandigarh-bound bus, get down at Pinjore or Dharampur, and take a local connecting auto/bus to Kalka Station.',
    travelTips: [
      'If catching the early morning Kalka Shatabdi (06:15 AM departure), leave JUIT the previous evening or arrange a private taxi.',
      'Kalka Station has cloakroom and waiting room facilities for rail passengers.'
    ]
  },
  {
    id: 'delhi',
    name: 'Delhi (ISBT Kashmere Gate)',
    tagline: 'National Capital, Metro Network, New Delhi Station & IGI Airport',
    category: 'Inter-State',
    tags: ['delhi', 'kashmere gate', 'isbt', 'new delhi station', 'igi airport', 'metro'],
    direction: 'downhill',
    directionLabel: '▼ Downhill via Chandigarh or Direct Highway Bus',
    highwaySide: 'Stand on the Downhill side at Waknaghat (towards Chandigarh & Delhi)',
    busBoardText: 'Strategy A: CHANDIGARH 43 | Strategy B: DELHI ISBT (Direct)',
    conductorPhrase: '“Bhaiya, Delhi Kashmere Gate direct jayegi?”',
    transfers: 1,
    transferPoint: 'Chandigarh ISBT (Recommended)',
    approxTime: '~7–8.5 hours total',
    approxFare: '₹380 – ₹550 (Ordinary / Semi-Deluxe); ₹750+ (AC Volvo)',
    typicalFrequency: 'Via Chandigarh: departures every 15–20 mins; Direct Shimla-Delhi buses pass Waknaghat every 1–2 hours',
    simpleRouteSummary: 'Recommended: JUIT → Waknaghat → Chandigarh ISBT 43 → Change to Delhi Express → Delhi ISBT Kashmere Gate',
    route: [
      {
        step: 1,
        title: 'JUIT to Waknaghat',
        instruction: 'Reach Waknaghat Junction with your luggage.',
        type: 'start',
        icon: 'school',
        badge: 'Origin'
      },
      {
        step: 2,
        title: 'Stage 1: Waknaghat to Chandigarh ISBT 43',
        instruction: 'Board downhill bus to Chandigarh ISBT Sector 43 (~3 hours). This is the fastest and most flexible connection.',
        type: 'board',
        icon: 'directions_bus',
        badge: 'Stage 1'
      },
      {
        step: 3,
        title: 'TRANSFER AT CHANDIGARH ISBT',
        instruction: 'At Chandigarh, direct buses to Delhi ISBT Kashmere Gate depart every 15–20 minutes (Haryana Roadways, Punjab Roadways, and HRTC).',
        type: 'transfer',
        isTransfer: true,
        icon: 'transfer_within_a_station',
        badge: 'MAJOR HUB'
      },
      {
        step: 4,
        title: 'Stage 2: Chandigarh to Delhi (GT Road NH-44)',
        instruction: 'Direct 4.5-hour highway run down NH-44 via Ambala, Kurukshetra, Karnal, Panipat, and Murthal dhabas.',
        type: 'transit',
        icon: 'navigation',
        badge: 'NH-44 Corridor'
      },
      {
        step: 5,
        title: 'Arrival at Delhi ISBT Kashmere Gate',
        instruction: 'All state buses arrive at Maharana Pratap ISBT Kashmere Gate, with direct access to Delhi Metro Yellow, Red, and Violet lines.',
        type: 'finish',
        icon: 'location_on',
        badge: 'Terminus'
      }
    ],
    arrivalPoints: [
      {
        name: 'ISBT Kashmere Gate, Delhi',
        desc: 'Direct underground interchange for Delhi Metro Red, Yellow, and Violet Lines. Easy access to New Delhi Railway Station (10 mins via Yellow Line).'
      }
    ],
    reverseRoute: {
      title: 'Delhi → JUIT Campus (Return Journey)',
      steps: [
        'Option 1 (Fastest): Board any Chandigarh bus from ISBT Kashmere Gate → At Chandigarh ISBT 43, switch to a Shimla-bound bus to Waknaghat.',
        'Option 2 (Direct): Book an overnight HRTC Volvo or Ordinary bus from Delhi ISBT Kashmere Gate to Shimla, and notify conductor to drop you at Waknaghat Junction early morning.'
      ]
    },
    missedBusAdvice: 'Buses between Chandigarh and Delhi operate 24 hours a day with virtually zero waiting time. If you miss a specific departure, the next bus departs within minutes.',
    travelTips: [
      'For overnight direct travel, pre-book HRTC Volvo or Deluxe seats on the official portal (hrtchp.com) to guarantee a seat.',
      'Delhi Metro opens at 05:30 AM from Kashmere Gate Station for onward transit across NCR.'
    ]
  },
  {
    id: 'manali',
    name: 'Manali',
    tagline: 'Kullu Valley, Rohtang Pass, Solang Valley & Atal Tunnel',
    category: 'Adventure & Snow',
    tags: ['manali', 'kullu', 'mandi', 'atal tunnel', 'solang', 'rohtang', 'old manali'],
    direction: 'uphill',
    directionLabel: '▲ Uphill via Shimla ISBT or Mandi',
    highwaySide: 'Stand on the Uphill side at Waknaghat (towards Shimla)',
    busBoardText: 'Bus 1 to SHIMLA ISBT → Bus 2 to MANALI',
    conductorPhrase: '“Bhaiya, Manali wali bus Shimla ISBT se kab nikalti hai?”',
    transfers: 1,
    transferPoint: 'Shimla ISBT Tutikandi',
    approxTime: '~7.5–9 hours total',
    approxFare: '₹450 – ₹650 (HRTC Ordinary); ₹900+ (Volvo / Deluxe)',
    typicalFrequency: 'Morning & evening long-distance departures from Shimla ISBT',
    simpleRouteSummary: 'JUIT Campus → Waknaghat → Shimla ISBT Tutikandi → CHANGE BUS → Long-distance bus to Kullu/Manali',
    route: [
      {
        step: 1,
        title: 'Waknaghat to Shimla ISBT',
        instruction: 'Take early morning uphill bus from Waknaghat to Shimla Tutikandi ISBT (~45 mins).',
        type: 'board',
        icon: 'directions_bus',
        badge: 'Bus 1'
      },
      {
        step: 2,
        title: 'TRANSFER AT SHIMLA ISBT',
        instruction: 'Go to the long-distance departure bay at Tutikandi. Board the HRTC Shimla-Manali service (via Bilaspur/Mandi).',
        type: 'transfer',
        isTransfer: true,
        icon: 'transfer_within_a_station',
        badge: 'TRANSFER POINT'
      },
      {
        step: 3,
        title: 'Valley Route via Mandi & Pandoh',
        instruction: 'Scenic journey through Mandi, Pandoh Dam tunnel corridor, Aut tunnel, and the Beas river valley.',
        type: 'transit',
        icon: 'water',
        badge: 'Beas Valley'
      },
      {
        step: 4,
        title: 'Kullu & Manali Private/HRTC Stand',
        instruction: 'Bus passes through Kullu town and terminates at Manali Private Bus Stand / Mall Road.',
        type: 'finish',
        icon: 'location_on',
        badge: 'Terminus'
      }
    ],
    arrivalPoints: [
      {
        name: 'Manali Bus Stand (Mall Road)',
        desc: 'Walking distance to central Mall Road, auto stand, and Hadimba Temple route.'
      }
    ],
    reverseRoute: {
      title: 'Manali → JUIT Campus (Return Journey)',
      steps: [
        'Board morning or overnight HRTC bus from Manali to Shimla.',
        'At Shimla ISBT Tutikandi, change to any Solan/Chandigarh bus.',
        'Get off at Waknaghat Junction and return to JUIT.'
      ]
    },
    missedBusAdvice: 'If direct Shimla-Manali bus is full, take a bus from Shimla to Mandi, then switch to the continuous Mandi-Kullu-Manali shuttle circuit.',
    travelTips: [
      'This is a long-distance mountain journey; advance booking on hrtchp.com is strongly advised.',
      'Check monsoon and road advisories on the Mandi-Pandoh stretch during July–August.'
    ]
  },
  {
    id: 'railways',
    name: 'Railway Stations Hub Guide',
    tagline: 'Toy Train, Broad Gauge Express & Shatabdi Connectivity',
    category: 'Rail & Air',
    tags: ['railway', 'station', 'toy train', 'kandaghat', 'kalka', 'chandigarh junction', 'trains'],
    direction: 'downhill',
    directionLabel: '▼ Multiple Stations Depending on Direction',
    highwaySide: 'Kandaghat & Kalka: Downhill side | Shimla Station: Uphill side',
    busBoardText: 'Choose station based on Toy Train vs Mainline Express',
    conductorPhrase: '“Station ke sabse paas kahan utaroge?”',
    transfers: 0,
    transferPoint: null,
    approxTime: '20 min to 3 hours depending on station',
    approxFare: '₹20 – ₹150',
    typicalFrequency: 'Regular highway connections',
    simpleRouteSummary: 'Closest Toy Train: Kandaghat (20m) | Main Broad Gauge: Kalka (2h) | Major Junction: Chandigarh (3h)',
    route: [
      {
        step: 1,
        title: 'Option A: Kandaghat Railway Station (UNESCO Toy Train)',
        instruction: 'Closest railhead to JUIT (~12 km). Take downhill bus to Kandaghat (~20 mins, ₹20). Walk 300m up to the heritage railway station for the Kalka-Shimla Toy Train.',
        type: 'transit',
        icon: 'train',
        badge: 'Closest Toy Train (20m)'
      },
      {
        step: 2,
        title: 'Option B: Kalka Railway Station (Broad Gauge Head)',
        instruction: 'Take downhill bus to Kalka (~2.5 hours, ₹100). Terminal for New Delhi Kalka Shatabdi, Netaji Express, and broad gauge network.',
        type: 'transit',
        icon: 'tram',
        badge: 'Main Railhead (2h)'
      },
      {
        step: 3,
        title: 'Option C: Chandigarh Junction (CDG)',
        instruction: 'Take bus to Chandigarh ISBT 43 (~3 hours). Then board CTU local AC bus Route 24 or 35 directly to Chandigarh Railway Station (Daria). Major junction for pan-India trains.',
        type: 'finish',
        icon: 'train',
        badge: 'Major Junction (3h)'
      }
    ],
    arrivalPoints: [
      { name: 'Kandaghat (KDGY)', desc: '12 km from Waknaghat. Scenic heritage toy train stop.' },
      { name: 'Kalka (KLK)', desc: '60 km from Waknaghat. Main departure point for broad gauge trains.' },
      { name: 'Chandigarh (CDG)', desc: '95 km from Waknaghat. Connects to Mumbai, Kolkata, Bengaluru.' }
    ],
    reverseRoute: {
      title: 'Railway Station → JUIT Campus',
      steps: [
        'From Kalka: Board any uphill Shimla-bound bus to Waknaghat.',
        'From Chandigarh: Take CTU bus to ISBT Sector 43, then board Shimla-bound bus to Waknaghat.',
        'From Kandaghat: Take any uphill bus or shared taxi to Waknaghat.'
      ]
    },
    missedBusAdvice: 'For early morning train departures (like 06:15 AM Kalka Shatabdi), highway buses may not guarantee arrival on time. Plan overnight stay in Kalka/Chandigarh or book a campus taxi.',
    travelTips: [
      'Toy train tickets can be booked on IRCTC (station code: KDGY for Kandaghat, KLK for Kalka, SML for Shimla).',
      'The Netaji Express (Howrah Mail) connects directly from Kalka to Delhi, Kanpur, Prayagraj, and Kolkata.'
    ]
  },
  {
    id: 'airports',
    name: 'Airports Hub Guide',
    tagline: 'Chandigarh International (IXC) & Shimla Jubbarhatti (SLV)',
    category: 'Rail & Air',
    tags: ['airport', 'flights', 'chandigarh airport', 'ixc', 'jubbarhatti', 'slv', 'indigo', 'air india'],
    direction: 'downhill',
    directionLabel: '▼ Chandigarh IXC (Downhill) / Shimla SLV (Shoghi Link)',
    highwaySide: 'Chandigarh IXC: Downhill side | Shimla Jubbarhatti: Cab from Shoghi',
    busBoardText: 'CHANDIGARH ISBT 43 → Connect to CTU Airport Shuttle Route 100',
    conductorPhrase: '“Chandigarh 43 utar dena, Airport bus leni hai.”',
    transfers: 1,
    transferPoint: 'Chandigarh ISBT Sector 43',
    approxTime: 'Chandigarh: ~3.5–4 hours total | Shimla: ~1.5 hours (Taxi)',
    approxFare: 'Bus + CTU Shuttle: ~₹220 total',
    typicalFrequency: 'CTU Airport Express shuttles run every 30 mins from ISBT 43',
    simpleRouteSummary: 'Chandigarh Airport: Waknaghat → Bus to Chandigarh ISBT 43 → CTU Airport Shuttle (Route 100) to IXC Terminal',
    route: [
      {
        step: 1,
        title: 'Stage 1: Waknaghat to Chandigarh ISBT 43',
        instruction: 'Board downhill bus at Waknaghat to Chandigarh ISBT Sector 43 (~3 hours, ₹130–₹160).',
        type: 'board',
        icon: 'directions_bus',
        badge: 'Highway Bus'
      },
      {
        step: 2,
        title: 'Stage 2: CTU Airport Shuttle (Bays at Sector 43)',
        instruction: 'At ISBT 43, locate the CTU Airport Express shuttle (Route 100 or 100A). High frequency, AC low-floor bus directly to airport departure terminal (~35 mins, ₹50).',
        type: 'transfer',
        isTransfer: true,
        icon: 'flight_takeoff',
        badge: 'CTU Airport Bus'
      },
      {
        step: 3,
        title: 'Shaheed Bhagat Singh International Airport (IXC)',
        instruction: 'De-board directly outside the Terminal 1 departure gate in Mohali.',
        type: 'finish',
        icon: 'flight',
        badge: 'Major Airport'
      }
    ],
    arrivalPoints: [
      {
        name: 'Chandigarh International Airport (IXC)',
        desc: 'Primary commercial airport with daily non-stop flights to Delhi, Mumbai, Bengaluru, Hyderabad, Dubai, etc.'
      },
      {
        name: 'Shimla Airport (Jubbarhatti - SLV)',
        desc: 'Located ~25 km from Waknaghat. Has limited regional flights (Alliance Air to Delhi/Dharamshala). Best reached via direct taxi through Shoghi.'
      }
    ],
    reverseRoute: {
      title: 'Airport → JUIT Campus',
      steps: [
        'At Chandigarh Airport (IXC), board the CTU AC Shuttle (Route 100) to ISBT Sector 43.',
        'At Sector 43, go to the Himachal departure bays.',
        'Board any Shimla-bound bus and request drop at Waknaghat Junction.',
        'Get down at Waknaghat and return to campus.'
      ]
    },
    missedBusAdvice: 'From Chandigarh ISBT 43, Uber and Ola cabs to the Airport take ~25–30 minutes (cost ~₹250–₹350).',
    travelTips: [
      'Always allow at least 4.5 to 5 hours from leaving JUIT campus to your flight departure time to account for highway traffic.',
      'During monsoon season, keep an extra 1-hour buffer due to potential highway maintenance.'
    ]
  }
];

/**
 * Controller for the JUIT Bus Travel Guide
 */
const BusGuideController = {
  routes: JUIT_BUS_ROUTES,
  activeFilter: 'all',
  searchQuery: '',
  selectedRouteId: null,
  isReverseMode: false,

  init() {
    this.bindEvents();
    this.renderMain();
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('bus-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.renderRoutesList();
      });
    }

    // Filter pills
    const filterPillsContainer = document.getElementById('bus-filter-pills');
    if (filterPillsContainer) {
      filterPillsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.bus-filter-pill');
        if (!btn) return;
        this.activeFilter = btn.dataset.filter || 'all';
        filterPillsContainer.querySelectorAll('.bus-filter-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        this.renderRoutesList();
      });
    }

    // Checklist state persistence
    const checklistItems = document.querySelectorAll('.bus-checklist-checkbox');
    checklistItems.forEach(box => {
      box.addEventListener('change', () => {
        this.saveChecklistState();
      });
    });
    this.loadChecklistState();
  },

  getSavedRoutes() {
    try {
      const raw = localStorage.getItem('juit_saved_bus_routes');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  isRouteSaved(id) {
    return this.getSavedRoutes().includes(id);
  },

  toggleSaveRoute(id, e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    let saved = this.getSavedRoutes();
    if (saved.includes(id)) {
      saved = saved.filter(x => x !== id);
    } else {
      saved.push(id);
    }
    localStorage.setItem('juit_saved_bus_routes', JSON.stringify(saved));
    
    // Update active modal or list star icons
    this.renderRoutesList();
    if (this.selectedRouteId === id) {
      this.renderRouteModalContent(id);
    }

    // Show subtle feedback
    const toast = document.createElement('div');
    toast.className = 'bus-toast-notification';
    toast.innerText = saved.includes(id) ? '★ Route saved to your offline favorites!' : 'Route removed from favorites.';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2400);
  },

  shareRoute(id, e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const r = this.routes.find(x => x.id === id);
    if (!r) return;

    const shareText = `🚌 JUIT Bus Guide: JUIT → ${r.name}\n📍 Board at: Waknaghat Junction (${r.directionLabel})\n⚡ Route: ${r.simpleRouteSummary}\n⏱️ Time: ${r.approxTime}\n💰 Fare: ${r.approxFare}\n👉 Shared from JUIT Student Hub`;

    if (navigator.share) {
      navigator.share({
        title: `JUIT Bus Guide: ${r.name}`,
        text: shareText
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        const toast = document.createElement('div');
        toast.className = 'bus-toast-notification';
        toast.innerText = '✓ Route summary copied to clipboard!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2400);
      });
    }
  },

  renderMain() {
    this.renderRoutesList();
  },

  getFilteredRoutes() {
    const q = this.searchQuery;
    const f = this.activeFilter;
    const saved = this.getSavedRoutes();

    return this.routes.filter(r => {
      // Category filter
      if (f === 'direct' && r.transfers !== 0) return false;
      if (f === 'transfer' && r.transfers === 0) return false;
      if (f === 'getaway' && !['Hill Station', 'Adventure & Snow'].includes(r.category)) return false;
      if (f === 'hub' && !['Transit Hub', 'Rail & Air', 'Inter-State'].includes(r.category)) return false;
      if (f === 'saved' && !saved.includes(r.id)) return false;

      // Query search
      if (!q) return true;
      const haystack = `${r.name} ${r.tagline} ${r.category} ${r.tags.join(' ')} ${r.simpleRouteSummary}`.toLowerCase();
      return haystack.includes(q);
    });
  },

  renderRoutesList() {
    const container = document.getElementById('bus-destinations-grid');
    if (!container) return;

    const filtered = this.getFilteredRoutes();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-12" style="text-align: center; padding: 40px 20px; background: rgba(23, 27, 38, 0.6); border-radius: 12px; border: 1px dashed var(--border-subtle);">
          <span class="material-symbols-outlined text-[36px]" style="color: var(--text-muted); margin-bottom: 8px;">directions_bus</span>
          <h3 style="font-size: 1.1rem; color: var(--text-primary); margin: 0 0 6px;">No matching destinations found</h3>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0;">Try searching for Shimla, Solan, Chandigarh, Kasauli, Delhi, or station names.</p>
        </div>
      `;
      return;
    }

    const saved = this.getSavedRoutes();

    container.innerHTML = filtered.map(r => {
      const isSaved = saved.includes(r.id);
      const isDirect = r.transfers === 0;
      const dirColor = r.direction === 'uphill' ? '#38bdf8' : '#34d399';

      return `
        <div class="bus-destination-card" data-route-id="${r.id}" onclick="BusGuideController.openRouteGuide('${r.id}')">
          <div class="bus-card-top">
            <div class="bus-dest-header">
              <div class="bus-badge-strip">
                <span class="bus-dir-badge" style="background: ${r.direction === 'uphill' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(52, 211, 153, 0.12)'}; color: ${dirColor}; border-color: ${dirColor}40;">
                  ${r.directionLabel}
                </span>
                <span class="bus-transfer-badge ${isDirect ? 'direct' : 'transfer'}">
                  ${isDirect ? '✓ Direct Bus' : `⚡ Change at ${r.transferPoint || 'Hub'}`}
                </span>
              </div>
              <h3 class="bus-dest-name">${r.name}</h3>
              <p class="bus-dest-tagline">${r.tagline}</p>
            </div>
            <button type="button" class="btn-star-route ${isSaved ? 'active' : ''}" 
              onclick="BusGuideController.toggleSaveRoute('${r.id}', event)" 
              title="${isSaved ? 'Remove from saved' : 'Save route for offline'}">
              <span class="material-symbols-outlined">${isSaved ? 'star' : 'star_border'}</span>
            </button>
          </div>

          <!-- Quick Travel Specs -->
          <div class="bus-card-specs">
            <div class="spec-pill">
              <span class="material-symbols-outlined text-[15px]">schedule</span>
              <span>${r.approxTime}</span>
            </div>
            <div class="spec-pill">
              <span class="material-symbols-outlined text-[15px]">payments</span>
              <span>${r.approxFare}</span>
            </div>
          </div>

          <!-- Route Preview Step Strip -->
          <div class="bus-route-simple-strip">
            <div class="strip-label">Route:</div>
            <div class="strip-text">${r.simpleRouteSummary}</div>
          </div>

          <div class="bus-card-footer">
            <span class="bus-learn-more">View Complete Travel Guide →</span>
            <button type="button" class="btn-share-mini" onclick="BusGuideController.shareRoute('${r.id}', event)" title="Share route with friends">
              <span class="material-symbols-outlined text-[16px]">share</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  openRouteGuide(id) {
    const r = this.routes.find(x => x.id === id);
    if (!r) return;

    this.selectedRouteId = id;
    this.isReverseMode = false;

    const modal = document.getElementById('universal-modal');
    const content = document.getElementById('universal-modal-content');
    if (!modal || !content) return;

    this.renderRouteModalContent(id);
    modal.classList.add('open');
    document.body.classList.add('mobile-drawer-open');
  },

  closeRouteGuide() {
    const modal = document.getElementById('universal-modal');
    if (modal) modal.classList.remove('open');
    document.body.classList.remove('mobile-drawer-open');
    this.selectedRouteId = null;
  },

  toggleReverseRoute(id) {
    this.isReverseMode = !this.isReverseMode;
    this.renderRouteModalContent(id);
  },

  renderRouteModalContent(id) {
    const r = this.routes.find(x => x.id === id);
    const content = document.getElementById('universal-modal-content');
    if (!r || !content) return;

    const isSaved = this.isRouteSaved(id);
    const isDirect = r.transfers === 0;
    const isReverse = this.isReverseMode;

    const timelineSteps = isReverse ? r.reverseRoute.steps.map((st, idx) => ({
      step: idx + 1,
      title: idx === 0 ? `Depart from ${r.name}` : (idx === r.reverseRoute.steps.length - 1 ? 'Arrive at JUIT Campus' : `Step ${idx + 1}`),
      instruction: st,
      icon: idx === 0 ? 'trip_origin' : (idx === r.reverseRoute.steps.length - 1 ? 'school' : 'directions_bus'),
      badge: idx === 0 ? 'Start' : (idx === r.reverseRoute.steps.length - 1 ? 'Destination' : 'En Route')
    })) : r.route;

    content.innerHTML = `
      <div class="bus-modal-window">
        <!-- Modal Top Bar -->
        <div class="bus-modal-header">
          <div class="bus-modal-header-left">
            <div class="bus-modal-badges">
              <span class="bus-dir-badge">${r.directionLabel}</span>
              <span class="bus-transfer-badge ${isDirect ? 'direct' : 'transfer'}">
                ${isDirect ? '✓ Direct Bus' : `⚡ Change at ${r.transferPoint}`}
              </span>
              <span class="bus-category-badge">${r.category}</span>
            </div>
            <h2 class="bus-modal-title">
              ${isReverse ? `${r.name} → JUIT Campus` : `JUIT Campus → ${r.name}`}
            </h2>
            <p class="bus-modal-subtitle">${r.tagline}</p>
          </div>
          
          <div class="bus-modal-actions">
            <button type="button" class="btn-star-route ${isSaved ? 'active' : ''}" 
              onclick="BusGuideController.toggleSaveRoute('${r.id}')" title="Save offline">
              <span class="material-symbols-outlined">${isSaved ? 'star' : 'star_border'}</span>
            </button>
            <button type="button" class="btn-share-mini" 
              onclick="BusGuideController.shareRoute('${r.id}')" title="Share route">
              <span class="material-symbols-outlined">share</span>
            </button>
            <button type="button" class="btn-close-modal" onclick="BusGuideController.closeRouteGuide()">✕</button>
          </div>
        </div>

        <!-- Mode Switcher: Outward vs Reverse -->
        <div class="bus-direction-toggle-row">
          <button type="button" class="btn-dir-tab ${!isReverse ? 'active' : ''}" onclick="if (BusGuideController.isReverseMode) BusGuideController.toggleReverseRoute('${r.id}')">
            <span>Going to ${r.name}</span>
          </button>
          <button type="button" class="btn-dir-tab ${isReverse ? 'active' : ''}" onclick="if (!BusGuideController.isReverseMode) BusGuideController.toggleReverseRoute('${r.id}')">
            <span>🔄 Returning to JUIT Campus</span>
          </button>
        </div>

        <!-- Quick Summary Bar -->
        <div class="bus-modal-specs-bar">
          <div class="modal-spec-item">
            <span class="spec-label">Approx Duration</span>
            <span class="spec-val">${r.approxTime}</span>
          </div>
          <div class="modal-spec-item">
            <span class="spec-label">Estimated Fare</span>
            <span class="spec-val">${r.approxFare}</span>
          </div>
          <div class="modal-spec-item">
            <span class="spec-label">Service Frequency</span>
            <span class="spec-val">${r.typicalFrequency}</span>
          </div>
        </div>

        <!-- Highway Boarding & Conductor Instructions Card -->
        <div class="bus-highway-guide-box">
          <div class="highway-guide-heading">
            <span class="material-symbols-outlined text-[20px]">signpost</span>
            <span>Where to Board & What to Ask</span>
          </div>
          <div class="highway-guide-content">
            <div class="guide-row">
              <strong>Highway Boarding Point:</strong>
              <span>${r.highwaySide}</span>
            </div>
            <div class="guide-row">
              <strong>Look for Bus Display:</strong>
              <span class="badge-bus-text">${r.busBoardText}</span>
            </div>
            <div class="guide-row speech-row">
              <strong>Ask the Conductor before getting on:</strong>
              <div class="conductor-speech-bubble">
                <span class="material-symbols-outlined text-[18px]">record_voice_over</span>
                <span>${r.conductorPhrase}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Vertical Route Timeline UI -->
        <div class="bus-timeline-section">
          <div class="timeline-title-row">
            <span class="material-symbols-outlined text-[20px]">alt_route</span>
            <h3 class="timeline-section-title">
              ${isReverse ? 'Step-by-Step Return Journey' : 'Step-by-Step Route Timeline'}
            </h3>
          </div>

          <div class="bus-vertical-timeline">
            ${timelineSteps.map((s, idx) => `
              <div class="bus-timeline-node ${s.isTransfer ? 'node-transfer' : ''}">
                <div class="timeline-left">
                  <div class="timeline-icon-circle ${s.isTransfer ? 'circle-transfer' : ''}">
                    <span class="material-symbols-outlined">${s.icon || 'circle'}</span>
                  </div>
                  ${idx < timelineSteps.length - 1 ? '<div class="timeline-line"></div>' : ''}
                </div>
                <div class="timeline-content">
                  <div class="timeline-node-header">
                    <span class="timeline-step-badge">STEP ${s.step}</span>
                    <h4 class="timeline-node-title">${s.title}</h4>
                    ${s.badge ? `<span class="timeline-status-pill ${s.isTransfer ? 'transfer-pill' : ''}">${s.badge}</span>` : ''}
                  </div>
                  <p class="timeline-instruction">${s.instruction}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Arrival Points & Terminals -->
        ${r.arrivalPoints && r.arrivalPoints.length > 0 && !isReverse ? `
          <div class="bus-arrival-section">
            <h4 class="subheading-accent">Key Bus Stands & Arrival Points in ${r.name}</h4>
            <div class="arrival-points-grid">
              ${r.arrivalPoints.map(ap => `
                <div class="arrival-point-card">
                  <div class="ap-name">📍 ${ap.name}</div>
                  <div class="ap-desc">${ap.desc}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- If You Miss The Bus Advice -->
        <div class="bus-missed-alert-box">
          <div class="alert-icon-title">
            <span class="material-symbols-outlined text-[20px]">support</span>
            <strong>If You Miss The Bus / Contingency Advice</strong>
          </div>
          <p class="alert-text">${r.missedBusAdvice}</p>
        </div>

        <!-- Insider Student Tips -->
        ${r.travelTips && r.travelTips.length > 0 ? `
          <div class="bus-tips-box">
            <div class="tips-heading">
              <span class="material-symbols-outlined text-[18px]">lightbulb</span>
              <strong>Insider Student Travel Tips</strong>
            </div>
            <ul class="bus-tips-list">
              ${r.travelTips.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- Official Route Disclaimer -->
        <div class="bus-bottom-disclaimer">
          ⚠️ <strong>Student Travel Notice:</strong> Bus timings, routes, and seat availability in Himachal can vary due to weather, hill traffic, and operational changes. Timings shown are approximate reference points. Always verify the current schedule with the conductor at Waknaghat before boarding.
        </div>
      </div>
    `;
  },

  loadChecklistState() {
    try {
      const raw = localStorage.getItem('juit_bus_checklist');
      if (raw) {
        const state = JSON.parse(raw);
        document.querySelectorAll('.bus-checklist-checkbox').forEach((cb, idx) => {
          if (state[idx] !== undefined) cb.checked = state[idx];
        });
      }
    } catch (e) {}
  },

  saveChecklistState() {
    try {
      const checkboxes = document.querySelectorAll('.bus-checklist-checkbox');
      const state = Array.from(checkboxes).map(cb => cb.checked);
      localStorage.setItem('juit_bus_checklist', JSON.stringify(state));
    } catch (e) {}
  }
};

window.BusGuideController = BusGuideController;
