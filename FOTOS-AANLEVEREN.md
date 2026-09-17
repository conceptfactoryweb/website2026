# Foto's en projecten aanleveren

## De regel
`data/projects.json` is de enige plek waar projectdata staat. Home, Work, Industries en de cases
worden daaruit gegenereerd. Nooit een tegel of case rechtstreeks in de HTML aanpassen: de
eerstvolgende build overschrijft dat.

Na elke wijziging:

    node scripts/build.mjs
    git add -A && git commit -m "..." && git push

De build weigert te draaien bij een foto die niet bestaat, een foto die in twee projecten staat,
of een atelierbeeld in een projectcase. Dat is bewust: zo kan het niet meer stilletjes fout gaan.

## Foto's aanleveren
Per project bestaat er een map: `assets/photos/<slug>/`. Zet de foto's daar in, niets anders.
Een foto van project A mag nooit in project B gebruikt worden.

Wat er per project nodig is, in volgorde van belang:

1. Hero. Het sterkste eindbeeld, liggend, minstens 2000 px breed.
2. Vier procesbeelden: schets of tekening, opbouw in het atelier, installatie op locatie, eindresultaat.
3. Drie tot vijf galerijbeelden: details, andere hoeken, sfeer.

Bestandsformaat: jpg of webp, maximaal 300 kB per beeld na compressie. De huidige beelden zijn
ongecomprimeerde jpg tot 800 kB, dat kost laadtijd en dus SEO. Alles wat je aanlevert, wordt bij
verwerking verkleind naar maximaal 2000 px breed.

## Status
`"status": "live"` staat op de site. `"status": "draft"` staat nergens, ook niet verborgen.
Een project gaat pas op live als er eigen beeld en bevestigde feiten zijn. Liever acht projecten
die kloppen dan veertien die half verzonnen zijn.

## In quarantaine
`assets/photos/_unverified/` bevat vier escaperoom-foto's, een pirate bay en een standbeeld
waarvan niet vaststaat bij welk project ze horen. Zolang dat niet bevestigd is, worden ze nergens
gebruikt. Bevestigd? Verplaats het bestand naar de juiste projectmap en zet het pad in projects.json.

## Atelierbeeld
`assets/photos/atelier/` is bedrijfsbeeld: atelier, machines, team. Dat mag op About, Careers en
in de industriesecties, maar nooit als bewijs binnen een projectcase. Een generieke atelierfoto als
"zo bouwden we dit project" is precies wat er eerder misliep.
