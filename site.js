/* ============================================================
   Concept Factory — website UI kit shared behavior
   ============================================================ */
(function () {
  // ---- icon sprite (Lucide, MIT) injected once ----
  var ICONS = {
    lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'arrow-up-right': '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
    menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    phone: '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384z"/>',
    'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    play: '<path d="M6 3v18l15-9z"/>',
    ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>',
    hammer: '<path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/>',
    layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
    award: '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
    instagram: '<rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    quote: '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'
  };
  function injectSprite() {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute'; svg.style.width = '0'; svg.style.height = '0';
    var defs = '';
    for (var k in ICONS) {
      defs += '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + ICONS[k] + '</symbol>';
    }
    svg.innerHTML = defs;
    document.body.insertBefore(svg, document.body.firstChild);
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    injectSprite();

    // nav solid on scroll
    var nav = document.querySelector('.nav');
    if (nav) {
      var onScroll = function () { nav.classList.toggle('solid', window.scrollY > 30); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    // mobile menu
    var burger = document.querySelector('.nav__burger');
    var menu = document.querySelector('.mobile-menu');
    if (burger && menu) {
      var use = burger.querySelector('use');
      var toggle = function (open) {
        menu.classList.toggle('open', open);
        if (use) use.setAttribute('href', open ? '#i-x' : '#i-menu');
        document.body.style.overflow = open ? 'hidden' : '';
      };
      burger.addEventListener('click', function () { toggle(!menu.classList.contains('open')); });
      menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { toggle(false); }); });
    }

    // scroll reveal
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal-up').forEach(function (el) { io.observe(el); });
    // failsafe: never leave content hidden if the observer is missed
    setTimeout(function () { document.querySelectorAll('.reveal-up').forEach(function (el) { el.classList.add('in'); }); }, 1500);

    // sketch -> reality drag reveal
    document.querySelectorAll('.reveal').forEach(function (box) {
      var blue = box.querySelector('.reveal__blue');
      var handle = box.querySelector('.reveal__handle');
      var inner = blue ? blue.querySelector('img') : null;
      if (!blue || !handle || !inner) return;
      var dragging = false;
      function sizeInner() { inner.style.width = box.getBoundingClientRect().width + 'px'; }
      function setPos(clientX) {
        var r = box.getBoundingClientRect();
        var p = Math.max(0.04, Math.min(0.96, (clientX - r.left) / r.width));
        blue.style.width = (p * 100) + '%';
        handle.style.left = (p * 100) + '%';
        sizeInner();
      }
      sizeInner();
      window.addEventListener('resize', sizeInner);
      box.addEventListener('mousedown', function (e) { dragging = true; setPos(e.clientX); });
      window.addEventListener('mousemove', function (e) { if (dragging) setPos(e.clientX); });
      window.addEventListener('mouseup', function () { dragging = false; });
      box.addEventListener('touchstart', function (e) { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
      window.addEventListener('touchmove', function (e) { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
      window.addEventListener('touchend', function () { dragging = false; });
    });

    // unit switcher dropdown
    document.querySelectorAll('.unitsw').forEach(function (sw) {
      var btn = sw.querySelector('.unitsw__btn');
      if (!btn) return;
      btn.addEventListener('click', function (e) { e.stopPropagation(); sw.classList.toggle('open'); });
    });
    document.addEventListener('click', function () {
      document.querySelectorAll('.unitsw.open').forEach(function (sw) { sw.classList.remove('open'); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') document.querySelectorAll('.unitsw.open').forEach(function (sw) { sw.classList.remove('open'); });
    });

    // accordions
    document.querySelectorAll('.acc__head').forEach(function (head) {
      head.addEventListener('click', function () {
        var item = head.closest('.acc__item');
        var body = item.querySelector('.acc__body');
        var open = item.classList.toggle('open');
        body.style.maxHeight = open ? body.scrollHeight + 'px' : '0';
      });
    });

    // form feedback (contact, newsletter)
    document.querySelectorAll('form').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        if (f.dataset.done) return;
        f.dataset.done = '1';
        var msg = document.createElement('div');
        msg.textContent = f.querySelector('textarea') ? "Thanks — your enquiry is on its way. Concept Factory will be in touch." : "Thanks — you're subscribed.";
        msg.style.cssText = 'font-family:var(--font-display);text-transform:uppercase;letter-spacing:0.05em;font-size:14px;color:var(--cf-magenta);padding:16px 0;line-height:1.5;';
        f.replaceWith(msg);
      });
    });
  });

  // ---- NL / EN translation (text-node based, brand names kept) ----
  var NL = {
    // nav + units
    "Home":"Home","Work":"Werk","Industries":"Sectoren","About":"Over ons","Careers":"Jobs","Contact":"Contact","Services":"Diensten",
    "Start a project":"Start een project","Units":"Units","Design & build studio":"Ontwerp- & bouwstudio","In-house prop unit":"In-house prop-unit","3D model webshop":"3D-model webshop","Prop webshop":"Prop-webshop","Concept Factory — units":"Concept Factory — units","Switch unit":"Wissel unit",
    // taglines / hero
    "Creating winning concepts":"Winnende concepten creëren","that create experiences":"die ervaringen creëren","From sketch to reality":"Van schets tot realiteit",
    "Themed environments, immersive worlds and scenic decor — designed and built entirely in-house, from first sketch to final reveal.":"Thematische omgevingen, meeslepende werelden en decor — volledig in-house ontworpen en gebouwd, van eerste schets tot de finale onthulling.",
    "2,250 m² in-house atelier · Herentals, Belgium":"2.250 m² in-house atelier · Herentals, België",
    "Idea":"Idee","Concept":"Concept","Design":"Ontwerp","Build":"Bouw","Experience":"Beleving",
    // buttons
    "View selected work":"Bekijk ons werk","All projects":"Alle projecten","View work":"Bekijk werk","Our process":"Ons proces","Inside the atelier":"In het atelier","All work":"Alle projecten",
    "See open roles":"Bekijk vacatures","Life at the atelier":"Het atelier van binnen","Apply now":"Solliciteer nu","Get in touch":"Neem contact op","Send enquiry":"Verstuur aanvraag","Request quote":"Vraag offerte aan",
    "Request a custom prop":"Vraag een prop op maat","Browse The Production Line":"Ontdek The Production Line","Enter The Production Line":"Naar The Production Line","Shop now":"Shop nu","Request a prop":"Vraag een prop aan",
    "Add to order":"Toevoegen","Request 3D render":"Vraag 3D-render","Request production run":"Productie aanvragen","Visit Prop Factory":"Bezoek Prop Factory","Configure":"Configureer","Remove":"Verwijderen","Your order":"Je bestelling","Wireframe":"Wireframe","Solid":"Solid",
    // section titles (home)
    "Selected work":"Geselecteerd werk","Eight disciplines,":"Acht disciplines,","one workshop":"één atelier","The Atelier":"Het Atelier","A 2,250 m²":"Een 2.250 m²","machine park":"machinepark","Industries served":"Sectoren","Trusted by":"Vertrouwd door","From sketch":"Van schets","to reality":"tot realiteit",
    "Themed environments, immersive worlds and scenic decor.":"Thematische omgevingen, meeslepende werelden en scenisch decor.",
    "Concept, design, fabrication and installation — the full chain, under one roof.":"Concept, ontwerp, fabricage en installatie — de volledige keten, onder één dak.",
    "From theme parks to broadcasters — partners that return.":"Van pretparken tot omroepen — partners die terugkomen.",
    "Everything happens in one place — indoor and outdoor space, heavy machinery and a full fabrication crew. Nothing outsourced, nothing left to chance.":"Alles gebeurt op één plek — binnen- en buitenruimte, zware machines en een volledig productieteam. Niets uitbesteed, niets aan het toeval overgelaten.",
    // services
    "Decor Construction":"Decorbouw","Theming & Immersive Worlds":"Theming & meeslepende werelden","Experience Design":"Experience design","Event Production":"Eventproductie","Attraction Development":"Attractieontwikkeling","Scenic Fabrication":"Scenische fabricage","Creative Concepts":"Creatieve concepten","Custom Installations":"Installaties op maat",
    // industries titles
    "Theme Parks & Attractions":"Pretparken & attracties","Theatre & Stage":"Theater & podium","Television & Film":"Televisie & film","Brands & Retail":"Merken & retail","Events & Experiences":"Events & belevingen","Museums & Culture":"Musea & cultuur","Built for":"Gebouwd voor","every audience":"elk publiek",
    // about
    "Our story":"Ons verhaal","Built in-house since day one":"Sinds dag één in-house gebouwd","Milestones":"Mijlpalen","What drives us":"Wat ons drijft","The atelier":"Het atelier","Craft over quantity":"Vakmanschap boven kwantiteit","Full responsibility":"Volledige verantwoordelijkheid","Show the magic":"Toon de magie",
    // careers
    "Build the":"Bouw het","impossible with us":"onmogelijke met ons","Why the factory":"Waarom de factory","Open positions":"Openstaande functies","Real craft, real scale":"Echt vakwerk, echte schaal","One tight crew":"Eén hecht team","Never the same brief":"Nooit dezelfde opdracht","Send a spontaneous application":"Stuur een spontane sollicitatie","Join the factory":"Word deel van de factory",
    // shop / production line
    "Big 3D objects, made to order":"Grote 3D-objecten, op bestelling","How the line works":"Zo werkt de lijn","Model":"Model","Print / shape":"Printen / shapen","Hardcoat":"Hardcoat","Finish":"Afwerking","Deliver":"Leveren","Buy or rent":"Kopen of huren","Quantity":"Aantal","Buy":"Kopen","Rent / week":"Huur / week","Finished":"Afgewerkt","Prototype":"Prototype","Your order is empty.":"Je bestelling is leeg.","Estimated total":"Geschat totaal","All":"Alle","Replicas":"Replica's","Sculptures":"Sculpturen","Signage":"Signage","Seasonal":"Seizoen","Characters":"Personages",
    // prop factory
    "Props, made for real":"Props, écht gemaakt","Four things,":"Vier dingen,","one prop shop":"één prop shop","Make":"Maken","Rent":"Verhuren","Set dressing":"Set dressing","Custom build":"Maatwerk","From a candlestick":"Van een kandelaar","to a cathedral":"tot een kathedraal","Order props":"Bestel props","made to spec":"op maat",
    // contact
    "Start":"Start","a project":"een project","Name":"Naam","Company":"Bedrijf","Email":"E-mail","Phone":"Telefoon","Atelier":"Atelier","Studio hours":"Openingsuren","What happens next":"Wat gebeurt er nu","We listen.":"We luisteren.","We sketch.":"We schetsen.","We build.":"We bouwen.","Tell us about the project":"Vertel over het project","What can we build for you?":"Wat mogen we voor je bouwen?",
    // CTA
    "Let's create":"Laten we creëren","something unforgettable":"iets onvergetelijks","your next world":"jouw volgende wereld","Your project":"Jouw project","could be next":"kan de volgende zijn","Need a prop?":"Een prop nodig?","Let's make it":"Laten we het maken","Need a prop instead?":"Toch een prop nodig?","That's the Prop Factory":"Dat is de Prop Factory","Your sector":"Jouw sector","your audience, your world":"jouw publiek, jouw wereld","Build with us":"Bouw met ons","Can't find it?":"Niet gevonden?","We'll build it from scratch":"Wij bouwen het van nul","Your stage":"Jouw podium","is next":"is de volgende",
    // footer
    "Explore":"Ontdek","Newsletter":"Nieuwsbrief","Press":"Pers","Privacy":"Privacy","Terms":"Voorwaarden","Voorwaarden":"Voorwaarden","Shop":"Shop","Prop Factory":"Prop Factory",
    "Creating winning concepts. Themed environments and decor, designed and built in-house in Herentals, Belgium.":"Winnende concepten creëren. Thematische omgevingen en decor, in-house ontworpen en gebouwd in Herentals, België.",
    "Behind-the-scenes from the atelier, a few times a year.":"Behind-the-scenes uit het atelier, een paar keer per jaar.","Your email":"Je e-mail",
    // stats
    "Indoor workshop":"Binnenatelier","Outdoor yard":"Buitenterrein","Robotic arm":"Robotarm","CNC milling":"CNC-frezen","Projects delivered":"Projecten opgeleverd","Makers & designers":"Makers & ontwerpers","Building worlds":"Werelden bouwen","In-house atelier":"In-house atelier","Client":"Klant","Year":"Jaar","Discipline":"Discipline","Location":"Locatie",
    // sales band + misc
    "Belgium's boldest builders":"De boudste bouwers van België","When it has to be":"Als het écht moet","they call us":"bellen ze ons","Concept to install":"Concept tot installatie","Concept to install:":"Concept tot installatie",
    "From national broadcasters to international theme parks — when the brief is impossible and the deadline is real, the biggest names trust Concept Factory to design it, build it and make it last.":"Van nationale omroepen tot internationale pretparken — wanneer de opdracht onmogelijk is en de deadline echt, vertrouwen de grootste namen op Concept Factory om het te ontwerpen, te bouwen en te laten duren.",
    "Concept Factory turns the wildest ideas into":"Concept Factory verandert de wildste ideeën in","people can walk into — for theme parks, broadcasters, theatres and brands across Europe.":"waar mensen in kunnen stappen — voor pretparken, omroepen, theaters en merken in heel Europa.","physical worlds":"fysieke werelden",
    "All work":"Alle projecten","All projects":"Alle projecten","More work":"Meer werk","View case":"Bekijk case","The result":"Het resultaat","Gallery":"Gallerij","Challenge":"Uitdaging","Result":"Resultaat","Production":"Productie",
    "Last updated · June 2026":"Laatst bijgewerkt · juni 2026","Privacy policy":"Privacybeleid","Terms of use":"Gebruiksvoorwaarden","General conditions":"Algemene voorwaarden","Cookies":"Cookies","The small print":"De kleine lettertjes",
    "Add to order":"Toevoegen","Your order is empty.":"Je bestelling is leeg."
  };

  function translateNode(root, toNL){
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = walker.nextNode())){
      var raw = n.nodeValue;
      if (!raw || !raw.trim()) continue;
      if (n.parentNode && (n.parentNode.tagName === 'SCRIPT' || n.parentNode.tagName === 'STYLE')) continue;
      if (toNL){
        if (n.__en === undefined){
          var key = raw.trim();
          if (NL[key]){ n.__en = raw; n.nodeValue = raw.replace(key, NL[key]); }
        }
      } else if (n.__en !== undefined){
        n.nodeValue = n.__en; n.__en = undefined;
      }
    }
  }
  function setLang(lang){
    var nl = lang === 'nl';
    translateNode(document.body, nl);
    document.documentElement.lang = nl ? 'nl' : 'en';
    document.querySelectorAll('.lang-en').forEach(function(s){ s.classList.toggle('on', !nl); });
    document.querySelectorAll('.lang-nl').forEach(function(s){ s.classList.toggle('on', nl); });
    // placeholders
    document.querySelectorAll('input[placeholder]').forEach(function(inp){
      if (inp.__enPh === undefined) inp.__enPh = inp.getAttribute('placeholder');
      var k = inp.__enPh; inp.setAttribute('placeholder', nl && NL[k] ? NL[k] : k);
    });
    try { localStorage.setItem('cf-lang', lang); } catch(e){}
  }
  function initI18n(){
    document.querySelectorAll('.lang-en').forEach(function(s){ s.addEventListener('click', function(){ setLang('en'); }); });
    document.querySelectorAll('.lang-nl').forEach(function(s){ s.addEventListener('click', function(){ setLang('nl'); }); });
    var saved = 'en';
    try { saved = localStorage.getItem('cf-lang') || 'en'; } catch(e){}
    setLang(saved);
  }
  initI18n();
})();

/* --- portfolio filter (added) --- */
(function(){var b=document.querySelectorAll(".filters button[data-cat]");if(!b.length)return;b.forEach(function(x){x.addEventListener("click",function(){b.forEach(function(y){y.classList.remove("on");});x.classList.add("on");var c=x.getAttribute("data-cat")||"all";document.querySelectorAll(".tile[data-cat]").forEach(function(t){t.style.display=(c==="all"||t.getAttribute("data-cat")===c)?"":"none";});});});})();
