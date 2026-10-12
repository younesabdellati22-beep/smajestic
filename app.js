/* ================= CALCULATEUR CHÂSSIS =================
   Calibré sur les prix moyens du marché belge 2026 (Winsol/Bouwinfo 2025,
   Test-Achats 2026, grilles Bobex). Toutes les valeurs sont HORS TVA,
   pose et dépose comprises, pour du double vitrage HR++ blanc.
   → À remplacer par les tarifs réels de S.Majestic avant la mise en ligne.

   Méthode : fenêtres facturées au m² (surface réelle du type choisi),
   portes / portes-fenêtres / baies au forfait, car c'est ainsi que le
   marché belge les cote. Minimum de 400 € par ouverture. */
const RATE   = {pvc:450, alu:750, bois:600};            // €/m² HTVA, pose comprise
const FORFAIT= {                                        // € HTVA l'unité, pose comprise
  door : {pvc:1400, bois:1600, alu:1900},
  pf   : {pvc:1700, bois:2000, alu:2400},
  slide: {pvc:2000, bois:2500, alu:2900}
};
const SIZE   = {std:{w:100,h:130}, small:{w:60,h:60}, large:{w:200,h:130},
                door:{w:90,h:215}, pf:{w:90,h:215}, slide:{w:240,h:215}};
const MIN_OP = 400;        // minimum par ouverture, € HTVA
const GLASS  = {double:1, triple:1.15};   // triple vitrage : +15 % sur le devis
const COLOR  = {white:1, color:1.10};     // couleur / anthracite : à confirmer
const MARGIN = .10;                       // fourchette affichée ± 10 %

/* ===== ISOLATION — €/m² HTVA, pose comprise (moyennes belges 2026, Bobex) ===== */
const ISO = {toit:35, creux:22, ite:120, sol:25};
/* ===== PANNEAUX SOLAIRES — dégressif €/Wc TVA 6 % comprise (Bobex 2026) ===== */
const SOL = {wc:430, prod:950, tiers:[[4,1.40],[7,1.20],[99,1.10]]};
/* ===== CLIM & PAC — € HTVA, pose comprise par un partenaire certifié ===== */
const CLIM = {mono:2100, extra:850, pac:9000};
/* ===== FINITIONS — €/m² HTVA, fournitures + pose (moyennes belges 2026) =====
   Peinture  : TrustUp 15-22 (murs bon état) / 22-32 (prépa) / 30-45 (lourd), plafond 18-35
               Guide-Rénovation : murs 15-25 / 25-30 / 35-45, plafonds 20-30
   Plafonnage: Bobex replafonnage 15-20, neuf 11-13 · Batibouw+ 13-19 de moyenne
   Enduisage : TrustUp crépi ciment 35-60, monocouche 40-70, silicone 55-90,
               échafaudage facturé 8-20 €/m² en plus
   >>> À FAIRE VALIDER PAR S.MAJESTIC avant mise en ligne <<<                    */
const FIN = {
  peint:{mur:{bon:20, moyen:28, abime:38}, plaf:25},   // moyenne marché — à valider
  endui:{mono:55, silicone:75, echaf:14},              // moyenne marché — à valider
  /* ↓↓↓ TARIFS COMMUNIQUÉS PAR S.MAJESTIC ↓↓↓ */
  plafo:{neuf:18, vieux:25},            // vieux mur : épaisseur max 1 cm, supplément par cm en plus
  cloison:{stud:50, phonique:150},      // stud+gyproc / cloison phonique jusqu'à −80 dB
  rf:{rf30:70, rf1h:90},                // plafond coupe-feu 30 min / 1 h
  sol:{parquet:45, carrelage:60}        // laminé 7 mm / carrelage d'une valeur max 25 €/m²
};
/* ===== MATÉRIEL & CHANTIER (B2B) — tarifs S.Majestic ===== */
const MAT = {pelle:70, gruea:180, grueb:250, livr:100};
const ROOM_M2 = 18;    // surface au sol d'une pièce moyenne (m²)
const MUR_RATIO = 2.5; // règle de métier : murs à peindre ≈ 2,5 × surface au sol
/* ===== Maison : hauteur par niveau (m) et part de mur occupée par les ouvertures ===== */
const LVL_H = 2.7, OPEN_SHARE = .15;
const TYPES=["std","small","large","door","pf","slide"];
const FRAME={white:"#FBFAF7",anthracite:"#34383C",alu:"#A9AEB3",bois:"#8C5B36"};
const SVCS=["chassis","iso","solar","clim","finit","reno"];
const IC={
 chassis:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="4" y="2" width="12" height="16"/><path d="M10 2v16M4 10h12"/></svg>',
 iso:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 9 10 3l8 6M4.5 8v10h11V8"/><path d="M6.5 12c1.2-.8 2.3.8 3.5 0s2.3-.8 3.5 0"/></svg>',
 solar:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 18 4.5 8h13L15 18Z"/><path d="M3.2 13h13M8 8l-1.2 10M12.5 8l-1 10"/><circle cx="16" cy="3" r="1.6"/></svg>',
 clim:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="4" width="16" height="6" rx="1"/><path d="M5 13v2M10 13v4M15 13v2"/></svg>',
 finit:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="2.5" width="12" height="4.5" rx="1"/><path d="M15 4.75h2.5v3.5H10v2"/><rect x="8.2" y="10.5" width="3.6" height="7" rx="1.2"/></svg>',
 reno:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m3 17 8-8M10.5 5.5l3.5-3.5 4 4-3.5 3.5Z"/></svg>'
};

const T={
fr:{
 u_tel:"Tél. +32 4xx xx xx xx",
 h1_html:"Votre maison. <span class='ac'>Notre métier.</span>",
 cta_b2:"Parler à quelqu’un",hero_chk:"Devis gratuit, visite sans engagement, en français et en néerlandais.",
 hero_chip_b:"Prix en 1 minute",hero_chip_s:"Cliquez sur votre maison, le prix s’affiche.",
 rv_note:"Avis Google",rv_sub:"À connecter quand la fiche sera créée",
 sv_h2:"Qu’est-ce qu’on peut <span class='ac'>faire chez vous ?</span>",
 br_h:"Les marques avec <span class='ac'>lesquelles on travaille.</span>",br_p:"Châssis, isolation, panneaux solaires, pompes à chaleur : on travaille avec des fabricants reconnus.",br_slot:"Logo à ajouter",
 tr_chip:"Savoir-faire depuis [X] ans",
 tr_h:"Pour le placement, l’entretien <span class='ac'>et les réparations.</span>",
 tr_1h:"Un devis clair",tr_1p:"Vous savez quels matériaux sont compris dans le prix.",
 tr_2h:"Des choix expliqués",tr_2p:"On vous dit pourquoi on conseille tel châssis ou tel isolant.",
 tr_3h:"Aussi après le chantier",tr_3p:"Appelez-nous pour un entretien, une réparation ou une question.",
 tr_link:"En savoir plus sur S.Majestic",
 zone_l:"Depuis <b>Ronse</b>, chez vous en <b>Flandre-Orientale et dans le Hainaut</b>.",zone_r:"Oudenaarde, Geraardsbergen, Kluisbergen, Tournai, Frasnes : on passe aussi chez vous.",
 strip_h:"Un entretien ou une réparation sur votre installation ?",
 strip_p:"Donnez-nous la marque, le type d’appareil ou de châssis et décrivez le problème.",strip_btn:"Demander une intervention",
 wk_h2:"Nos chantiers, <span class='ac'>en vrai.</span>",
 qt_h:"Demander un devis <span class='ac'>ou poser une question ?</span>",
 qt_p:"Pour un prix tout de suite, utilisez le configurateur. Pour le reste, écrivez-nous : on répond vite.",
 qt_urg:"Urgence ?",qt_urg_p:"Appelez-nous pour en parler :",
 faq_h2:"Vos questions sur S.Majestic <span class='ac'>et notre zone.</span>",
 faq_int:"Ce qu’on fait, où on travaille et comment demander un devis.",
 faq_cta_p:"Votre question n’est pas là ? Posez-la, on répond dans la journée.",
 faq_cta_b:"Poser ma question",
 ft_after:"Après le chantier.",ft_after_p:"Pour un entretien, une réparation ou une explication sur votre installation, on reste joignable.",
 svb:{chassis:["PVC, aluminium ou bois, sur mesure","Fenêtres, portes d’entrée, baies coulissantes","Dépose des anciens châssis et finitions"],
      iso:["Toiture, murs et sols","Mur creux par insufflation ou isolation extérieure","Épaisseurs conformes aux primes"],
      solar:["Étude de votre toit et de votre facture","Panneaux et onduleur posés par nos partenaires certifiés","Dossier et mise en service inclus"],
      clim:["Clim réversible ou pompe à chaleur air-eau","Une pièce ou toute la maison","Posée par un installateur certifié"],
      finit:["Plafonnage sur mur neuf ou existant","Cloisons stud, gyproc et cloisons phoniques","Parquet, carrelage, peinture et enduit de façade"],
      reno:["Salle de bain, cuisine, toiture, façade","Coordination de tous les corps de métier","Un seul interlocuteur du début à la fin"]},

 badge:"Nouveau : votre prix en ligne, en 1 minute",cta_b:"Voir nos services",
 st1_n:"5 services",st1_l:"Châssis, isolation, solaire, clim, finitions",
 st2_n:"1 interlocuteur",st2_l:"Du devis à la fin du chantier",
 st3_n:"FR & NL",st3_l:"Des deux côtés de la frontière",
 st4_n:"Devis gratuit",st4_l:"Visite et mesures sans engagement",
 sv_eb:"Nos services",wy_eb:"Pourquoi nous",hw_eb:"La marche à suivre",pr_eb:"Primes & TVA",ab_eb:"L’entreprise",wk_eb:"Réalisations",tm_eb:"Avis clients",
 wy_h:"Une rénovation sans courir après dix entreprises",
 wy_p:"Vous nous dites ce que vous voulez changer. On s’occupe des métiers, du planning et des papiers.",
 w1_h:"Un prix avant même de nous appeler",w1_p:"Le configurateur vous donne une estimation en une minute, sans laisser vos coordonnées.",
 w2_h:"Un seul contact pour tout",w2_p:"Châssis, isolation, panneaux solaires, clim : une seule personne suit votre chantier du début à la fin.",
 w3_h:"Les papiers, c’est pour nous",w3_p:"TVA à 6 %, primes régionales, dossiers : on vérifie ce à quoi vous avez droit et on prépare les documents.",
 tm_h:"Ce que vos clients diront bientôt ici",tm_p:"Cet emplacement affichera vos vrais avis Google dès que la fiche de l’entreprise sera créée.",
 tm_q:"Votre avis client s’affichera ici, avec la note et le prénom du client.",tm_who:"Prénom · Ronse",
 end_h:"Votre prix en une minute, votre devis en une visite",
 end_p:"Commencez par le configurateur : cliquez sur votre maison, voyez le prix, et demandez votre offre détaillée si ça vous convient.",
u_hours:"Lun–ven 8h–18h · sam 9h–13h",u_zone:"Flandre-Orientale & Hainaut",u_demo:"Maquette : téléphone et e-mail à compléter",
 tagline:"Construction & Rénovation",
 n1:"Châssis",n2:"Isolation",n3:"Solaire",n4:"Clim & PAC",n5:"Rénovation",n6:"Réalisations",n7:"Contact",cta:"Calculer mon prix",
 n8:"Matériel",
 mt_h2:"Matériel et <span class='ac'>chantier</span>",
 mt_p:"Pour les entrepreneurs, les indépendants et les particuliers qui gèrent leur chantier eux-mêmes. Tarifs directs, sans devis à attendre.",
 mt_1_h:"Terrassement",mt_1_p:"Mini-pelle avec chauffeur. Terrasse, allée, fondations, raccordements.",
 mt_2_h:"Location de grue",mt_2_p:"Grue de chantier à la journée. Livrée et reprise sur place.",
 mt_3_h:"Citerne d’eau de pluie",mt_3_p:"Fourniture et pose, terrassement compris. Trois volumes au choix.",
 mt_h:"à l’heure",mt_j:"par jour",mt_voy:"par voyage",mt_dem:"Sur demande",
 mt_pelle:"Mini-pelle avec chauffeur",mt_livr:"Livraison et reprise",
 mt_g1:"Grue E10z",mt_g2:"Grue E27z",
 mt_c1:"Citerne 5 000 litres",mt_c2:"Citerne 10 000 litres",mt_c3:"Citerne 20 000 litres",
 mt_fine:"Tarifs hors TVA 21 %. La location de matériel n’entre pas dans la TVA à 6 % des travaux de rénovation. Minimum de facturation, assurance et disponibilité à confirmer par téléphone.",
 mt_cta:"Demander une disponibilité",mt_more:"Voir tous les tarifs",
 h1:"Calculez le prix de vos travaux",h1_p:"Dessinez votre maison, cliquez sur ce que vous voulez changer. Pour les châssis, le prix s’affiche tout de suite.",
 c1:"Devis gratuit",c2:"Sans inscription",c3:"On parle français et néerlandais",
 hb_lv:"Niveaux",hb_w:"Largeur",hb_t:"Maison",hb_d:"Profondeur",
 iso_wall:"Comment isoler les murs ?",iso_wall_o:{creux:"Dans le mur creux",ite:"Par l’extérieur"},
 iso_wall_w:{creux:"On insuffle l’isolant dans la coulisse du mur. Rapide et le moins cher.",ite:"Isolant + crépi sur la façade. Plus efficace, mais nettement plus cher."},
 cd_iso:{toit:"Toiture",creux:"Murs creux (insufflation)",ite:"Murs par l’extérieur",sol:"Sol"},
 cd_surf:"Surfaces estimées",cd_surf_d:(w,d,lv)=>`maison de ${nf(w)} × ${d} m sur ${lv} niveau${lv>1?"x":""}`,
 cd_panel:"Panneau posé",cd_prod:"Production estimée",cd_prod_d:"par an, environ 950 kWh par kWc",
 cd_clim:{mono:"Première pièce (unité extérieure comprise)",extra:"Pièce supplémentaire",pac:"Pompe à chaleur air-eau"},
 cd_src2:"Prix moyens du marché belge 2026. Surfaces estimées d’après la maison que vous avez réglée : elles seront mesurées lors de la visite.",
 p_offer2:"Recevoir mon offre détaillée",
 p_fine2:"Estimation d’après la maison que vous avez réglée. Le prix exact est confirmé après la visite gratuite chez vous.",
 p_empty_iso:"Choisissez ce que vous voulez isoler",p_empty_sol:"Ajoutez des panneaux",p_empty_clim:"Choisissez des pièces",
 sol_noprime:"Plus aucune prime régionale pour le photovoltaïque en Flandre ni en Wallonie depuis 2024. Il reste la TVA à 6 % et les prêts à 0 %.",w2:"2 fenêtres",w3:"3 fenêtres",t_mit:"Mitoyenne",t_f3:"3 façades",t_f4:"4 façades",
 v_front:"Vue 3D",v_drag:"glissez pour tourner",v_cut:"Vue : intérieur",
 hint_chassis:"Cliquez sur les fenêtres · tournez pour voir l'arrière",hint_iso:"Cliquez sur le toit, les murs ou le sol",hint_solar:"Cliquez sur le toit pour ajouter des panneaux",hint_clim:"Cliquez sur les pièces à équiper",hint_reno:"Choisissez vos travaux à droite",
 lg_sel:"À remplacer",lg_glass:"Actuel",lg_iso:"À isoler",lg_sp:"Panneau",lg_room:"Pièce équipée",
 s_chassis:"Châssis",s_iso:"Isolation",s_solar:"Solaire",s_clim:"Clim",s_reno:"Rénovation",
 fin_t:"Finitions et aménagement",fin_d:"Plafonnage, cloisons, sols, peinture et façade. Choisissez, on calcule les surfaces à votre place.",
 fin_what:"À l’intérieur",fin_what_o:{peinture:"Peinture",plafonnage:"Plafonnage",cloison:"Nouvelle cloison",plafondrf:"Plafond coupe-feu",sols:"Sol"},
 fin_what2:"À l’extérieur",fin_what2_o:{enduisage:"Enduisage de façade"},
 fin_w:"Plusieurs choix possibles. On calcule les surfaces d’après la maison que vous avez réglée.",
 fin_plafo:"Sur quel support ?",fin_plafo_o:{neuf:"Mur neuf",vieux:"Mur existant"},
 fin_plafo_w:{neuf:"Blocs ou briques neufs, support droit. 18 €/m².",vieux:"Rénovation, 25 €/m². Épaisseur comprise jusqu’à 1 cm ; au-delà, un supplément est calculé sur place."},
 fin_cl:"Type de cloison",fin_cl_o:{stud:"Stud métal + gyproc",phonique:"Cloison phonique"},
 fin_cl_w:{stud:"50 €/m². Isolation acoustique ou thermique en supplément, à chiffrer lors de la visite.",phonique:"150 €/m². Descend sous les 80 dB : idéal entre deux logements ou pour une chambre d’ado."},
 fin_cl_m2:"Surface de cloison",fin_cl_w2:m=>`${m} m², soit environ ${Math.round(m/2.6*10)/10} m de long sur 2,6 m de haut.`,
 fin_rf:"Degré coupe-feu",fin_rf_o:{rf30:"RF 30 minutes",rf1h:"RF 1 heure"},
 fin_rf_w:{rf30:"70 €/m². Le minimum demandé entre deux logements dans la plupart des communes.",rf1h:"90 €/m². Exigé pour un commerce, un horeca ou un immeuble à appartements."},
 fin_sol:"Quel revêtement ?",fin_sol_o:{parquet:"Parquet",carrelage:"Carrelage"},
 fin_sol_w:{parquet:"45 €/m², fourniture et pose d’un laminé 7 mm. Vous pouvez choisir un autre modèle, le prix suit.",carrelage:"60 €/m², fourniture et pose. Carrelage au choix jusqu’à 25 €/m² ; au-delà, on ajoute la différence."},
 fin_scope:"Quelle surface ?",fin_scope_o:{full:"Toute la maison",rooms:"Quelques pièces"},
 fin_rooms:"Nombre de pièces",fin_room_w:n=>`Environ ${n*18} m² au sol, soit ${Math.round(n*18*2.5)} m² de murs.`,
 fin_full_w:(sol,mur)=>`Environ ${sol} m² de plafonds et ${mur} m² de murs pour la maison que vous avez réglée.`,
 fin_etat:"État des murs",fin_etat_o:{bon:"Bon état",moyen:"Quelques trous à reboucher",abime:"Abîmés"},
 fin_etat_w:{bon:"Une sous-couche et deux couches suffisent. C’est le cas le moins cher.",moyen:"Rebouchage, ponçage, sous-couche puis deux couches. C’est le cas le plus courant.",abime:"Décapage et enduit de rénovation avant peinture. Comptez plus cher."},
 fin_fini:"Type d’enduit",fin_fini_o:{mono:"Enduit monocouche",silicone:"Finition silicone"},
 fin_fini_w:{mono:"Le classique, bon rapport qualité-prix. Durée de vie 20 à 30 ans.",silicone:"Plus cher mais hydrofuge et autonettoyant. Idéal pour une façade exposée à la pluie."},
 fin_echaf:"Échafaudage nécessaire ?",fin_echaf_o:{oui:"Oui",non:"Non, de plain-pied"},
 fin_echaf_w:"Dès qu’on travaille à l’étage, l’échafaudage est obligatoire. Comptez environ 14 €/m² en plus.",
 p_empty_finit:"Choisissez vos travaux de finition",hint_finit:"La façade s’allume quand vous choisissez l’enduisage",
 lg_fin:"Façade à enduire",s_finit:"Finitions",
 cd_fin:{peint_mur:"Peinture des murs",peint_plaf:"Peinture des plafonds",plafo_mur:"Plafonnage des murs",plafo_plaf:"Plafonnage des plafonds",cloison_stud:"Cloison stud + gyproc",cloison_phonique:"Cloison phonique",rf30:"Plafond RF 30 min",rf1h:"Plafond RF 1 h",parquet:"Parquet laminé 7 mm",carrelage:"Carrelage posé",endui:"Enduit de façade",echaf:"Échafaudage"},
 cart_t:"Total de votre projet",cart_one:"service",cart_many:"services",cart_rm:"Retirer",
 t_chassis:"Vos nouveaux châssis",d_chassis:"Cliquez sur la maison ou utilisez + et −. Ajoutez aussi les fenêtres de l’arrière et des côtés.",
 it:{std:"Fenêtre normale",small:"Petite fenêtre",large:"Grande fenêtre",door:"Porte d’entrée",pf:"Porte-fenêtre",slide:"Baie coulissante"},
 ex:{std:"environ 100 × 130 cm",small:"environ 60 × 60 cm, salle de bain, WC",large:"environ 200 × 130 cm, salon",door:"porte principale",pf:"jusqu’au sol, souvent vers le jardin",slide:"grande vitre qui glisse"},
 g_mat:"Matériau",g_col:"Couleur",g_gl:"Isolation du vitrage",g_age:"Votre maison a plus de 10 ans ?",unsure:"Je ne sais pas",
 o_mat:{pvc:"PVC",alu:"Alu",bois:"Bois"},o_col:{white:"Blanc",color:"Anthracite"},o_gl:{double:"Double",triple:"Triple"},o_age:{old:"Oui",new:"Non"},
 w_mat:{pvc:"Le plus choisi : bon prix, pas d’entretien.",alu:"Cadres fins, look moderne. <b>Environ +35 %</b>",bois:"Chaleureux, demande un peu d’entretien. <b>Environ +45 %</b>",unsure:"On calcule en PVC, le plus courant."},
 w_col:{white:"Classique, va avec tout.",color:"La couleur la plus demandée en ce moment. <b>Environ +12 %</b>",unsure:"On calcule en blanc. Vous choisirez sur échantillons."},
 w_gl:{double:"Le choix de la plupart des maisons.",triple:"Encore plus chaud et silencieux. <b>Environ +12 %</b>",unsure:"On calcule en double vitrage."},
 w_age:{old:"TVA réduite à <b>6 %</b>.",new:"TVA normale à 21 %.",unsure:"On calcule à 21 % pour ne pas vous annoncer trop bas."},
 cd_h:"Comment ce prix est calculé",cd_forfait:"forfait, pose comprise",cd_opts:"Options",
 cd_min:"minimum par ouverture",cd_triple:"triple vitrage +15 %",cd_color:"couleur +10 %",
 cd_ht:"Sous-total hors TVA",cd_vat:v=>`TVA ${v} %`,cd_tot:"Total",
 cd_src:"Prix moyens du marché belge 2026 (fenêtres au m², portes et baies au forfait, minimum 400 € par ouverture). Vos tarifs réels remplaceront ces valeurs.",
 p_lbl:"Votre prix estimé",p_about:"environ",p_empty:"Cliquez sur une fenêtre",
 p_meta:(v,a,b)=>`Pose et TVA ${v} % comprises<br>entre ${a} et ${b}`,
 p_meta2:(a,b)=>`Pose et TVA comprises<br>entre ${a} et ${b}`,
 p_offer:"Recevoir mon offre avec remise",wa_btn:"Photos par WhatsApp",
 p_fine:"Estimation pour des tailles standard. Le prix exact est confirmé après la prise de mesures, gratuite.",
 of_name:"Prénom",of_name2:"Nom",of_tel:"Téléphone",of_cp:"Code postal",of_send:"Rappelez-moi",of_back:"Annuler",
 of_err:"Indiquez votre numéro de téléphone pour qu’on puisse vous rappeler.",
 of_ok_h:"Merci, c’est noté.",of_ok_p:"On vous rappelle rapidement.",of_demo:"Maquette : rien n’a été envoyé.",
 of_intro:"On vous rappelle pour affiner le prix et vous proposer nos remises du moment.",
 lead_lbl:"Votre prix",lead_v:"Sur rappel",lead_meta:"Gratuit et sans engagement",lead_btn:"Recevoir mon prix",
 partner:"Installé par nos partenaires certifiés. Vous n’avez qu’un seul contact : S.Majestic.",
 zones_t:"Quoi isoler ?",zones:{toit:"Toit",murs:"Murs",sol:"Sol"},zl:{toit:"TOIT",murs:"MURS",sol:"SOL"},
 iso_t:"Isoler votre maison",iso_d:"Cliquez sur la maison ou choisissez ici. Plusieurs choix possibles.",iso_w:"C’est souvent par le toit que la maison perd le plus de chaleur.",
 sol_t:"Panneaux solaires",sol_d:"Dites-nous combien vous payez d’électricité, on vous propose un nombre de panneaux. Vous pouvez l’ajuster.",
 sol_roof:"Votre toit",sol_roof_o:{pente:"En pente",plat:"Plat"},sol_bill:"Électricité par mois",sol_bill_o:{b1:"Moins de 80 €",b2:"80 à 150 €",b3:"Plus de 150 €"},
 sol_n:"Nombre de panneaux",sol_sug:n=>`Pour votre facture, on conseille environ ${n} panneaux.`,sol_none:"Choisissez votre facture ou cliquez sur le toit.",sol_max:n=>`Place pour ${n} panneaux sur cette façade de toit.`,
 cl_t:"Clim et pompe à chaleur",cl_d:"On voit l’intérieur de la maison. Cliquez sur les pièces où vous voulez un appareil.",
 cl_goal:"Vous voulez",cl_goal_o:{cool:"Rafraîchir l’été",both:"Chauffer et rafraîchir",heat:"Remplacer mon chauffage"},
 cl_rooms:"Pièces choisies",cl_none:"Aucune pièce. Cliquez dans la maison.",
 rooms:{salon:"Salon",cuisine:"Cuisine",ch:"Chambre",grenier:"Grenier"},
 rn_t:"Rénovation",rn_d:"Dites-nous ce que vous voulez faire, on vous rappelle pour en parler.",
 rn_what:"Quels travaux ?",rn_what_o:{sdb:"Salle de bain",cuisine:"Cuisine",toiture:"Toiture",facade:"Façade",complete:"Toute la maison",autre:"Autre"},
 when:"Pour quand ?",when_o:{asap:"Au plus vite",m3:"Dans les 3 mois",info:"Je me renseigne"},
 panels:n=>`${n} PANNEAUX`,
 wa:"Bonjour S.Majestic, j’aimerais un prix pour mon projet.",
 sv_h:"Ce que nous faisons",sv_p:"Tout ce qui rend une maison plus confortable et moins chère à chauffer, avec un seul contact du début à la fin.",
 sv:{chassis:["Châssis et portes","PVC, alu ou bois. Fenêtres, portes d’entrée, portes-fenêtres, baies coulissantes.","Calculer mon prix"],
     iso:["Isolation","Toiture, murs et sols. On isole là où votre maison perd sa chaleur.","Demander un prix"],
     solar:["Panneaux solaires","Pour produire votre propre électricité. Installés par nos partenaires certifiés.","Demander un prix"],
     clim:["Clim et pompe à chaleur","Chaud l’hiver, frais l’été. Installés par nos partenaires certifiés.","Demander un prix"],
     finit:["Finitions et aménagement","Plafonnage, cloisons, sols, peinture et enduit de façade.","Calculer mon prix"],
     reno:["Rénovation","Salle de bain, cuisine, toiture, façade ou la maison entière.","Demander un prix"],
     materiel:["Matériel et chantier","Mini-pelle avec chauffeur, grue à la journée, citerne d’eau de pluie.","Voir les tarifs"]},
 ba_h2:"Le même châssis, <span class='ac'>avant et après.</span>",
 ba_p:"Maison de rangée à Ronse : porte d’entrée et châssis remplacés, double vitrage. Glissez le curseur.",
 ba_avant:"Avant",ba_apres:"Après",illus3d:"Vue 3D",
 ba_note:"Chantier réalisé par S.Majestic. Glissez le curseur pour comparer.",
 gal_more:"Voir les 12 photos",gal_open:"Agrandir la photo",gal_prev:"Photo précédente",gal_next:"Photo suivante",gal_close:"Fermer",
 photo:"Photo à venir",pg_faq_h:"Questions fréquentes",
 h3d_load:"Chargement de la maison en 3D…",h3d_err:"La vue 3D n’a pas pu se charger. Le calculateur fonctionne quand même : utilisez les boutons + et − à droite.",h3d_retry:"Réessayer",
 ab_ph:"Photo du patron sur chantier",ab_h:"Qui est derrière S.Majestic ?",
 ab_p1:"S.Majestic, c’est <span class='ph'>[Prénom]</span>, <span class='ph'>[X]</span> ans de métier dans la rénovation à Ronse et dans la région. Quand vous appelez, c’est à lui que vous parlez, et c’est lui qui vient mesurer chez vous.",
 ab_p2:"Pour les panneaux solaires et la clim, il travaille avec des installateurs certifiés qu’il connaît bien. Vous gardez le même contact du devis jusqu’à la fin du chantier.",
 f1_b:"Un seul contact",f1_s:"du devis à la fin du chantier",f2_b:"Visite gratuite",f2_s:"mesures et devis sans engagement",f3_b:"FR et NL",f3_s:"des deux côtés de la frontière",
 wk_h:"Nos réalisations",wk_p:"Des vraies photos de nos chantiers, avant et après.",
 wk_1:"Photo avant / après",wk_2:"Photo chantier",wk_3:"Photo chantier",wk_4:"Photo chantier",wk_5:"Photo chantier",
 rv_h:"Avis Google",rv_p:"Ici s’afficheront les vrais avis de vos clients, dès que la fiche Google sera créée.",rv_tag:"À connecter",
 hw_h:"Comment ça se passe",
 hw1_h:"Vous calculez ou vous appelez",hw1_p:"Avec le simulateur, par téléphone ou en envoyant des photos sur WhatsApp.",
 hw2_h:"On vous rappelle",hw2_p:"On affine le prix avec vous et on vous propose nos remises du moment.",
 hw3_h:"On vient mesurer",hw3_p:"Visite gratuite chez vous, puis un devis clair et détaillé.",
 hw4_h:"On réalise les travaux",hw4_p:"Chantier propre et rangé. On vous aide aussi pour les primes.",
 pr1_k:"TVA à 6 %",pr1_p:"Au lieu de 21 % si votre maison a plus de 10 ans.",
 pr2_k:"Primes en Flandre",pr2_p:"Mijn VerbouwPremie pour l’isolation, le vitrage et la pompe à chaleur, selon vos revenus.",
 pr3_k:"Primes en Wallonie",pr3_p:"Nouveau système à partir du 1er octobre 2026. On vous dit ce qui s’applique à vous.",
 pr4_k:"Le dossier",pr4_p:"On regarde avec vous les aides possibles et on prépare les papiers.",
 faq_h:"Questions fréquentes",
 q0:"Le prix du simulateur est-il fiable ?",a0:"Oui, comme estimation. Les fenêtres sont calculées au m² selon des tailles standard, les portes et les baies au forfait, sur base des prix moyens du marché belge. Le prix exact est confirmé après la prise de mesures chez vous, et peut inclure nos remises du moment.",
 q1:"Je ne connais rien aux travaux, c’est un problème ?",a1:"Non. Cliquez sur « Je ne sais pas » si vous hésitez : on calcule avec le choix le plus courant et on vous conseille ensuite.",
 q2:"Vous posez vous-mêmes les panneaux solaires et les clims ?",a2:"Non, ce sont nos partenaires certifiés qui les installent. Vous gardez un seul contact : S.Majestic.",
 q3:"La visite est-elle payante ?",a3:"Non. La visite, les mesures et le devis sont gratuits et sans engagement.",
 q4:"Vous parlez néerlandais ?",a4:"Oui. Ja, wij spreken Nederlands én Frans.",
 ct_h:"Une question, un projet ?",ct_p:"Écrivez-nous ou appelez-nous. On répond en français ou en néerlandais.",ct_msg:"Votre projet en quelques mots",ct_send:"Envoyer",

 /* ---- coordonnées officielles (BCE : S. MAJESTIC BV, 27/02/2025) ---- */
 ct_addr:"Sint-Cornelisstraat 59<br>9600 Ronse",
 ft_coord:"Sint-Cornelisstraat 59, 9600 Ronse<br>BE 1020.521.459",
 ft_copy:"© 2026 S. Majestic SRL · BE 1020.521.459",
 ft_legal:"Mentions légales et vie privée",
 lg_h1:"Mentions légales et <span class='ac'>vie privée</span>",lg_lead:"Les informations que la loi belge impose à tout site commercial, et ce qu’on fait de vos données.",
 ft_about:"Construction et rénovation à Ronse et dans la région. Châssis, isolation, solaire, clim.",ft_svc:"Services",ft_zone:"Zone",ft_contact:"Contact",ft_h1:"Lun–ven 8h–18h",ft_h2:"Sam 9h–13h",
 ft_demo:"Maquette : téléphone, e-mail et horaires à confirmer",
 mb_l:"Votre prix",mb_cta:"Mon offre"
},
nl:{
 u_tel:"Tel. +32 4xx xx xx xx",
 h1_html:"Uw woning. <span class='ac'>Ons vakmanschap.</span>",
 cta_b2:"Iemand spreken",hero_chk:"Gratis offerte, vrijblijvend bezoek, in het Nederlands en het Frans.",
 hero_chip_b:"Prijs in 1 minuut",hero_chip_s:"Klik op uw woning en de prijs verschijnt.",
 rv_note:"Google-reviews",rv_sub:"Te koppelen zodra de fiche bestaat",
 sv_h2:"Wat kunnen we <span class='ac'>voor u doen?</span>",
 br_h:"De merken <span class='ac'>waarmee we werken.</span>",br_p:"Ramen, isolatie, zonnepanelen, warmtepompen: we werken met gekende fabrikanten.",br_slot:"Logo toe te voegen",
 tr_chip:"Vakmanschap sinds [X] jaar",
 tr_h:"Voor plaatsing, onderhoud <span class='ac'>en herstellingen.</span>",
 tr_1h:"Een duidelijke offerte",tr_1p:"U weet welke materialen in de prijs zitten.",
 tr_2h:"Uitgelegde keuzes",tr_2p:"We zeggen u waarom we dat raam of die isolatie voorstellen.",
 tr_3h:"Ook na de werf",tr_3p:"Bel ons gerust voor onderhoud, een herstelling of een vraag.",
 tr_link:"Meer over S.Majestic",
 zone_l:"Vanuit <b>Ronse</b>, bij u thuis in <b>Oost-Vlaanderen en Henegouwen</b>.",zone_r:"Oudenaarde, Geraardsbergen, Kluisbergen, Doornik, Frasnes: ook bij u komen we langs.",
 strip_h:"Onderhoud of herstelling van uw installatie?",
 strip_p:"Geef ons het merk, het type toestel of raam en beschrijf het probleem.",strip_btn:"Interventie aanvragen",
 wk_h2:"Onze werven, <span class='ac'>in het echt.</span>",
 qt_h:"Een offerte aanvragen <span class='ac'>of een vraag stellen?</span>",
 qt_p:"Voor een prijs meteen gebruikt u de configurator. Voor de rest schrijft u ons: we antwoorden snel.",
 qt_urg:"Dringend?",qt_urg_p:"Bel ons om het te bespreken:",
 faq_h2:"Uw vragen over S.Majestic <span class='ac'>en onze regio.</span>",
 faq_int:"Wat we doen, waar we werken en hoe u een offerte aanvraagt.",
 faq_cta_p:"Staat uw vraag er niet bij? Stel ze gerust, we antwoorden dezelfde dag.",
 faq_cta_b:"Mijn vraag stellen",
 ft_after:"Na de werf.",ft_after_p:"Voor onderhoud, een herstelling of uitleg over uw installatie blijven we bereikbaar.",
 svb:{chassis:["PVC, aluminium of hout, op maat","Ramen, voordeuren, schuiframen","Wegnemen van de oude ramen en afwerking"],
      iso:["Dak, muren en vloeren","Spouwmuur inblazen of buitenisolatie","Diktes conform de premies"],
      solar:["Studie van uw dak en uw factuur","Panelen en omvormer geplaatst door onze gecertificeerde partners","Dossier en indienststelling inbegrepen"],
      clim:["Omkeerbare airco of lucht-waterwarmtepomp","Eén kamer of de hele woning","Geplaatst door een gecertificeerde installateur"],
      finit:["Pleisterwerk op nieuwe of bestaande muur","Metalstud-, gyproc- en akoestische wanden","Parket, tegels, schilderwerk en gevelbezetting"],
      reno:["Badkamer, keuken, dak, gevel","Coördinatie van alle vakmensen","Eén aanspreekpunt van begin tot eind"]},

 badge:"Nieuw: uw prijs online, in 1 minuut",cta_b:"Bekijk onze diensten",
 st1_n:"5 diensten",st1_l:"Ramen, isolatie, zonnepanelen, airco, afwerking",
 st2_n:"1 aanspreekpunt",st2_l:"Van offerte tot oplevering",
 st3_n:"NL & FR",st3_l:"Aan beide kanten van de taalgrens",
 st4_n:"Gratis offerte",st4_l:"Bezoek en opmeting vrijblijvend",
 sv_eb:"Onze diensten",wy_eb:"Waarom wij",hw_eb:"Zo gaan we te werk",pr_eb:"Premies & btw",ab_eb:"Het bedrijf",wk_eb:"Realisaties",tm_eb:"Klantenreviews",
 wy_h:"Renoveren zonder achter tien bedrijven aan te lopen",
 wy_p:"U zegt ons wat u wilt vervangen. Wij regelen de vakmensen, de planning en de papieren.",
 w1_h:"Een prijs nog voor u belt",w1_p:"De configurator geeft u een schatting in één minuut, zonder uw gegevens achter te laten.",
 w2_h:"Eén contact voor alles",w2_p:"Ramen, isolatie, zonnepanelen, airco: één persoon volgt uw werf van begin tot eind.",
 w3_h:"Het papierwerk doen wij",w3_p:"6 % btw, gewestelijke premies, dossiers: we checken waar u recht op hebt en bereiden de documenten voor.",
 tm_h:"Wat uw klanten hier straks vertellen",tm_p:"Hier verschijnen uw echte Google-reviews zodra de bedrijfsfiche bestaat.",
 tm_q:"Hier komt de review van uw klant, met score en voornaam.",tm_who:"Voornaam · Ronse",
 end_h:"Uw prijs in één minuut, uw offerte in één bezoek",
 end_p:"Begin met de configurator: klik op uw woning, bekijk de prijs en vraag uw gedetailleerde offerte aan als het u bevalt.",
u_hours:"Ma–vr 8u–18u · za 9u–13u",u_zone:"Oost-Vlaanderen & Henegouwen",u_demo:"Mock-up: telefoon en e-mail aan te vullen",
 tagline:"Bouw & Renovatie",
 n1:"Ramen",n2:"Isolatie",n3:"Zonnepanelen",n4:"Airco & WP",n5:"Renovatie",n6:"Realisaties",n7:"Contact",cta:"Bereken mijn prijs",
 n8:"Materieel",
 mt_h2:"Materieel en <span class='ac'>werf</span>",
 mt_p:"Voor aannemers, zelfstandigen en particulieren die hun werf zelf beheren. Directe tarieven, geen offerte om op te wachten.",
 mt_1_h:"Grondwerk",mt_1_p:"Minigraver met chauffeur. Terras, oprit, funderingen, aansluitingen.",
 mt_2_h:"Kraanverhuur",mt_2_p:"Werfkraan per dag. Geleverd en opgehaald ter plaatse.",
 mt_3_h:"Regenwaterput",mt_3_p:"Levering en plaatsing, grondwerk inbegrepen. Drie volumes naar keuze.",
 mt_h:"per uur",mt_j:"per dag",mt_voy:"per rit",mt_dem:"Op aanvraag",
 mt_pelle:"Minigraver met chauffeur",mt_livr:"Levering en ophaling",
 mt_g1:"Kraan E10z",mt_g2:"Kraan E27z",
 mt_c1:"Put 5 000 liter",mt_c2:"Put 10 000 liter",mt_c3:"Put 20 000 liter",
 mt_fine:"Tarieven excl. 21 % btw. Materieelverhuur valt niet onder de 6 % btw voor renovatiewerken. Minimumfacturatie, verzekering en beschikbaarheid telefonisch te bevestigen.",
 mt_cta:"Beschikbaarheid vragen",mt_more:"Alle tarieven bekijken",
 h1:"Bereken de prijs van uw werken",h1_p:"Teken uw woning, klik op wat u wilt vervangen. Voor ramen ziet u de prijs meteen.",
 c1:"Gratis offerte",c2:"Zonder registratie",c3:"Wij spreken Nederlands en Frans",
 hb_lv:"Bouwlagen",hb_w:"Breedte",hb_t:"Woning",hb_d:"Diepte",
 iso_wall:"Hoe de muren isoleren?",iso_wall_o:{creux:"In de spouwmuur",ite:"Langs buiten"},
 iso_wall_w:{creux:"We blazen het isolatiemateriaal in de spouw. Snel en het voordeligst.",ite:"Isolatie + crepi op de gevel. Doeltreffender, maar duidelijk duurder."},
 cd_iso:{toit:"Dak",creux:"Spouwmuren (inblazen)",ite:"Muren langs buiten",sol:"Vloer"},
 cd_surf:"Geschatte oppervlakten",cd_surf_d:(w,d,lv)=>`woning van ${nf(w)} × ${d} m, ${lv} bouwla${lv>1?"gen":"ag"}`,
 cd_panel:"Geplaatst paneel",cd_prod:"Geschatte opbrengst",cd_prod_d:"per jaar, ongeveer 950 kWh per kWp",
 cd_clim:{mono:"Eerste kamer (buitenunit inbegrepen)",extra:"Extra kamer",pac:"Lucht-waterwarmtepomp"},
 cd_src2:"Gemiddelde Belgische marktprijzen 2026. Oppervlakten geschat op basis van de woning die u instelde: ze worden bij het bezoek opgemeten.",
 p_offer2:"Mijn gedetailleerde offerte ontvangen",
 p_fine2:"Schatting op basis van de woning die u instelde. De exacte prijs wordt bevestigd na het gratis bezoek bij u thuis.",
 p_empty_iso:"Kies wat u wilt isoleren",p_empty_sol:"Voeg panelen toe",p_empty_clim:"Kies kamers",
 sol_noprime:"Sinds 2024 is er geen gewestelijke premie meer voor zonnepanelen in Vlaanderen of Wallonië. Er blijven 6 % btw en renteloze leningen.",w2:"2 ramen",w3:"3 ramen",t_mit:"Rijwoning",t_f3:"Halfopen",t_f4:"Open",
 v_front:"3D-zicht",v_drag:"sleep om te draaien",v_cut:"Zicht: binnenkant",
 hint_chassis:"Klik op de ramen · draai om de achtergevel te zien",hint_iso:"Klik op het dak, de muren of de vloer",hint_solar:"Klik op het dak om panelen toe te voegen",hint_clim:"Klik op de kamers die u wilt uitrusten",hint_reno:"Kies uw werken rechts",
 lg_sel:"Te vervangen",lg_glass:"Huidig",lg_iso:"Te isoleren",lg_sp:"Paneel",lg_room:"Uitgeruste kamer",
 s_chassis:"Ramen",s_iso:"Isolatie",s_solar:"Zonne",s_clim:"Airco",s_reno:"Renovatie",
 fin_t:"Afwerking en inrichting",fin_d:"Pleisterwerk, wanden, vloeren, schilderwerk en gevel. U kiest, wij berekenen de oppervlakten voor u.",
 fin_what:"Binnen",fin_what_o:{peinture:"Schilderwerk",plafonnage:"Pleisterwerk",cloison:"Nieuwe wand",plafondrf:"Brandwerend plafond",sols:"Vloer"},
 fin_what2:"Buiten",fin_what2_o:{enduisage:"Gevelbezetting"},
 fin_w:"Meerdere keuzes mogelijk. We berekenen de oppervlakten op basis van de woning die u instelde.",
 fin_plafo:"Op welke ondergrond?",fin_plafo_o:{neuf:"Nieuwe muur",vieux:"Bestaande muur"},
 fin_plafo_w:{neuf:"Nieuwe blokken of bakstenen, rechte ondergrond. 18 €/m².",vieux:"Renovatie, 25 €/m². Dikte tot 1 cm inbegrepen; daarboven volgt een supplement ter plaatse."},
 fin_cl:"Soort wand",fin_cl_o:{stud:"Metalstud + gyproc",phonique:"Akoestische wand"},
 fin_cl_w:{stud:"50 €/m². Akoestische of thermische isolatie in supplement, te begroten bij het bezoek.",phonique:"150 €/m². Gaat onder de 80 dB: ideaal tussen twee woningen of voor een tienerkamer."},
 fin_cl_m2:"Wandoppervlakte",fin_cl_w2:m=>`${m} m², dus ongeveer ${Math.round(m/2.6*10)/10} m lang bij 2,6 m hoog.`,
 fin_rf:"Brandweerstand",fin_rf_o:{rf30:"RF 30 minuten",rf1h:"RF 1 uur"},
 fin_rf_w:{rf30:"70 €/m². Het minimum tussen twee woningen in de meeste gemeenten.",rf1h:"90 €/m². Vereist voor een handelszaak, horeca of appartementsgebouw."},
 fin_sol:"Welke vloer?",fin_sol_o:{parquet:"Parket",carrelage:"Tegels"},
 fin_sol_w:{parquet:"45 €/m², levering en plaatsing van laminaat 7 mm. U mag een ander model kiezen, de prijs volgt.",carrelage:"60 €/m², levering en plaatsing. Tegels naar keuze tot 25 €/m²; daarboven rekenen we het verschil bij."},
 fin_scope:"Welke oppervlakte?",fin_scope_o:{full:"De hele woning",rooms:"Enkele kamers"},
 fin_rooms:"Aantal kamers",fin_room_w:n=>`Ongeveer ${n*18} m² vloer, dus ${Math.round(n*18*2.5)} m² muren.`,
 fin_full_w:(sol,mur)=>`Ongeveer ${sol} m² plafonds en ${mur} m² muren voor de woning die u instelde.`,
 fin_etat:"Staat van de muren",fin_etat_o:{bon:"Goede staat",moyen:"Enkele gaten te vullen",abime:"Beschadigd"},
 fin_etat_w:{bon:"Een grondlaag en twee lagen volstaan. Dit is het goedkoopste geval.",moyen:"Vullen, schuren, grondlaag en dan twee lagen. Dit komt het vaakst voor.",abime:"Afbijten en renovatiepleister vóór het schilderen. Reken op meer."},
 fin_fini:"Soort bezetting",fin_fini_o:{mono:"Eenlaagse bezetting",silicone:"Siliconenafwerking"},
 fin_fini_w:{mono:"De klassieker, goede prijs-kwaliteit. Levensduur 20 tot 30 jaar.",silicone:"Duurder maar waterafstotend en zelfreinigend. Ideaal voor een gevel op het regenseizoen."},
 fin_echaf:"Stelling nodig?",fin_echaf_o:{oui:"Ja",non:"Nee, gelijkvloers"},
 fin_echaf_w:"Zodra er op de verdieping gewerkt wordt, is een stelling verplicht. Reken ongeveer 14 €/m² extra.",
 p_empty_finit:"Kies uw afwerkingswerken",hint_finit:"De gevel licht op wanneer u de bezetting kiest",
 lg_fin:"Te bezetten gevel",s_finit:"Afwerking",
 cd_fin:{peint_mur:"Muren schilderen",peint_plaf:"Plafonds schilderen",plafo_mur:"Muren pleisteren",plafo_plaf:"Plafonds pleisteren",cloison_stud:"Metalstud + gyproc",cloison_phonique:"Akoestische wand",rf30:"Plafond RF 30 min",rf1h:"Plafond RF 1 u",parquet:"Laminaat 7 mm",carrelage:"Tegels geplaatst",endui:"Gevelbezetting",echaf:"Stelling"},
 cart_t:"Totaal van uw project",cart_one:"dienst",cart_many:"diensten",cart_rm:"Verwijderen",
 t_chassis:"Uw nieuwe ramen",d_chassis:"Klik op de woning of gebruik + en −. Voeg ook de ramen aan de achter- en zijkant toe.",
 it:{std:"Gewoon raam",small:"Klein raam",large:"Groot raam",door:"Voordeur",pf:"Raamdeur",slide:"Schuifraam"},
 ex:{std:"ongeveer 100 × 130 cm",small:"ongeveer 60 × 60 cm, badkamer, wc",large:"ongeveer 200 × 130 cm, woonkamer",door:"hoofddeur",pf:"tot op de grond, meestal naar de tuin",slide:"groot schuivend raam"},
 g_mat:"Materiaal",g_col:"Kleur",g_gl:"Isolatie van de beglazing",g_age:"Is uw woning ouder dan 10 jaar?",unsure:"Ik weet het niet",
 o_mat:{pvc:"PVC",alu:"Alu",bois:"Hout"},o_col:{white:"Wit",color:"Antraciet"},o_gl:{double:"Dubbel",triple:"Driedubbel"},o_age:{old:"Ja",new:"Nee"},
 w_mat:{pvc:"Meest gekozen: goede prijs, geen onderhoud.",alu:"Slanke profielen, moderne look. <b>Ongeveer +35 %</b>",bois:"Warm, vraagt wat onderhoud. <b>Ongeveer +45 %</b>",unsure:"We rekenen met PVC, het meest gekozen."},
 w_col:{white:"Klassiek, past overal bij.",color:"De meest gevraagde kleur nu. <b>Ongeveer +12 %</b>",unsure:"We rekenen met wit. U kiest met stalen."},
 w_gl:{double:"De keuze van de meeste woningen.",triple:"Nog warmer en stiller. <b>Ongeveer +12 %</b>",unsure:"We rekenen met dubbele beglazing."},
 w_age:{old:"Verlaagde btw van <b>6 %</b>.",new:"Normale btw van 21 %.",unsure:"We rekenen met 21 % om niet te laag te schatten."},
 cd_h:"Hoe deze prijs berekend wordt",cd_forfait:"forfait, plaatsing inbegrepen",cd_opts:"Opties",
 cd_min:"minimum per opening",cd_triple:"driedubbele beglazing +15 %",cd_color:"kleur +10 %",
 cd_ht:"Subtotaal excl. btw",cd_vat:v=>`${v} % btw`,cd_tot:"Totaal",
 cd_src:"Gemiddelde Belgische marktprijzen 2026 (ramen per m², deuren en schuiframen per stuk, minimum 400 € per opening). Uw echte tarieven vervangen deze waarden.",
 p_lbl:"Uw geschatte prijs",p_about:"ongeveer",p_empty:"Klik op een raam",
 p_meta:(v,a,b)=>`Plaatsing en ${v} % btw inbegrepen<br>tussen ${a} en ${b}`,
 p_meta2:(a,b)=>`Plaatsing en btw inbegrepen<br>tussen ${a} en ${b}`,
 p_offer:"Mijn offerte met korting ontvangen",wa_btn:"Foto’s via WhatsApp",
 p_fine:"Schatting voor standaardmaten. De exacte prijs wordt bevestigd na gratis opmeting.",
 of_name:"Voornaam",of_name2:"Naam",of_tel:"Telefoon",of_cp:"Postcode",of_send:"Bel mij terug",of_back:"Annuleren",
 of_err:"Vul uw telefoonnummer in zodat we u kunnen terugbellen.",
 of_ok_h:"Bedankt, genoteerd.",of_ok_p:"We bellen u snel terug.",of_demo:"Mock-up: er werd niets verstuurd.",
 of_intro:"We bellen u terug om de prijs te verfijnen en u onze huidige kortingen voor te stellen.",
 lead_lbl:"Uw prijs",lead_v:"Na terugbellen",lead_meta:"Gratis en vrijblijvend",lead_btn:"Mijn prijs ontvangen",
 partner:"Geplaatst door onze gecertificeerde partners. U hebt maar één contact: S.Majestic.",
 zones_t:"Wat isoleren?",zones:{toit:"Dak",murs:"Muren",sol:"Vloer"},zl:{toit:"DAK",murs:"MUREN",sol:"VLOER"},
 iso_t:"Uw woning isoleren",iso_d:"Klik op de woning of kies hier. Meerdere keuzes mogelijk.",iso_w:"Via het dak verliest een woning vaak de meeste warmte.",
 sol_t:"Zonnepanelen",sol_d:"Zeg ons hoeveel u voor elektriciteit betaalt, wij stellen een aantal panelen voor. U kunt het aanpassen.",
 sol_roof:"Uw dak",sol_roof_o:{pente:"Hellend",plat:"Plat"},sol_bill:"Elektriciteit per maand",sol_bill_o:{b1:"Minder dan 80 €",b2:"80 tot 150 €",b3:"Meer dan 150 €"},
 sol_n:"Aantal panelen",sol_sug:n=>`Voor uw factuur raden we ongeveer ${n} panelen aan.`,sol_none:"Kies uw factuur of klik op het dak.",sol_max:n=>`Plaats voor ${n} panelen op dit dakvlak.`,
 cl_t:"Airco en warmtepomp",cl_d:"U ziet de binnenkant van de woning. Klik op de kamers waar u een toestel wilt.",
 cl_goal:"U wilt",cl_goal_o:{cool:"Koelen in de zomer",both:"Verwarmen en koelen",heat:"Verwarming vervangen"},
 cl_rooms:"Gekozen kamers",cl_none:"Geen kamer. Klik in de woning.",
 rooms:{salon:"Woonkamer",cuisine:"Keuken",ch:"Slaapkamer",grenier:"Zolder"},
 rn_t:"Renovatie",rn_d:"Zeg ons wat u wilt doen, we bellen u terug om het te bespreken.",
 rn_what:"Welke werken?",rn_what_o:{sdb:"Badkamer",cuisine:"Keuken",toiture:"Dak",facade:"Gevel",complete:"Hele woning",autre:"Iets anders"},
 when:"Wanneer?",when_o:{asap:"Zo snel mogelijk",m3:"Binnen 3 maanden",info:"Ik informeer me"},
 panels:n=>`${n} PANELEN`,
 wa:"Hallo S.Majestic, ik wil graag een prijs voor mijn project.",
 sv_h:"Wat wij doen",sv_p:"Alles wat een woning comfortabeler en goedkoper te verwarmen maakt, met één contact van begin tot eind.",
 sv:{chassis:["Ramen en deuren","PVC, alu of hout. Ramen, voordeuren, raamdeuren, schuiframen.","Bereken mijn prijs"],
     iso:["Isolatie","Dak, muren en vloeren. We isoleren waar uw woning warmte verliest.","Prijs aanvragen"],
     solar:["Zonnepanelen","Om zelf stroom op te wekken. Geplaatst door onze gecertificeerde partners.","Prijs aanvragen"],
     clim:["Airco en warmtepomp","Warm in de winter, koel in de zomer. Geplaatst door onze gecertificeerde partners.","Prijs aanvragen"],
     finit:["Afwerking en inrichting","Pleisterwerk, wanden, vloeren, schilderwerk en gevelbezetting.","Bereken mijn prijs"],
     reno:["Renovatie","Badkamer, keuken, dak, gevel of de hele woning.","Prijs aanvragen"],
     materiel:["Materieel en werf","Minigraver met chauffeur, kraan per dag, regenwaterput.","Tarieven bekijken"]},
 ba_h2:"Hetzelfde raam, <span class='ac'>voor en na.</span>",
 ba_p:"Rijwoning in Ronse: voordeur en ramen vervangen, dubbele beglazing. Sleep de schuifregelaar.",
 ba_avant:"Voor",ba_apres:"Na",illus3d:"3D-zicht",
 ba_note:"Werf uitgevoerd door S.Majestic. Sleep de schuifregelaar om te vergelijken.",
 gal_more:"Bekijk de 12 foto's",gal_open:"Foto vergroten",gal_prev:"Vorige foto",gal_next:"Volgende foto",gal_close:"Sluiten",
 photo:"Foto volgt",pg_faq_h:"Veelgestelde vragen",
 h3d_load:"De 3D-woning wordt geladen…",h3d_err:"Het 3D-zicht kon niet laden. De rekenmodule werkt wel: gebruik de knoppen + en − rechts.",h3d_retry:"Opnieuw proberen",
 ab_ph:"Foto van de zaakvoerder op de werf",ab_h:"Wie zit er achter S.Majestic?",
 ab_p1:"S.Majestic, dat is <span class='ph'>[Voornaam]</span>, <span class='ph'>[X]</span> jaar ervaring in renovatie in Ronse en omgeving. Als u belt, spreekt u met hem, en hij komt ook zelf bij u opmeten.",
 ab_p2:"Voor zonnepanelen en airco werkt hij met gecertificeerde installateurs die hij goed kent. U houdt hetzelfde contact van offerte tot oplevering.",
 f1_b:"Eén contact",f1_s:"van offerte tot oplevering",f2_b:"Gratis bezoek",f2_s:"opmeting en offerte vrijblijvend",f3_b:"NL en FR",f3_s:"aan beide kanten van de taalgrens",
 wk_h:"Onze realisaties",wk_p:"Echte foto’s van onze werven, voor en na.",
 wk_1:"Foto voor / na",wk_2:"Foto werf",wk_3:"Foto werf",wk_4:"Foto werf",wk_5:"Foto werf",
 rv_h:"Google-reviews",rv_p:"Hier komen de echte reviews van uw klanten, zodra de Google-fiche bestaat.",rv_tag:"Te koppelen",
 hw_h:"Hoe het verloopt",
 hw1_h:"U berekent of belt",hw1_p:"Met de simulator, telefonisch of met foto’s via WhatsApp.",
 hw2_h:"Wij bellen terug",hw2_p:"We verfijnen de prijs samen en stellen onze huidige kortingen voor.",
 hw3_h:"Wij komen opmeten",hw3_p:"Gratis bezoek bij u thuis, daarna een duidelijke, gedetailleerde offerte.",
 hw4_h:"Wij voeren de werken uit",hw4_p:"Nette werf. We helpen u ook met de premies.",
 pr1_k:"6 % btw",pr1_p:"In plaats van 21 % als uw woning ouder is dan 10 jaar.",
 pr2_k:"Premies in Vlaanderen",pr2_p:"Mijn VerbouwPremie voor isolatie, beglazing en warmtepomp, afhankelijk van uw inkomen.",
 pr3_k:"Premies in Wallonië",pr3_p:"Nieuw systeem vanaf 1 oktober 2026. Wij zeggen u wat voor u geldt.",
 pr4_k:"Het dossier",pr4_p:"We bekijken samen de mogelijke steun en bereiden de papieren voor.",
 faq_h:"Veelgestelde vragen",
 q0:"Is de prijs van de simulator betrouwbaar?",a0:"Ja, als schatting. Ramen worden per m² berekend volgens standaardmaten, deuren en schuiframen per stuk, op basis van gemiddelde Belgische marktprijzen. De exacte prijs wordt bevestigd na opmeting bij u thuis en kan onze huidige kortingen bevatten.",
 q1:"Ik ken niets van werken, is dat een probleem?",a1:"Nee. Klik op ‘Ik weet het niet’ als u twijfelt: we rekenen met de meest gekozen optie en adviseren u daarna.",
 q2:"Plaatsen jullie zelf zonnepanelen en airco’s?",a2:"Nee, onze gecertificeerde partners plaatsen ze. U houdt één contact: S.Majestic.",
 q3:"Is het bezoek betalend?",a3:"Nee. Bezoek, opmeting en offerte zijn gratis en vrijblijvend.",
 q4:"Spreken jullie Frans?",a4:"Ja. Oui, nous parlons français et néerlandais.",
 ct_h:"Een vraag, een project?",ct_p:"Schrijf of bel ons. Wij antwoorden in het Nederlands of het Frans.",ct_msg:"Uw project in een paar woorden",ct_send:"Versturen",

 ct_addr:"Sint-Cornelisstraat 59<br>9600 Ronse",
 ft_coord:"Sint-Cornelisstraat 59, 9600 Ronse<br>BE 1020.521.459",
 ft_copy:"© 2026 S. Majestic BV · BE 1020.521.459",
 ft_legal:"Juridische informatie en privacy",
 lg_h1:"Juridische informatie en <span class='ac'>privacy</span>",lg_lead:"De gegevens die de Belgische wet van elke commerciële website eist, en wat we met uw gegevens doen.",
 ft_about:"Bouw en renovatie in Ronse en omgeving. Ramen, isolatie, zonnepanelen, airco.",ft_svc:"Diensten",ft_zone:"Regio",ft_contact:"Contact",ft_h1:"Ma–vr 8u–18u",ft_h2:"Za 9u–13u",
 ft_demo:"Mock-up: telefoon, e-mail en openingsuren te bevestigen",
 mb_l:"Uw prijs",mb_cta:"Mijn offerte"
}};

let lang="fr"; try{const s=localStorage.getItem("smj-lang"); if(s==="fr"||s==="nl") lang=s;}catch(e){}
const S={svc:((document.body&&document.body.dataset.svc)||"chassis"),H:{lv:2,cols:3,type:"mit",depth:8},q:{std:0,small:0,large:0,door:0,pf:0,slide:0},mat:"pvc",col:"white",gl:"double",age:"old",
 iso:{zones:[],wall:"creux",when:null},solar:{roof:null,bill:null,n:0,manual:false,when:null},clim:{goal:null,rooms:[],when:null},finit:{what:[],scope:"full",rooms:2,etat:"moyen",plafo:"vieux",cloison:"stud",cloisonM2:10,rf:"rf30",sol:"parquet",fini:"mono",echaf:null,when:null},reno:{what:null,when:null},
 form:false,sent:false,name:"",tel:"",cp:""};
let shown=0, anim=null, GEO=null;
const $=s=>document.querySelector(s), L=()=>T[lang];
const eur=v=>new Intl.NumberFormat(lang==="nl"?"nl-BE":"fr-BE",{maximumFractionDigits:0}).format(v)+" €";
const r50=v=>Math.round(v/50)*50;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- géométrie de la maison ---------- */
/* ================== MAISON 3D (three.js) ================== */
const V={ready:false,rotY:-0.40,rotX:0.18,drag:null,need:true};
const LVH=2.75, ROOFH=2.6, OVER=0.42, WT=0.28, PANW=1.05, PANH=1.70;
const COL={
  wall:0xE9E0CD, wallSel:0xDCB45F, roof:0x5E5A54, roofSel:0xC9A049, slab:0xC9C2B4,
  stone:0xD9D3C5, plinth:0x8E8679, ground:0x9FB579, path:0xCFC9BC, hedge:0x4E6B3C,
  nb:0xD8D2C6, nbRoof:0x938E85, glass:0x6F93AC, panel:0x14202E, rail:0x9AA3AC,
  gold:0xB0862E, white:0xF2F0EA, anthracite:0x34383C, alu:0xA9AEB3, bois:0x8C5B36,
  unit:0xF7F6F2, unitDark:0xC9CDD1, wood:0x8A6A48, trim:0xE6E1D4
};
function frameColor(){ if(S.col==="color") return COL.anthracite; if(S.mat==="bois") return COL.bois; if(S.mat==="alu") return COL.alu; return COL.white; }

/* ---------- matières ---------- */
const MS=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.88,metalness:.02},o));
const M=MS;
const TEXC={};
function cv2(n){ const c=document.createElement("canvas"); c.width=c.height=n; return c; }
function texPlaster(){
  if(!TEXC.pl){ const c=cv2(128), x=c.getContext("2d");
    x.fillStyle="#ffffff"; x.fillRect(0,0,128,128);
    for(let i=0;i<2600;i++){ const a=Math.random()*.10; x.fillStyle=`rgba(${Math.random()<.5?90:255},${Math.random()<.5?84:255},70,${a})`;
      x.fillRect(Math.random()*128,Math.random()*128,1.4,1.4); }
    TEXC.pl=c; }
  const t=new THREE.CanvasTexture(TEXC.pl); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
}
function texTile(){
  if(!TEXC.tl){ const c=cv2(128), x=c.getContext("2d");
    x.fillStyle="#9b958c"; x.fillRect(0,0,128,128);
    for(let r=0;r<4;r++){ const y=r*32;
      x.fillStyle="#6f6a62"; x.fillRect(0,y,128,30);
      for(let k=0;k<4;k++){ const xx=k*32+(r%2?16:0);
        x.fillStyle="#7d786f"; x.fillRect(xx+1,y+2,29,27);
        x.fillStyle="rgba(255,255,255,.10)"; x.fillRect(xx+1,y+2,29,4); } }
    TEXC.tl=c; }
  const t=new THREE.CanvasTexture(TEXC.tl); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
}
function texGrass(){
  if(!TEXC.gr){ const c=cv2(128), x=c.getContext("2d");
    x.fillStyle="#a8bd82"; x.fillRect(0,0,128,128);
    for(let i=0;i<4000;i++){ x.fillStyle=`rgba(${70+Math.random()*50|0},${100+Math.random()*60|0},${55+Math.random()*35|0},.5)`;
      x.fillRect(Math.random()*128,Math.random()*128,2,2); }
    TEXC.gr=c; }
  const t=new THREE.CanvasTexture(TEXC.gr); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
}
function texCell(){
  if(!TEXC.pv){ const c=cv2(128), x=c.getContext("2d");
    x.fillStyle="#0f1a28"; x.fillRect(0,0,128,128);
    for(let a=0;a<4;a++) for(let b=0;b<4;b++){
      const g=x.createLinearGradient(a*32,b*32,a*32+32,b*32+32);
      g.addColorStop(0,"#1b2d45"); g.addColorStop(1,"#122034");
      x.fillStyle=g; x.fillRect(a*32+2,b*32+2,28,28); }
    x.strokeStyle="rgba(150,180,215,.35)"; x.lineWidth=1;
    for(let a=0;a<=4;a++){ x.beginPath(); x.moveTo(a*32,0); x.lineTo(a*32,128); x.stroke();
      x.beginPath(); x.moveTo(0,a*32); x.lineTo(128,a*32); x.stroke(); }
    TEXC.pv=c; }
  const t=new THREE.CanvasTexture(TEXC.pv); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
}

/* ---------- géométrie logique ---------- */
function surfaces(){
  const w=S.H.cols===2?5:6.5, d=S.H.depth, lv=S.H.lv;
  const foot=w*d, h=lv*LVH;
  const per = S.H.type==="mit" ? 2*w : S.H.type==="f3" ? 2*w+d : 2*(w+d);
  return {w,d,foot, toit:Math.round(foot*1.3), murs:Math.round(per*h*(1-0.15)), sol:Math.round(foot)};
}
function dims(){
  const w=S.H.cols===2?5:6.5, d=S.H.depth, lv=S.H.lv;
  return {w,d,lv,H:lv*LVH};
}
function roofGeo(){
  const {w,d,H}=dims(), halfD=d/2+OVER;
  const slope=Math.sqrt(ROOFH*ROOFH+halfD*halfD), ang=Math.atan2(ROOFH,halfD);
  return {halfD,slope,ang,spanW:w+2*OVER,H};
}
function facadeOps(){
  const {w,lv}=dims(), cols=S.H.cols, cw=w/cols, out=[];
  for(let f=lv-1;f>=1;f--){
    const y=f*LVH;
    for(let c=0;c<cols;c++){
      const cx=-w/2+cw*c+cw/2, small=(cols===3&&c===1&&f===1);
      out.push(small?{k:"small",x:cx,y:y+1.35,w:.6,h:.6}:{k:"std",x:cx,y:y+1.35,w:1.0,h:1.3});
    }
  }
  if(cols===3){
    out.push({k:"large",x:-w/2+cw,y:1.45,w:2.0,h:1.3});
    out.push({k:"door",x:-w/2+2*cw+cw/2,y:1.12,w:.9,h:2.15});
  } else {
    out.push({k:"std",x:-w/2+cw/2,y:1.45,w:1.0,h:1.3});
    out.push({k:"door",x:-w/2+cw+cw/2,y:1.12,w:.9,h:2.15});
  }
  return out;
}
/* ouvertures de la façade arrière (côté jardin) */
function rearOps(){
  const {w,lv}=dims(), cols=S.H.cols, cw=w/cols, out=[];
  for(let f=lv-1;f>=1;f--){
    const y=f*LVH;
    for(let c=0;c<cols;c++) out.push({k:"std",x:-w/2+cw*c+cw/2,y:y+1.35,w:1.0,h:1.3});
  }
  if(cols===3){
    out.push({k:"slide",x:-w/2+cw+cw/2,y:1.12,w:2.4,h:2.15});   // baie coulissante vers le jardin
    out.push({k:"std",x:-w/2+cw/2,y:1.45,w:1.0,h:1.3});
  } else {
    out.push({k:"pf",x:-w/2+cw+cw/2,y:1.12,w:.9,h:2.15});       // porte-fenêtre
    out.push({k:"std",x:-w/2+cw/2,y:1.45,w:1.0,h:1.3});
  }
  return out;
}
/* ouvertures d'un pignon libre (3 ou 4 façades) */
function sideOps(){
  const {d,lv}=dims(), n=d>=9.5?3:2, out=[];
  for(let f=lv-1;f>=0;f--){
    for(let i=0;i<n;i++){
      const zz=-d/2+d*(i+1)/(n+1), small=(f===0&&i===0);
      out.push(small?{k:"small",x:zz,y:f*LVH+1.45,w:.6,h:.6}
                    :{k:"std", x:zz,y:f*LVH+1.45,w:1.0,h:1.3});
    }
  }
  return out;
}
function roomList(){
  const {lv}=dims(), rooms=[];
  for(let f=lv-1;f>=1;f--){ const n=2*(lv-1-f)+1; rooms.push({id:"f"+f+"a",lvl:f,side:-1,name:["ch",n]},{id:"f"+f+"b",lvl:f,side:1,name:["ch",n+1]}); }
  rooms.push({id:"g_a",lvl:0,side:-1,name:["salon"]},{id:"g_b",lvl:0,side:1,name:["cuisine"]});
  rooms.unshift({id:"attic",lvl:lv,side:0,name:["grenier"]});
  return rooms;
}
function panelCap(){
  const {w}=dims(), r=roofGeo();
  return Math.max(2, Math.floor(w/PANW)*Math.max(1,Math.floor(r.slope/PANH)));
}
function geoData(){ return {cap:panelCap(), rooms:roomList()}; }

function label3D(text,tone,occlude){
  const pad=16, f=44, c=document.createElement("canvas"), x=c.getContext("2d");
  x.font=`700 ${f}px Figtree, Arial`; const wpx=x.measureText(text).width;
  c.width=wpx+pad*2; c.height=f+pad*2;
  const g=c.getContext("2d");
  g.font=`700 ${f}px Figtree, Arial`;
  g.fillStyle=tone==="gold"?"rgba(176,134,46,.96)":"rgba(23,22,15,.88)";
  g.beginPath(); g.roundRect(0,0,c.width,c.height,18); g.fill();
  g.fillStyle=tone==="gold"?"#FFF8E8":"#F6EAD2"; g.textBaseline="middle"; g.fillText(text,pad,c.height/2);
  const t=new THREE.CanvasTexture(c); t.anisotropy=2;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:!!occlude}));
  s.scale.set(c.width/190,c.height/190,1); s.userData={noFit:true};
  return s;
}

/* ---------- scène ---------- */
function init3D(){
  const cv=document.getElementById("house3d"); if(!cv||!window.THREE) return false;
  const r=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
  r.setPixelRatio(Math.min(devicePixelRatio,2));
  r.shadowMap.enabled=true; r.shadowMap.type=THREE.PCFSoftShadowMap;
  if(THREE.sRGBEncoding) r.outputEncoding=THREE.sRGBEncoding;
  if(THREE.ACESFilmicToneMapping){ r.toneMapping=THREE.ACESFilmicToneMapping; r.toneMappingExposure=.98; }
  const sc=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(30,1,.1,220);
  sc.add(new THREE.HemisphereLight(0xdfe8f5,0x8f8a7a,.42));
  const dl=new THREE.DirectionalLight(0xfff1d9,1.05);
  dl.position.set(9,15,11); dl.castShadow=true;
  dl.shadow.mapSize.set(1024,1024);
  const sh=dl.shadow.camera; sh.left=-24; sh.right=24; sh.top=24; sh.bottom=-24; sh.near=1; sh.far=70;
  dl.shadow.bias=-0.0012; sc.add(dl);
  const dl2=new THREE.DirectionalLight(0xc8daf2,.26); dl2.position.set(-10,6,-8); sc.add(dl2);
  const dl3=new THREE.DirectionalLight(0xffffff,.10); dl3.position.set(0,3,14); sc.add(dl3);
  const grp=new THREE.Group(); sc.add(grp);
  V.r=r; V.sc=sc; V.cam=cam; V.grp=grp; V.ray=new THREE.Raycaster(); V.ready=true;
  const res=()=>{ const b=cv.parentElement.getBoundingClientRect();
    r.setSize(b.width,b.height,false); cam.aspect=b.width/b.height; cam.updateProjectionMatrix(); V.need=true; };
  new ResizeObserver(res).observe(cv.parentElement); res();
  const pos=e=>({x:e.clientX,y:e.clientY});
  cv.addEventListener("pointerdown",e=>{ V.drag={...pos(e),moved:0,ry:V.rotY,rx:V.rotX}; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove",e=>{
    if(V.drag){ const dx=e.clientX-V.drag.x, dy=e.clientY-V.drag.y;
      V.drag.moved=Math.max(V.drag.moved,Math.abs(dx)+Math.abs(dy));
      V.rotY=V.drag.ry+dx*.008; V.rotX=Math.max(.02,Math.min(.62,V.drag.rx+dy*.005)); V.need=true; }
    else hover3D(e);
  });
  cv.addEventListener("pointerup",e=>{ const d=V.drag; V.drag=null; if(d&&d.moved<7) click3D(e); });
  cv.addEventListener("pointerleave",()=>{V.drag=null;});
  const loop=()=>{ requestAnimationFrame(loop); if(!V.need) return; V.need=false;
    V.grp.rotation.y=V.rotY; place3D(); r.render(sc,cam); };
  loop();
  return true;
}
function place3D(){
  if(!V.grp) return;
  const box=new THREE.Box3();
  V.grp.children.forEach(o=>{ if(!o.userData||!o.userData.noFit) box.expandByObject(o); });
  if(!isFinite(box.min.x)||box.isEmpty()) return;
  const c=box.getCenter(new THREE.Vector3()), sz=box.getSize(new THREE.Vector3());
  // cadrage qui tient compte du format du canevas (sinon la maison est coupée sur les écrans étroits)
  const fov=V.cam.fov*Math.PI/180, asp=Math.max(.35,V.cam.aspect||1);
  const hFov=2*Math.atan(Math.tan(fov/2)*asp);
  const halfH=sz.y*0.54, halfW=Math.max(sz.x,sz.z)*0.52, depth=Math.max(sz.x,sz.z)*0.5;
  const dist=Math.max(halfH/Math.tan(fov/2), halfW/Math.tan(hFov/2))*1.1+depth;
  const ty=c.y*0.96;
  V.cam.position.set(0, ty+dist*Math.sin(V.rotX), dist*Math.cos(V.rotX));
  V.cam.lookAt(0,ty,0);
}
function pick(e){
  const cv=V.r.domElement, b=cv.getBoundingClientRect();
  V.ray.setFromCamera(new THREE.Vector2(((e.clientX-b.left)/b.width)*2-1, -((e.clientY-b.top)/b.height)*2+1), V.cam);
  return V.ray.intersectObjects(V.grp.children,true).filter(h=>h.object.userData&&h.object.userData.kind);
}
function hover3D(e){
  if(!V.ready) return;
  const hit=pick(e)[0];
  V.r.domElement.style.cursor = hit ? "pointer" : (V.drag?"grabbing":"grab");
}
function click3D(e){
  const hit=pick(e)[0]; if(!hit) return;
  const u=hit.object.userData;
  if(S.svc==="chassis" && u.kind==="op"){ const k=u.k; if(u.on) S.q[k]=Math.max(0,S.q[k]-1); else S.q[k]=Math.min(30,S.q[k]+1); refresh(); }
  else if(S.svc==="iso" && (u.kind==="roof"||u.kind==="wall"||u.kind==="floor")){
    const z=u.kind==="roof"?"toit":u.kind==="wall"?"murs":"sol", a=S.iso.zones, i=a.indexOf(z);
    i<0?a.push(z):a.splice(i,1); refresh();
  }
  else if(S.svc==="solar" && (u.kind==="roof"||u.kind==="panel")){ S.solar.n=Math.min(panelCap(),S.solar.n+1); S.solar.manual=true; refresh(); }
  else if(S.svc==="finit" && u.kind==="wall"){ const a=S.finit.what, i=a.indexOf("enduisage"); i<0?a.push("enduisage"):a.splice(i,1); refresh(); }
  else if(S.svc==="clim" && u.kind==="room"){ const a=S.clim.rooms, i=a.indexOf(u.id); i<0?a.push(u.id):a.splice(i,1); refresh(); }
}

/* ---------- helpers de construction ---------- */
function bx(p,s,mat,ud,noShadow){
  const m=new THREE.Mesh(new THREE.BoxGeometry(s[0],s[1],s[2]),mat);
  m.position.set(p[0],p[1],p[2]);
  if(ud) m.userData=ud;
  if(!noShadow){ m.castShadow=true; m.receiveShadow=true; }
  V.grp.add(m); return m;
}
function cyl(p,rad,h,mat,rot){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(rad,rad,h,14),mat);
  m.position.set(p[0],p[1],p[2]);
  if(rot) m.rotation.set(rot[0]||0,rot[1]||0,rot[2]||0);
  m.castShadow=true; m.userData={noFit:true}; V.grp.add(m); return m;
}
function addBox(p,wd,ht,dp,mat,ud){ return bx(p,[wd,ht,dp],mat,ud); }
let EDGE=null;
function edges(mesh){ EDGE=EDGE||new THREE.LineBasicMaterial({color:0x6E6554,transparent:true,opacity:.35});
  const e=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,20),EDGE);
  e.position.copy(mesh.position); e.rotation.copy(mesh.rotation); e.userData={noFit:true}; V.grp.add(e); return e; }

/* une fenêtre complète : tablette + encadrement + dormant + vitrage + meneaux */
function window3D(o,z,on,fc,kind){
  const g=V.grp;
  const frameMat=MS(on?COL.gold:fc,{roughness:.55,metalness:on?.25:.08});
  const stone=MS(COL.stone,{roughness:.9});
  const glassMat=new THREE.MeshPhongMaterial({color:on?0xE4CE92:COL.glass,shininess:95,specular:0xffffff,transparent:true,opacity:on?.78:.66});
  const ud={kind:"op",k:o.k,on};
  // encadrement clair (ébrasement), légèrement en saillie
  bx([o.x,o.y,z+.02],[o.w+.30,o.h+.26,.07],stone,{noFit:true});
  // dormant (cadre plein) — le vitrage vient DEVANT sa face avant
  const fr=bx([o.x,o.y,z+.075],[o.w+.14,o.h+.14,.08],frameMat,ud);
  // fond sombre : donne de la profondeur, la fenêtre ne disparaît plus en plein soleil
  const inr=new THREE.Mesh(new THREE.PlaneGeometry(o.w,o.h),MS(on?0x6B5520:0x2E3942,{roughness:.9}));
  inr.position.set(o.x,o.y,z+.116); inr.userData=ud; g.add(inr);
  const gl=new THREE.Mesh(new THREE.PlaneGeometry(o.w,o.h),glassMat);
  gl.position.set(o.x,o.y,z+.121); gl.userData=ud; g.add(gl);
  // meneaux / traverses, devant le vitrage
  const bar=(x,y,w2,h2)=>bx([x,y,z+.132],[w2,h2,.035],frameMat,{noFit:true},true);
  if(kind==="door"){
    // panneau bas plein + imposte vitrée
    bx([o.x,o.y-o.h*.22,z+.135],[o.w-.02,o.h*.52,.05],frameMat,{noFit:true},true);
    bar(o.x,o.y+o.h*.06,o.w,.07);
    cyl([o.x+o.w/2-.14,o.y-.02,z+.19],.025,.28,MS(COL.alu,{roughness:.35,metalness:.6}),[0,0,0]);
    bx([o.x,.055,z+.24],[o.w+.5,.11,.5],stone,{noFit:true}); // marche
  } else if(kind==="pf"||kind==="slide"){
    // porte-fenêtre / baie coulissante : vitrage toute hauteur + seuil bas
    if(o.w>1.5){ bar(o.x,o.y,.07,o.h); bar(o.x-o.w/4,o.y,.045,o.h); bar(o.x+o.w/4,o.y,.045,o.h); }
    else bar(o.x,o.y,.055,o.h);
    cyl([o.x+(o.w>1.5?o.w/2-.5:o.w/2-.14),o.y-.05,z+.19],.023,.30,MS(COL.alu,{roughness:.35,metalness:.6}));
    bx([o.x,.045,z+.14],[o.w+.22,.09,.16],stone,{noFit:true});       // seuil
    bx([o.x,.03,z+.6],[o.w+1.0,.06,.95],MS(COL.path,{roughness:1}),{noFit:true},true); // terrasse
  } else if(o.w>1.5){
    bar(o.x-o.w/6,o.y,.055,o.h); bar(o.x+o.w/6,o.y,.055,o.h);
    bx([o.x,o.y-o.h/2-.12,z+.13],[o.w+.34,.09,.22],stone,{noFit:true}); // tablette
  } else if(o.w>.8){
    bar(o.x,o.y,.055,o.h);
    bx([o.x,o.y-o.h/2-.12,z+.13],[o.w+.30,.09,.22],stone,{noFit:true});
  } else {
    bar(o.x,o.y,.045,o.h);
    bx([o.x,o.y-o.h/2-.11,z+.13],[o.w+.26,.08,.20],stone,{noFit:true});
  }
  if(on){ const s=label3D("✓","gold",true); s.position.set(o.x+o.w/2+.26,o.y+o.h/2+.22,z+.4); s.scale.multiplyScalar(.66); g.add(s); }
  return fr;
}

/* maison voisine : même alignement de rue, volume sourd, 2 fenêtres sobres */
function neighbour3D(cx,w,d,H,rh,tone){
  const wm=MS(tone,{roughness:.98}), rm=MS(COL.nbRoof,{roughness:.95});
  bx([cx,H/2,-.55],[w,H,d],wm,{noFit:true});
  const halfD=d/2+.2, slope=Math.sqrt(rh*rh+halfD*halfD), ang=Math.atan2(rh,halfD);
  [1,-1].forEach(s=>{
    const m=bx([cx,H+rh/2+Math.cos(ang)*.06, -.55+s*(halfD/2+Math.sin(ang)*.06)],[w+.1,.13,slope],rm,{noFit:true});
    m.rotation.x=s*ang;
  });
  [1,-1].forEach(s=>{
    const sh=new THREE.Shape(); sh.moveTo(-halfD,0); sh.lineTo(halfD,0); sh.lineTo(0,rh); sh.lineTo(-halfD,0);
    const g2=new THREE.Mesh(new THREE.ShapeGeometry(sh),wm);
    g2.position.set(cx+s*(w/2-.01),H,-.55); g2.rotation.y=s*Math.PI/2; g2.userData={noFit:true}; V.grp.add(g2);
  });
}

function build3D(){
  const g=V.grp; while(g.children.length) g.remove(g.children[0]);
  const {w,d,lv,H}=dims(), cut=S.svc==="clim", iso=S.svc==="iso", t=L();
  const R=roofGeo(), isoZ=S.iso.zones;
  const wallSel=(iso&&isoZ.includes("murs"))||(S.svc==="finit"&&S.finit.what.includes("enduisage")), roofSel=(iso&&isoZ.includes("toit"))||(S.svc==="reno"&&S.reno.what==="toiture"), solSel=iso&&isoZ.includes("sol");

  // --- matières
  const pl=texPlaster(); pl.repeat.set(3,2);
  const wallMat=MS(wallSel?COL.wallSel:COL.wall,{map:pl,roughness:.95});
  const wallIn=MS(0xF4F1EA,{roughness:.95,side:THREE.DoubleSide});
  const tl=texTile(); tl.repeat.set(Math.max(2,Math.round(R.spanW/1.1)),Math.max(2,Math.round(R.slope/1.1)));
  const roofMat=MS(roofSel?COL.roofSel:COL.roof,{map:tl,roughness:.8});
  const roofCut=MS(roofSel?COL.roofSel:COL.roof,{transparent:true,opacity:.22,side:THREE.DoubleSide});
  const slabMat=MS(solSel?COL.wallSel:COL.slab,{roughness:.95});
  const trim=MS(COL.trim,{roughness:.8});
  const zinc=MS(0x9AA0A4,{roughness:.5,metalness:.45});
  const plinth=MS(COL.plinth,{roughness:.95});

  // --- terrain
  const gt=texGrass(); gt.repeat.set(5,5);
  const gr=new THREE.Mesh(new THREE.CircleGeometry(Math.max(w,d)*2.6,64),MS(COL.ground,{map:gt,roughness:1}));
  gr.rotation.x=-Math.PI/2; gr.position.y=-0.03; gr.receiveShadow=true; gr.userData={noFit:true}; g.add(gr);
  const doorOp=facadeOps().find(o=>o.k==="door"), doorX=doorOp?doorOp.x:w/2-1;
  if(!cut){
    // allée + haie basse en limite de terrain
    const pl2=Math.max(w,d)*0.46;
    const pa=new THREE.Mesh(new THREE.PlaneGeometry(1.4,pl2),MS(COL.path,{roughness:1}));
    pa.rotation.x=-Math.PI/2; pa.position.set(doorX,-0.016,d/2+pl2/2+.1);
    pa.receiveShadow=true; pa.userData={noFit:true}; g.add(pa);
    // arbustes le long de la façade
    const hm=MS(COL.hedge,{roughness:1,flatShading:true});
    [-w/2+.7,-w/2+1.9,doorX-1.5].forEach((hx,i)=>{
      if(Math.abs(hx-doorX)<1.0) return;
      const r0=.36+i*.05;
      const sb=new THREE.Mesh(new THREE.IcosahedronGeometry(r0,1),hm);
      sb.position.set(hx,r0*.82,d/2+.75); sb.castShadow=true; sb.receiveShadow=true;
      sb.userData={noFit:true}; g.add(sb);
    });
  }

  // --- soubassement + dalle (cliquable = isolation du sol)
  bx([0,-.07,0],[w+.22,.22,d+.22],slabMat,{kind:"floor"});
  if(cut){ // en vue intérieure le soubassement ne doit pas masquer le rez
    bx([0,.10,-d/2+.12],[w+.14,.22,.24],plinth,{noFit:true},true);
    [-1,1].forEach(s2=>bx([s2*(w/2+.02),.10,0],[.22,.22,d+.14],plinth,{noFit:true},true));
  } else bx([0,.20,0],[w+.14,.42,d+.14],plinth,{noFit:true});

  // --- murs épais (en vue intérieure, les murs latéraux deviennent translucides)
  const ghost=MS(COL.wall,{transparent:true,opacity:.22,depthWrite:false,roughness:.9});
  const mk=(p,s,ud)=>bx(p,s,wallMat,ud);
  mk([0,H/2,-d/2+WT/2],[w,H,WT],{kind:"wall"});                 // arrière
  if(cut){
    bx([-w/2+WT/2,H/2,0],[WT,H,d-2*WT],ghost,{noFit:true},true);
    bx([w/2-WT/2,H/2,0],[WT,H,d-2*WT],ghost,{noFit:true},true);
  } else {
    mk([-w/2+WT/2,H/2,0],[WT,H,d-2*WT],{kind:"wall"});          // gauche
    mk([w/2-WT/2,H/2,0],[WT,H,d-2*WT],{kind:"wall"});           // droite
  }
  if(!cut){
    mk([0,H/2,d/2-WT/2],[w,H,WT],{kind:"wall"});                // façade
    // corniche sous la toiture + bandeaux d'étage (avant ET arrière)
    [1,-1].forEach(s=>{
      bx([0,H-.07,s*(d/2+.04)],[w+.1,.14,.16],trim,{noFit:true});
      for(let f=1;f<lv;f++) bx([0,f*LVH-.06,s*(d/2+.05)],[w+.06,.13,.12],trim,{noFit:true});
    });
  } else {
    // intérieur : mur de refend + revêtement clair
    bx([0,H/2,0],[.14,H,d-2*WT],wallIn,{noFit:true});
    const back=new THREE.Mesh(new THREE.PlaneGeometry(w-.2,H),wallIn); back.position.set(0,H/2,-d/2+WT+.01); back.userData={noFit:true}; g.add(back);
  }

  // --- planchers
  for(let f=1;f<lv;f++) bx([0,f*LVH,0],[w-.06,.16,d-.06],slabMat,{kind:"floor"});
  if(cut) bx([0,H,0],[w-.06,.16,d-.06],slabMat,{kind:"floor"});

  // --- toiture : 2 pans + pignons + faîtage + gouttières
  [1,-1].forEach(s=>{
    const front=(s===1);
    const mat=(cut&&front)?roofCut:roofMat;
    const m=bx([0,R.H+ROOFH/2+Math.cos(R.ang)*.07, s*(R.halfD/2+Math.sin(R.ang)*.07)],[R.spanW,.14,R.slope],mat,
      (cut&&front)?{noFit:true}:{kind:"roof"},cut&&front);
    m.rotation.x=s*R.ang;
  });
  // pignons (triangles latéraux)
  const gableMat=cut?ghost:MS(wallSel?COL.wallSel:COL.wall,{side:THREE.DoubleSide,roughness:.95});
  [1,-1].forEach(s=>{
    const sh=new THREE.Shape(); sh.moveTo(-d/2,0); sh.lineTo(d/2,0); sh.lineTo(0,ROOFH); sh.lineTo(-d/2,0);
    const gm=new THREE.Mesh(new THREE.ShapeGeometry(sh),gableMat);
    gm.position.set(s*(w/2-.01),R.H,0); gm.rotation.y=s*Math.PI/2;
    gm.userData=cut?{noFit:true}:{kind:"wall"}; gm.castShadow=!cut; g.add(gm);
  });
  // faîtage
  bx([0,R.H+ROOFH+.04,0],[R.spanW+.06,.16,.26],zinc,{noFit:true});
  // planches de rive + gouttières
  [1,-1].forEach(s=>{
    if(cut&&s===1) return;
    bx([0,R.H-.06,s*(R.halfD+.04)],[R.spanW+.06,.20,.1],trim,{noFit:true});
    cyl([0,R.H-.19,s*(R.halfD+.10)],.055,R.spanW+.02,zinc,[0,0,Math.PI/2]);
  });
  if(!cut) cyl([w/2+.07,R.H/2,d/2-.18],.042,R.H,zinc);
  // cheminée
  bx([w*.26,R.H+ROOFH*.78,-.35],[.55,1.5,.55],MS(0x8E8275,{roughness:.95}),{noFit:true});
  bx([w*.26,R.H+ROOFH*.78+.80,-.35],[.72,.12,.72],zinc,{noFit:true});

  // --- voisins
  if(S.H.type!=="f4" && !cut){
    neighbour3D(-(w/2+1.42),2.7,d*.82,H*.82,ROOFH*.72,0xDAD4C8);
    if(S.H.type==="mit") neighbour3D(w/2+1.42,2.7,d*.8,H*.78,ROOFH*.68,0xD2CCC0);
  }

  // --- châssis : façade rue (avant) + façade jardin (arrière)
  if(!cut){
    const used={}, fc=frameColor();
    const face=(ops,rotY,half)=>{
      const sub=new THREE.Group(), prev=V.grp;
      V.grp=sub;
      ops.forEach(o=>{
        used[o.k]=(used[o.k]||0)+1;
        const on = S.svc==="chassis" && used[o.k]<=S.q[o.k];
        window3D(o,half,on,fc,o.k);
      });
      V.grp=prev;
      sub.rotation.y=rotY;
      prev.add(sub);
    };
    face(facadeOps(),0,d/2);              // façade rue
    face(rearOps(),Math.PI,d/2);          // façade jardin
    // pignons : libres en 4 façades, un seul libre en 3 façades (l'autre est mitoyen)
    if(S.H.type==="f3"||S.H.type==="f4") face(sideOps(),Math.PI/2,w/2);
    if(S.H.type==="f4")                  face(sideOps(),-Math.PI/2,w/2);
  }

  // --- panneaux solaires (pan avant)
  if(S.svc==="solar"){
    const cols=Math.max(1,Math.floor(w/PANW)), rows=Math.max(1,Math.floor(R.slope/PANH));
    const rowLen=Math.min(PANH,R.slope/rows), panw=Math.min(PANW,w/cols);
    const nrm=[0,Math.cos(R.ang),Math.sin(R.ang)], dir=[0,Math.sin(R.ang),-Math.cos(R.ang)];
    const cellT=texCell();
    let i=0;
    for(let rI=0;rI<rows;rI++) for(let c=0;c<cols;c++,i++){
      if(i>=S.solar.n) break;
      const a=.35+rI*(rowLen+.08)+rowLen/2;
      const off=.17;
      const px=-w/2+panw/2+c*panw;
      const py=R.H+dir[1]*a+nrm[1]*off, pz=R.halfD+dir[2]*a+nrm[2]*off;
      const ct=cellT.clone(); ct.needsUpdate=true; ct.repeat.set(2,3);
      const p=bx([px,py,pz],[panw*.93,.05,rowLen*.93],MS(COL.panel,{map:ct,roughness:.28,metalness:.3}),{kind:"panel"});
      p.rotation.x=R.ang;
      const rl=bx([px,py-.045,pz-.02],[panw*.96,.04,rowLen*.96],MS(COL.rail,{roughness:.5,metalness:.4}),{noFit:true},true);
      rl.rotation.x=R.ang;
    }
    if(S.solar.n){ const s2=label3D(t.panels(S.solar.n),"gold"); s2.position.set(0,R.H+ROOFH+1.0,0); g.add(s2); }
  }

  // --- vue intérieure (clim)
  if(cut){
    const unit=MS(COL.unit,{roughness:.5}), dark=MS(0x3C4248,{roughness:.6});
    roomList().forEach(r=>{
      const isAttic=r.id==="attic";
      const on=S.clim.rooms.includes(r.id);
      const rw=isAttic?w*.82:w/2-.22, rh=isAttic?ROOFH*.74:LVH-.26, rd=d-2*WT-.1;
      const x=isAttic?0:r.side*(w/4+.05), y=(isAttic?R.H+ROOFH*.34:r.lvl*LVH+rh/2+.14);
      // sol de la pièce + plinthe : repère visuel clair
      const fl=bx([x,y-rh/2+.06,0],[rw,.1,rd],MS(on?0xD7B45E:COL.wood,{roughness:.85}),{kind:"room",id:r.id},true);
      bx([x,y-rh/2+.18,rd/2-.03],[rw,.14,.05],MS(on?0xB0862E:0xEDE7DB,{roughness:.8}),{noFit:true},true);
      const hit=new THREE.Mesh(new THREE.BoxGeometry(rw,rh,rd),new THREE.MeshBasicMaterial({transparent:true,opacity:on?.22:0.002,color:COL.gold,depthWrite:false}));
      hit.position.set(x,y,0); hit.userData={kind:"room",id:r.id}; g.add(hit);
      const nm=r.name[0]==="ch"?`${t.rooms.ch} ${r.name[1]}`:t.rooms[r.name[0]];
      const s=label3D(nm,on?"gold":null); s.position.set(x,y-rh/2+.55,rd/2+.1); s.scale.multiplyScalar(.72); g.add(s);
      if(on){
        // split mural : socle sombre + corps blanc + grille
        const uy=y+rh/2-.42, uz=rd/2-.5;
        bx([x,uy,uz],[1.06,.32,.26],MS(0x2B3036,{roughness:.6}),{noFit:true},true);
        bx([x,uy+.02,uz+.03],[1.0,.26,.24],unit,{kind:"room",id:r.id},true);
        bx([x,uy-.11,uz+.05],[.9,.05,.22],MS(COL.unitDark,{roughness:.6}),{noFit:true},true);
      }
    });
    if(S.clim.rooms.length){
      // groupe extérieur
      bx([w/2+.6,.55,d/4],[.42,.78,.9],MS(COL.unitDark,{roughness:.6}),{noFit:true});
      const fan=new THREE.Mesh(new THREE.CircleGeometry(.3,24),MS(0x5A6066,{roughness:.6}));
      fan.position.set(w/2+.82,.6,d/4); fan.rotation.y=Math.PI/2; fan.userData={noFit:true}; g.add(fan);
    }
  }
  V.need=true;
}

/* draw() : appelée par refresh() */
function draw(){
  if(!document.getElementById("house3d")) return;
  if(!V.ready && !init3D()){ wait3D(); return; }
  const ld=$("#house-load"); if(ld) ld.hidden=true;
  GEO=geoData();
  build3D(); place3D(); V.need=true;
  const l=L(), svc=S.svc;
  $("#hint-t").textContent=l["hint_"+svc];
  $("#view-t").textContent=(svc==="clim"?l.v_cut:l.v_front)+" · "+l.v_drag;
  const lg={chassis:`<span><i style="background:#B0862E"></i>${l.lg_sel}</span><span><i style="background:#AFC6D2"></i>${l.lg_glass}</span>`,
    iso:`<span><i style="background:#D9B463"></i>${l.lg_iso}</span>`,
    solar:`<span><i style="background:#16202C"></i>${l.lg_sp}</span>`,
    clim:`<span><i style="background:#D9B463"></i>${l.lg_room}</span>`,
    finit:`<span><i style="background:#D9B463"></i>${l.lg_fin}</span>`,reno:""};
  $("#legend").innerHTML=lg[svc]||"";
}
/* three.js peut arriver après le reste de la page : on attend, puis on l'explique */
function wait3D(){
  if(V.waiting) return; V.waiting=true;
  const ld=$("#house-load"); if(ld) ld.hidden=false;
  let n=0, cdn=false;
  const t=setInterval(()=>{
    n++;
    if(window.THREE){ clearInterval(t); V.waiting=false; refresh(); return; }
    if(n===12 && !cdn){            // ~2 s : le fichier local n'est pas venu, on tente le CDN
      cdn=true;
      const sc=document.createElement("script");
      sc.src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      document.head.appendChild(sc);
    }
    if(n>80){                       // ~13 s : on arrête et on rassure
      clearInterval(t); V.waiting=false;
      if(ld) ld.innerHTML=`<span>${L().h3d_err}</span><button type="button" class="btn btn-line btn-sm" onclick="location.reload()">${L().h3d_retry}</button>`;
    }
  },160);
}
function rotate3D(dir){ if(dir===0){ V.rotY=-0.40; V.rotX=0.18; } else V.rotY+=dir*0.5; V.need=true; }

function houseBar(){
  if(!$("#house-bar")) return;
  const l=L(), m=(key,opts)=>`<div class="mini">${opts.map(([v,t])=>`<button type="button" aria-pressed="${S.H[key]==v}" data-h="${key}" data-v="${v}">${t}</button>`).join("")}</div>`;
  $("#house-bar").innerHTML=`<div class="hb"><span>${l.hb_lv}</span>${m("lv",[[1,"1"],[2,"2"],[3,"3"],[4,"4"]])}</div>
    <div class="hb"><span>${l.hb_w}</span>${m("cols",[[2,l.w2],[3,l.w3]])}</div>
    <div class="hb"><span>${l.hb_t}</span>${m("type",[["mit",l.t_mit],["f3",l.t_f3],["f4",l.t_f4]])}</div>
    <div class="hb"><span>${l.hb_d}</span>${m("depth",[[6,"6 m"],[8,"8 m"],[10,"10 m"]])}</div>`;
}

/* ---------- panneau ---------- */
function seg(set,opts,cur,withQ,multi){
  let h=Object.entries(opts).map(([v,t])=>`<button type="button" aria-pressed="${multi?cur.includes(v):cur===v}" data-set="${set}" data-v="${v}">${t}</button>`).join("");
  if(withQ) h+=`<button type="button" class="q" aria-pressed="${cur==="unsure"}" data-set="${set}" data-v="unsure">${L().unsure}</button>`;
  return `<div class="seg">${h}</div>`;
}
function tabs(){
  if(!$("#tabs")) return;
  const done={}; cart().forEach(x=>done[x.svc]=true);
  $("#tabs").innerHTML=SVCS.map(s=>`<button type="button" class="tab${done[s]?" has":""}" role="tab" aria-selected="${S.svc===s}" data-svc="${s}">${IC[s]}<span>${L()["s_"+s]}</span>${done[s]?'<i class="dot"></i>':""}</button>`).join("");
}
function panel(){
  if(!$("#pbody")) return;
  const l=L(); let h="";
  const when=(k)=>`<div class="grp"><span class="gl">${l.when}</span>${seg(k+".when",l.when_o,S[k].when)}</div>`;
  if(S.svc==="chassis"){
    h=`<div><h2>${l.t_chassis}</h2><p class="sub">${l.d_chassis}</p></div>
    <div class="types">${TYPES.map(k=>`<div class="type${S.q[k]?" on":""}"><div><div class="nm">${l.it[k]}</div><div class="ex">${l.ex[k]}</div></div>
      <div class="stp"><button type="button" data-dec="${k}" aria-label="− ${l.it[k]}" ${S.q[k]?"":"disabled"}>−</button><output>${S.q[k]}</output><button type="button" data-inc="${k}" aria-label="+ ${l.it[k]}">+</button></div></div>`).join("")}</div>
    ${[["mat","g_mat","o_mat","w_mat"],["col","g_col","o_col","w_col"],["gl","g_gl","o_gl","w_gl"],["age","g_age","o_age","w_age"]].map(([k,g,o,w])=>
      `<div class="grp"><span class="gl">${l[g]}</span>${seg(k,l[o],S[k],true)}<p class="why">${l[w][S[k]]}</p></div>`).join("")}
    ${calcDetail()}`;
  } else if(S.svc==="iso"){
    h=`<div><h2>${l.iso_t}</h2><p class="sub">${l.iso_d}</p></div>
      <div class="grp"><span class="gl">${l.zones_t}</span>${seg("iso.zones",l.zones,S.iso.zones,false,true)}<p class="why">${l.iso_w}</p></div>
      ${S.iso.zones.includes("murs")?`<div class="grp"><span class="gl">${l.iso_wall}</span>${seg("iso.wall",l.iso_wall_o,S.iso.wall)}<p class="why">${l.iso_wall_w[S.iso.wall]}</p></div>`:""}
      ${when("iso")}${calcDetail()}`;
  } else if(S.svc==="solar"){
    const sug=S.solar.bill?Math.min(GEO.cap,{b1:6,b2:10,b3:14,unsure:10}[S.solar.bill]):0;
    h=`<div><h2>${l.sol_t}</h2><p class="sub">${l.sol_d}</p></div>
      <div class="grp"><span class="gl">${l.sol_roof}</span>${seg("solar.roof",l.sol_roof_o,S.solar.roof,true)}</div>
      <div class="grp"><span class="gl">${l.sol_bill}</span>${seg("solar.bill",l.sol_bill_o,S.solar.bill,true)}<p class="why">${sug?l.sol_sug(sug):l.sol_none}</p></div>
      <div class="grp"><div class="type" style="border:0;padding:0"><span class="gl" style="font-weight:600;font-size:.9rem">${l.sol_n}</span>
        <div class="stp"><button type="button" data-sol="-1" aria-label="−" ${S.solar.n?"":"disabled"}>−</button><output>${S.solar.n}</output><button type="button" data-sol="1" aria-label="+" ${S.solar.n<GEO.cap?"":"disabled"}>+</button></div></div><p class="why">${l.sol_max(GEO.cap)}</p></div>
      ${when("solar")}${calcDetail()}<p class="note">${l.partner}</p><p class="note">${l.sol_noprime}</p>`;
  } else if(S.svc==="clim"){
    const names=GEO.rooms.filter(r=>S.clim.rooms.includes(r.id)).map(r=>r.name[0]==="ch"?`${l.rooms.ch} ${r.name[1]}`:l.rooms[r.name[0]]);
    h=`<div><h2>${l.cl_t}</h2><p class="sub">${l.cl_d}</p></div>
      <div class="grp"><span class="gl">${l.cl_goal}</span>${seg("clim.goal",l.cl_goal_o,S.clim.goal,true)}</div>
      <div class="grp"><span class="gl">${l.cl_rooms} (${names.length})</span>${names.length?`<div class="chips">${names.map(n=>`<span class="chip">${n}</span>`).join("")}</div>`:`<p class="empty">${l.cl_none}</p>`}</div>
      ${when("clim")}${calcDetail()}<p class="note">${l.partner}</p>`;
  } else if(S.svc==="finit"){
    const f=S.finit, w=f.what, F=finSurf();
    const inside=["peinture","plafonnage","plafondrf","sols"].some(k=>w.includes(k));
    h=`<div><h2>${l.fin_t}</h2><p class="sub">${l.fin_d}</p></div>
      <div class="grp"><span class="gl">${l.fin_what}</span>${seg("finit.what",l.fin_what_o,w,false,true)}
        <span class="gl" style="margin-top:6px">${l.fin_what2}</span>${seg("finit.what",l.fin_what2_o,w,false,true)}
        <p class="why">${l.fin_w}</p></div>
      ${inside?`<div class="grp"><span class="gl">${l.fin_scope}</span>${seg("finit.scope",l.fin_scope_o,S.finit.scope)}
        ${S.finit.scope==="rooms"?`<div class="type" style="border:0;padding:4px 0"><span class="gl" style="font-weight:600;font-size:.9rem">${l.fin_rooms}</span>
          <div class="stp"><button type="button" data-fr="-1" aria-label="−" ${S.finit.rooms>1?"":"disabled"}>−</button><output>${S.finit.rooms}</output><button type="button" data-fr="1" aria-label="+" ${S.finit.rooms<12?"":"disabled"}>+</button></div></div>
          <p class="why">${l.fin_room_w(S.finit.rooms)}</p>`:`<p class="why">${l.fin_full_w(F.plaf,F.mur)}</p>`}</div>`:""}
      ${w.includes("peinture")?`<div class="grp"><span class="gl">${l.fin_etat}</span>${seg("finit.etat",l.fin_etat_o,f.etat)}<p class="why">${l.fin_etat_w[f.etat]}</p></div>`:""}
      ${w.includes("plafonnage")?`<div class="grp"><span class="gl">${l.fin_plafo}</span>${seg("finit.plafo",l.fin_plafo_o,f.plafo)}<p class="why">${l.fin_plafo_w[f.plafo]}</p></div>`:""}
      ${w.includes("cloison")?`<div class="grp"><span class="gl">${l.fin_cl}</span>${seg("finit.cloison",l.fin_cl_o,f.cloison)}<p class="why">${l.fin_cl_w[f.cloison]}</p>
        <div class="type" style="border:0;padding:4px 0"><span class="gl" style="font-weight:600;font-size:.9rem">${l.fin_cl_m2}</span>
          <div class="stp"><button type="button" data-cm="-5" aria-label="−" ${f.cloisonM2>5?"":"disabled"}>−</button><output>${f.cloisonM2} m²</output><button type="button" data-cm="5" aria-label="+" ${f.cloisonM2<100?"":"disabled"}>+</button></div></div>
        <p class="why">${l.fin_cl_w2(f.cloisonM2)}</p></div>`:""}
      ${w.includes("plafondrf")?`<div class="grp"><span class="gl">${l.fin_rf}</span>${seg("finit.rf",l.fin_rf_o,f.rf)}<p class="why">${l.fin_rf_w[f.rf]}</p></div>`:""}
      ${w.includes("sols")?`<div class="grp"><span class="gl">${l.fin_sol}</span>${seg("finit.sol",l.fin_sol_o,f.sol)}<p class="why">${l.fin_sol_w[f.sol]}</p></div>`:""}
      ${w.includes("enduisage")?`<div class="grp"><span class="gl">${l.fin_fini}</span>${seg("finit.fini",l.fin_fini_o,f.fini)}<p class="why">${l.fin_fini_w[f.fini]}</p></div>
        <div class="grp"><span class="gl">${l.fin_echaf}</span>${seg("finit.echaf",l.fin_echaf_o,f.echaf,true)}<p class="why">${l.fin_echaf_w}</p></div>`:""}
      ${when("finit")}${calcDetail()}`;
  } else {
    h=`<div><h2>${l.rn_t}</h2><p class="sub">${l.rn_d}</p></div>
      <div class="grp"><span class="gl">${l.rn_what}</span>${seg("reno.what",l.rn_what_o,S.reno.what)}</div>${when("reno")}`;
  }
  $("#pbody").innerHTML=h;
}
function m2(k){ return SIZE[k].w*SIZE[k].h/10000; }
function unitHT(k,mat,col,gl){
  const f=GLASS[gl]*COLOR[col];
  if(FORFAIT[k]) return FORFAIT[k][mat]*f;
  return Math.max(MIN_OP, m2(k)*RATE[mat])*f;
}
function calc(){
  const mat=S.mat==="unsure"?"pvc":S.mat, col=S.col==="unsure"?"white":S.col, gl=S.gl==="unsure"?"double":S.gl;
  const vat=S.age==="old"?0.06:0.21;
  let ht=0,n=0,surf=0;
  const lines=TYPES.filter(k=>S.q[k]>0).map(k=>{
    const u=unitHT(k,mat,col,gl), sub=u*S.q[k];
    ht+=sub; n+=S.q[k]; surf+=m2(k)*S.q[k];
    return {k,q:S.q[k],u,sub,m2:m2(k),forfait:!!FORFAIT[k]};
  });
  return {sum:ht*(1+vat),ht,vat,n,surf,lines,mat,col,gl};
}
function nf(v){ return new Intl.NumberFormat(lang==="nl"?"nl-BE":"fr-BE",{maximumFractionDigits:1}).format(v); }
function calcDetail(){
  const l=L(), c=priced();
  if(!c||!c.n) return "";
  let rows="";
  if(S.svc==="chassis"){
    rows=c.lines.map(x=>`<li><span>${x.q} × ${l.it[x.k]}<span class="d">${x.forfait?l.cd_forfait:(m2(x.k)*RATE[c.mat]<MIN_OP?l.cd_min:`${nf(x.m2)} m² × ${eur(RATE[c.mat])}/m²`)}</span></span><span>${eur(r50(x.sub))}</span></li>`).join("");
    const extras=[];
    if(c.gl==="triple") extras.push(l.cd_triple);
    if(c.col==="color") extras.push(l.cd_color);
    if(extras.length) rows+=`<li><span>${l.cd_opts}<span class="d">${extras.join(" · ")}</span></span><span></span></li>`;
  } else if(S.svc==="iso"){
    rows=c.lines.map(x=>`<li><span>${l.cd_iso[x.k]}<span class="d">${x.m2} m² × ${eur(x.rate)}/m²</span></span><span>${eur(r50(x.sub))}</span></li>`).join("")
      + `<li><span>${l.cd_surf}<span class="d">${l.cd_surf_d(surfaces().w,S.H.depth,S.H.lv)}</span></span><span></span></li>`;
  } else if(S.svc==="solar"){
    rows=`<li><span>${c.n} × ${l.cd_panel}<span class="d">${nf(SOL.wc)} Wc · ${nf(c.kwc)} kWc</span></span><span>${eur(r50(c.ht))}</span></li>`
      + `<li><span>${l.cd_prod}<span class="d">${l.cd_prod_d}</span></span><span>${nf(c.prod)} kWh</span></li>`;
  } else if(S.svc==="clim"){
    rows=c.lines.map(x=>`<li><span>${x.q?x.q+" × ":""}${l.cd_clim[x.k]}</span><span>${eur(r50(x.sub))}</span></li>`).join("");
  } else if(S.svc==="finit"){
    rows=c.lines.map(x=>`<li><span>${l.cd_fin[x.k]}<span class="d">${x.m2} m² × ${eur(x.rate)}/m²</span></span><span>${eur(r50(x.sub))}</span></li>`).join("");
  }
  return `<details class="calcdet"><summary>${l.cd_h}</summary>
    <ul>${rows}
      <li><span>${l.cd_ht}</span><span>${eur(r50(c.ht))}</span></li>
      <li><span>${l.cd_vat(Math.round(c.vat*100))}</span><span>${eur(r50(c.sum-c.ht))}</span></li>
      <li class="tot"><span>${l.cd_tot}</span><span>${eur(r50(c.sum))}</span></li></ul>
    <p class="fine" style="margin-top:8px">${S.svc==="chassis"?l.cd_src:l.cd_src2}</p></details>`;
}
function calcIso(){
  const S2=surfaces(), vat=S.age==="old"?0.06:0.21, lines=[];
  S.iso.zones.forEach(z=>{
    if(z==="toit") lines.push({k:"toit",m2:S2.toit,rate:ISO.toit});
    if(z==="murs") lines.push({k:S.iso.wall==="ite"?"ite":"creux",m2:S2.murs,rate:S.iso.wall==="ite"?ISO.ite:ISO.creux});
    if(z==="sol")  lines.push({k:"sol",m2:S2.sol,rate:ISO.sol});
  });
  lines.forEach(l=>l.sub=l.m2*l.rate);
  const ht=lines.reduce((a,l)=>a+l.sub,0);
  return {ht,sum:ht*(1+vat),vat,lines,n:lines.length,margin:.20};
}
function solarRate(kwc){ for(const [max,r] of SOL.tiers) if(kwc<max) return r; return SOL.tiers[SOL.tiers.length-1][1]; }
function calcSolar(){
  const n=S.solar.n, kwc=n*SOL.wc/1000, vat=S.age==="old"?0.06:0.21;
  const ttc6=kwc*1000*solarRate(kwc), ht=ttc6/1.06;
  return {ht,sum:ht*(1+vat),vat,n,kwc,prod:Math.round(kwc*SOL.prod),margin:.15,lines:n?[{k:"panels",q:n,kwc,sub:ht}]:[]};
}
function calcClim(){
  const rooms=S.clim.rooms.length, goal=S.clim.goal, cool=goal==="cool";
  const vat=(S.age==="old"&&!cool)?0.06:0.21;
  if(goal==="heat"){ const ht=CLIM.pac; return {ht,sum:ht*(1+vat),vat,n:1,pac:true,margin:.25,lines:[{k:"pac",sub:ht}]}; }
  if(!rooms) return {ht:0,sum:0,vat,n:0,margin:.25,lines:[]};
  const ht=CLIM.mono+CLIM.extra*(rooms-1);
  return {ht,sum:ht*(1+vat),vat,n:rooms,margin:.25,lines:[{k:"mono",sub:CLIM.mono},...(rooms>1?[{k:"extra",q:rooms-1,sub:CLIM.extra*(rooms-1)}]:[])]};
}
/* surfaces intérieures estimées d'après la maison réglée (ou un nombre de pièces) */
function finSurf(){
  const S2=surfaces(), lv=S.H.lv;
  const sol = S.finit.scope==="rooms" ? ROOM_M2*S.finit.rooms : S2.foot*lv;
  return {plaf:Math.round(sol), mur:Math.round(sol*MUR_RATIO), fac:S2.murs};
}
function calcFin(){
  const vat=S.age==="old"?0.06:0.21, F=finSurf(), f=S.finit, w=f.what, lines=[];
  if(w.includes("peinture")){
    lines.push({k:"peint_mur",m2:F.mur,rate:FIN.peint.mur[f.etat]});
    lines.push({k:"peint_plaf",m2:F.plaf,rate:FIN.peint.plaf});
  }
  if(w.includes("plafonnage")){
    const r=FIN.plafo[f.plafo];
    lines.push({k:"plafo_mur",m2:F.mur,rate:r});
    lines.push({k:"plafo_plaf",m2:F.plaf,rate:r});
  }
  if(w.includes("cloison")) lines.push({k:"cloison_"+f.cloison,m2:f.cloisonM2,rate:FIN.cloison[f.cloison]});
  if(w.includes("plafondrf")) lines.push({k:f.rf,m2:F.plaf,rate:FIN.rf[f.rf]});
  if(w.includes("sols")) lines.push({k:f.sol,m2:F.plaf,rate:FIN.sol[f.sol]});
  if(w.includes("enduisage")){
    lines.push({k:"endui",m2:F.fac,rate:FIN.endui[f.fini]});
    if(f.echaf==="oui") lines.push({k:"echaf",m2:F.fac,rate:FIN.endui.echaf});
  }
  lines.forEach(x=>x.sub=x.m2*x.rate);
  const ht=lines.reduce((a,x)=>a+x.sub,0);
  return {ht,sum:ht*(1+vat),vat,lines,n:w.length,margin:.20};
}
function pricedFor(svc){
  return svc==="chassis"?calc():svc==="iso"?calcIso():svc==="solar"?calcSolar()
       :svc==="clim"?calcClim():svc==="finit"?calcFin():null;
}
function priced(){ return pricedFor(S.svc); }

/* ---------- panier : le prix se cumule d'un service à l'autre ---------- */
const PRICED_SVCS=["chassis","iso","solar","clim","finit"];
function cart(){
  return PRICED_SVCS.map(svc=>({svc,c:pricedFor(svc)})).filter(x=>x.c&&x.c.n&&x.c.sum>0);
}
function cartTotal(){
  // on additionne les montants ARRONDIS affichés, pour que le total colle à la liste
  const it=cart(); let sum=0,lo=0,hi=0;
  it.forEach(({c})=>{ const mg=c.margin||MARGIN, v=r50(c.sum); sum+=v; lo+=v*(1-mg); hi+=v*(1+mg); });
  return {sum,lo,hi,n:it.length,items:it};
}
function clearSvc(svc){
  if(svc==="chassis") TYPES.forEach(k=>S.q[k]=0);
  else if(svc==="iso") S.iso.zones=[];
  else if(svc==="solar"){ S.solar.n=0; S.solar.bill=null; S.solar.manual=false; }
  else if(svc==="clim"){ S.clim.rooms=[]; S.clim.goal=null; }
  else if(svc==="finit") S.finit.what=[];
}
function leadForm(){
  const l=L();
  if(S.sent) return `<div class="success"><strong>${l.of_ok_h}</strong><span>${l.of_ok_p}</span><span class="fine">${l.of_demo}</span></div>`;
  return `<div class="lead"><p class="fine" style="font-size:.84rem">${l.of_intro}</p>
    <div class="row"><div class="field"><label for="of-name">${l.of_name}</label><input type="text" id="of-name" autocomplete="given-name" value="${esc(S.name)}"></div>
    <div class="field"><label for="of-tel">${l.of_tel}</label><input type="tel" id="of-tel" autocomplete="tel" value="${esc(S.tel)}"></div>
    <div class="field"><label for="of-cp">${l.of_cp}</label><input type="text" id="of-cp" inputmode="numeric" maxlength="4" value="${esc(S.cp)}"></div></div>
    <span class="err" id="of-err" hidden>${l.of_err}</span>
    <div style="display:flex;gap:12px;align-items:center"><button type="button" class="btn btn-ink" id="of-send" style="flex:1">${l.of_send}</button><button type="button" class="link" id="of-back">${l.of_back}</button></div></div>`;
}
/* liste des services déjà chiffrés, au-dessus du prix */
function cartHtml(){
  const l=L(), t=cartTotal();
  if(t.n<2) return "";
  return `<div class="cart">${t.items.map(({svc,c})=>
    `<div class="ci"><span class="nm2" data-goto="${svc}">${l["s_"+svc]}</span><span class="am">${eur(r50(c.sum))}</span>
     <button type="button" class="rm" data-rm="${svc}" aria-label="${l.cart_rm} ${l["s_"+svc]}" title="${l.cart_rm}">×</button></div>`).join("")}</div>`;
}
function price(){
  if(!$("#price")) return;
  const l=L(), c=priced(), t=cartTotal(); let head="", acts="";
  if(t.n){
    // un seul prix, cumulé : dès qu'il y a 2 services, on affiche le total du projet
    const multi=t.n>1;
    const lbl=multi?`${l.cart_t} <span style="font-weight:500;color:var(--ink-2)">· ${t.n} ${t.n>1?l.cart_many:l.cart_one}</span>`:l.p_lbl;
    const vat=multi?null:Math.round(c.vat*100);
    const meta=multi?l.p_meta2(eur(r50(t.lo)),eur(r50(t.hi))):l.p_meta(vat,eur(r50(t.lo)),eur(r50(t.hi)));
    head=cartHtml()+`<div class="row1"><div><div class="lbl2">${lbl}</div><div class="pv" id="pv"></div></div><p class="pmeta">${meta}</p></div>`;
    acts=`<div class="acts"><button type="button" class="btn btn-ink" id="open-form">${S.svc==="chassis"&&!multi?l.p_offer:l.p_offer2}</button><a class="btn btn-wa wa-link" href="#" target="_blank" rel="noopener">${l.wa_btn}</a></div><p class="fine">${S.svc==="chassis"&&!multi?l.p_fine:l.p_fine2}</p>`;
  } else {
    const empty = S.svc==="chassis"?l.p_empty:S.svc==="iso"?l.p_empty_iso:S.svc==="solar"?l.p_empty_sol:S.svc==="clim"?l.p_empty_clim:S.svc==="finit"?l.p_empty_finit:null;
    head=`<div class="row1"><div><div class="lbl2">${empty?l.p_lbl:l.lead_lbl}</div><div class="pv" id="pv">${empty?`<span style="font-size:1.05rem;font-weight:500;color:var(--ink-2);letter-spacing:0">${empty}</span>`:l.lead_v}</div></div><p class="pmeta">${l.lead_meta}</p></div>`;
    acts=`<div class="acts"><button type="button" class="btn btn-ink" id="open-form">${l.lead_btn}</button><a class="btn btn-wa wa-link" href="#" target="_blank" rel="noopener">${l.wa_btn}</a></div>`;
  }
  $("#price").innerHTML=head+(S.form||S.sent?leadForm():acts);
  if(t.n) tick();
  setWa(); mbar();
}
function tick(){
  const el=$("#pv"); if(!el) return;
  const t=cartTotal(), l=L();
  if(!t.n) return;
  const target=r50(t.sum);
  cancelAnimationFrame(anim);
  const from=shown, t0=performance.now(), dur=420, reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(from!==target) el.classList.add("pulse");
  const step=now=>{ const p=reduce?1:Math.min(1,(now-t0)/dur), v=from+(target-from)*(1-Math.pow(1-p,3));
    el.innerHTML=`<small>${l.p_about}</small>${eur(r50(v))}`; if(p<1) anim=requestAnimationFrame(step); else {shown=target; el.classList.remove("pulse");} };
  anim=requestAnimationFrame(step);
}
function mbar(){ if(!$("#mb-v")) return;
  const l=L(), t=cartTotal();
  $("#mb-l").textContent = t.n ? (t.n>1?l.cart_t:l.mb_l) : l["s_"+S.svc];
  $("#mb-v").textContent = t.n ? "≈ "+eur(r50(t.sum)) : (S.svc==="reno"?l.lead_v:"—");
  $("#mb-cta").textContent = l.mb_cta; }
function setWa(){
  let txt=L().wa; const t=cartTotal();
  if(t.n){
    const parts=t.items.map(({svc,c})=>{
      if(svc==="chassis") return `${L()["s_"+svc]} (${TYPES.filter(k=>S.q[k]).map(k=>`${S.q[k]}× ${L().it[k]}`).join(", ")})`;
      return L()["s_"+svc];
    });
    txt+=` — ${parts.join(" + ")}, ≈ ${eur(r50(t.sum))}`;
  } else if(S.svc!=="chassis") txt+=` (${L()["s_"+S.svc]})`;
  document.querySelectorAll(".wa-link").forEach(a=>a.href="https://wa.me/?text="+encodeURIComponent(txt));
}
function refresh(keepForm){ if(!keepForm) S.form=false; draw(); panel(); price(); tabs(); }
function all(){ houseBar(); tabs(); refresh(); }

/* ---------- événements ---------- */
function focusSame(sel){ const n=document.querySelector(sel); n&&n.focus(); }
document.addEventListener("keydown",e=>{
  const b=$("#lb"); if(!b||b.hidden) return;
  if(e.key==="Escape") lbClose();
  if(e.key==="ArrowLeft") lbOpen(lbI-1);
  if(e.key==="ArrowRight") lbOpen(lbI+1);
});
document.addEventListener("click",e=>{
  const th=e.target.closest("[data-lb]"); if(th){ lbOpen(+th.dataset.lb); return; }
  const ac=e.target.closest("[data-lb-act]");
  if(ac){ const a=ac.dataset.lbAct; a==="close"?lbClose():lbOpen(a==="prev"?lbI-1:lbI+1); return; }
  if(e.target.id==="lb"){ lbClose(); return; }
  const nv=e.target.closest("nav.links a"); if(nv) document.querySelector("header.top").classList.remove("open");
  const gt=e.target.closest("[data-goto]");
  if(gt){ S.svc=gt.dataset.goto; S.form=false; S.sent=false; refresh(); return; }
  const b=e.target.closest("button"); if(!b) return;
  if(b.id==="gal-more"){ $("#gal").classList.add("all"); b.parentElement.classList.add("off"); return; }
  if(b.dataset.rm){ clearSvc(b.dataset.rm); refresh(); return; }
  if(b.dataset.cm){ S.finit.cloisonM2=Math.max(5,Math.min(100,S.finit.cloisonM2+(+b.dataset.cm))); refresh(); focusSame(`[data-cm="${b.dataset.cm}"]`); return; }
  if(b.dataset.fr){ S.finit.rooms=Math.max(1,Math.min(12,S.finit.rooms+(+b.dataset.fr))); refresh(); focusSame(`[data-fr="${b.dataset.fr}"]`); return; }
  if(b.dataset.rot!==undefined){ rotate3D(+b.dataset.rot); return; }
  if(b.id==="burger"){ const o=document.querySelector("header.top").classList.toggle("open"); b.setAttribute("aria-expanded",o); return; }
  if(b.dataset.h){ S.H[b.dataset.h]=isNaN(+b.dataset.v)?b.dataset.v:+b.dataset.v;
    const g=geoData(); S.clim.rooms=S.clim.rooms.filter(id=>g.rooms.some(r=>r.id===id)); S.solar.n=Math.min(S.solar.n,g.cap);
    houseBar(); refresh(); focusSame(`[data-h="${b.dataset.h}"][data-v="${b.dataset.v}"]`); return; }
  if(b.dataset.svc){ S.svc=b.dataset.svc; S.form=false; S.sent=false; tabs(); refresh(); return; }
  if(b.dataset.go){ S.svc=b.dataset.go; S.form=false; S.sent=false; tabs(); refresh(); $("#app").scrollIntoView({behavior:"smooth",block:"start"}); return; }
  if(b.dataset.inc){ const k=b.dataset.inc; S.q[k]=Math.min(30,S.q[k]+1); refresh(); focusSame(`[data-inc="${k}"]`); return; }
  if(b.dataset.dec){ const k=b.dataset.dec; S.q[k]=Math.max(0,S.q[k]-1); refresh(); const x=$(`[data-dec="${k}"]`); (x&&!x.disabled?x:$(`[data-inc="${k}"]`)).focus(); return; }
  if(b.dataset.sol){ S.solar.n=Math.max(0,Math.min(GEO.cap,S.solar.n+(+b.dataset.sol))); S.solar.manual=true; refresh(); focusSame(`[data-sol="${b.dataset.sol}"]`); return; }
  if(b.dataset.set){
    const set=b.dataset.set, v=b.dataset.v;
    if(set.includes(".")){ const [o,k]=set.split(".");
      if(Array.isArray(S[o][k])){ const a=S[o][k], i=a.indexOf(v); i<0?a.push(v):a.splice(i,1); }
      else S[o][k]=v;
      if(o==="solar"&&k==="bill"&&!S.solar.manual) S.solar.n=Math.min(GEO.cap,{b1:6,b2:10,b3:14,unsure:10}[v]);
    } else S[set]=v;
    refresh(); focusSame(`[data-set="${set}"][data-v="${v}"]`); return;
  }
  if(b.id==="open-form"){ S.form=true; price(); $("#of-name")?.focus(); return; }
  if(b.id==="of-back"){ S.form=false; price(); return; }
  if(b.id==="of-send"){ S.name=$("#of-name").value.trim(); S.tel=$("#of-tel").value.trim(); S.cp=$("#of-cp").value.trim();
    if(!S.tel){ $("#of-err").hidden=false; $("#of-tel").focus(); return; } S.sent=true; S.form=false; price(); return; }
  if(b.id==="lang-fr") setLang("fr"); if(b.id==="lang-nl") setLang("nl");
});
document.addEventListener("input",e=>{ if(e.target.id==="of-name") S.name=e.target.value; if(e.target.id==="of-tel") S.tel=e.target.value; if(e.target.id==="of-cp") S.cp=e.target.value; });
document.getElementById("cform")?.addEventListener("submit",e=>{ e.preventDefault();
  if(!$("#c-tel").value.trim()&&!$("#c-mail").value.trim()){ $("#c-err").hidden=false; return; }
  $("#c-err").hidden=true; $("#c-ok").hidden=false; });

/* ---------- photos de chantier ---------- */
const PHOTOS={chassis:1,iso:1,solar:2,clim:2,finit:1,reno:1,materiel:1};  // 2 = rendu 3D, pas une photo de chantier
const GAL=Array.from({length:12},(_,i)=>`img-real${String(i+1).padStart(2,"0")}.jpg`);
let lbI=0;
function galerie(){
  const g=$("#gal"); if(!g) return;
  const mb=$("#gal-more"); if(mb) mb.parentElement.classList.remove("off");
  g.classList.remove("all");
  g.innerHTML=GAL.map((src,i)=>`<button type="button" data-lb="${i}" aria-label="${L().gal_open}"><img src="${src}" alt="" loading="lazy" decoding="async"></button>`).join("");
}
function lbOpen(i){
  lbI=(i+GAL.length)%GAL.length;
  let b=$("#lb");
  if(!b){
    b=document.createElement("div"); b.className="lb"; b.id="lb";
    b.innerHTML=`<img alt=""><button type="button" class="x" data-lb-act="close">✕</button>
      <button type="button" class="pv" data-lb-act="prev">‹</button>
      <button type="button" class="nx" data-lb-act="next">›</button><span class="cnt"></span>`;
    document.body.appendChild(b);
  }
  b.querySelector("img").src=GAL[lbI];
  b.querySelector(".cnt").textContent=`${lbI+1} / ${GAL.length}`;
  b.querySelector(".x").setAttribute("aria-label",L().gal_close);
  b.querySelector(".pv").setAttribute("aria-label",L().gal_prev);
  b.querySelector(".nx").setAttribute("aria-label",L().gal_next);
  b.hidden=false; document.body.style.overflow="hidden"; b.querySelector(".x").focus();
}
function lbClose(){ const b=$("#lb"); if(b){ b.hidden=true; document.body.style.overflow=""; } }
function avantApres(){
  const r=$("#ba-r"), ba=$("#ba"); if(!r||!ba) return;
  const set=()=>ba.style.setProperty("--p",r.value+"%");
  r.addEventListener("input",set); set();
}
const SVC_URL={chassis:"chassis.html",iso:"isolation.html",solar:"solaire.html",
               clim:"clim.html",finit:"finitions.html",reno:"renovation.html",materiel:"materiel.html"};
const SVC_CARDS=[...SVCS,"materiel"];
function svcGrid(){
  const g=$("#svc-grid"); if(!g) return;
  const l=L();
  g.innerHTML=SVC_CARDS.map((x,i)=>`<a class="svc-card${i===SVC_CARDS.length-1?" wide":""}" href="${SVC_URL[x]}">
    <span class="ph">${PHOTOS[x]===2?`<span class="tag">${l.illus3d}</span>`:""}${PHOTOS[x]?`<img src="img-svc-${x}.jpg" alt="" loading="lazy">`:""}</span>
    <span class="tx"><h3>${l.sv[x][0]}</h3><p>${l.sv[x][1]}</p><span class="go">${l.sv[x][2]} <i>&rarr;</i></span></span></a>`).join("");
  svcGlow(g);
}
/* la lueur dorée : suit la souris sur ordi, suit le scroll sur téléphone */
let svcScrollOn=false;
function svcGlow(g){
  g.querySelectorAll(".svc-card").forEach(k=>{
    k.addEventListener("pointermove",e=>{
      if(e.pointerType!=="mouse") return;
      const r=k.getBoundingClientRect();
      k.style.setProperty("--mx",(e.clientX-r.left)+"px");
      k.style.setProperty("--my",(e.clientY-r.top)+"px");
    });
  });
  if(svcScrollOn) return;
  svcScrollOn=true;
  const noHover=window.matchMedia("(hover:none)");
  let tick=false;
  const lit=()=>{
    tick=false;
    const cards=[...document.querySelectorAll("#svc-grid .svc-card")];
    if(!cards.length) return;
    if(!noHover.matches){cards.forEach(k=>k.classList.remove("lit")); return;}
    const mid=innerHeight/2; let best=null,bd=1e9;
    cards.forEach(k=>{
      const r=k.getBoundingClientRect();
      if(r.bottom<60||r.top>innerHeight-40) return;
      const d=Math.abs(r.top+r.height/2-mid);
      if(d<bd){bd=d;best=k;}
    });
    cards.forEach(k=>k.classList.toggle("lit",k===best));
  };
  addEventListener("scroll",()=>{if(!tick){tick=true;requestAnimationFrame(lit);}},{passive:true});
  addEventListener("resize",lit);
  if(noHover.addEventListener) noHover.addEventListener("change",lit);
  lit();
}
function applyLang(){
  const l=L(); document.documentElement.lang=lang;
  document.querySelectorAll("[data-i18n]").forEach(el=>{const v=l[el.dataset.i18n]; if(typeof v==="string") el.textContent=v;});
  document.querySelectorAll("[data-i18n-html]").forEach(el=>{el.innerHTML=l[el.dataset.i18nHtml];});
  const lf=$("#lang-fr"); if(lf){ lf.setAttribute("aria-pressed",lang==="fr"); $("#lang-nl").setAttribute("aria-pressed",lang==="nl"); }
  document.querySelectorAll("[data-nav]").forEach(a=>a.classList.toggle("on",a.dataset.nav===document.body.dataset.page));
  pageContent(); legalContent();
  matList(); galerie(); avantApres(); svcGrid(); shown=0; all();
}
/* tarifs matériel & chantier (B2B) */
function mtQuick(){
  const q=$("#mt-quick"); if(!q) return;
  const l=L();
  q.innerHTML=[[l.mt_pelle,`${eur(MAT.pelle)} ${l.mt_h}`],
               [l.mt_g1,`${eur(MAT.gruea)} ${l.mt_j}`],
               [l.mt_g2,`${eur(MAT.grueb)} ${l.mt_j}`]]
    .map(r=>`<div><span>${r[0]}</span><b>${r[1]}</b></div>`).join("");
}
function matList(){
  mtQuick();
  const l=L(), row=(nm,val,sm)=>`<li><span>${nm}${sm?`<span class="sm">${sm}</span>`:""}</span><b>${val}</b></li>`;
  const t1=$("#mt-1"), t2=$("#mt-2"), t3=$("#mt-3"); if(!t1) return;
  t1.innerHTML=row(l.mt_pelle,`${eur(MAT.pelle)} <span style="font-weight:500;font-size:.8rem">${l.mt_h}</span>`);
  t2.innerHTML=row(l.mt_g1,`${eur(MAT.gruea)} <span style="font-weight:500;font-size:.8rem">${l.mt_j}</span>`)
             + row(l.mt_g2,`${eur(MAT.grueb)} <span style="font-weight:500;font-size:.8rem">${l.mt_j}</span>`)
             + row(l.mt_livr,`${eur(MAT.livr)} <span style="font-weight:500;font-size:.8rem">${l.mt_voy}</span>`);
  t3.innerHTML=row(l.mt_c1,l.mt_dem)+row(l.mt_c2,l.mt_dem)+row(l.mt_c3,l.mt_dem);
}
function pageContent(){
  const l=L(), pg=(l.pg||{})[document.body.dataset.page];
  const st=$("#steps");
  if(st&&l.steps){ $("#steps-h").textContent=l.steps_h;
    st.innerHTML=l.steps.map((s,i)=>`<div class="step"><b>${i+1}</b><h3>${s[0]}</h3><p>${s[1]}</p></div>`).join(""); }
  if(!pg) return;
  document.querySelectorAll("[data-pg]").forEach(el=>{ const v=pg[el.dataset.pg]; if(typeof v==="string") el.innerHTML=v; });
  const li=$("#pg-bul");   if(li) li.innerHTML=(pg.bul||[]).map(b=>`<span class="pb">${LEAF}${b}</span>`).join("");
  const inc=$("#pg-inc");  if(inc) inc.innerHTML=(pg.inc||[]).map(b=>`<li>${LEAF}<span>${b}</span></li>`).join("");
  const tb=$("#pg-pr");
  if(tb){ tb.innerHTML=(pg.pr||[]).map(r=>`<li><span class="nm3">${r[0]}<span class="d">${r[2]||""}</span></span><b>${r[1]}</b></li>`).join("");
    tb.closest(".ptable").hidden=!(pg.pr||[]).length; }
  const fq=$("#pg-faq");
  if(fq) fq.innerHTML=(pg.faq||[]).map(q=>`<details class="q"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join("");
}
function legalContent(){
  const g=$("#legal"); if(!g) return;
  const l=L().lg; if(!l) return;
  const rows=a=>`<dl class="idcard">${a.map(r=>`<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join("")}</dl>`;
  const list=a=>`<ul class="lgl">${a.map(x=>`<li>${LEAF}<span>${x}</span></li>`).join("")}</ul>`;
  g.innerHTML=`<h2>${l.s1}</h2>${rows(l.b1)}
    <h2>${l.s2}</h2><p>${l.p2}</p>
    <h2>${l.s3}</h2><p>${l.p3}</p>${list(l.b3)}
    <h2>${l.s4}</h2><p>${l.p4}</p>
    <h2>${l.s5}</h2><p>${l.p5}</p>
    <h2>${l.s6}</h2><p>${l.p6}</p>
    <p class="fine" style="margin-top:28px">${l.note}</p>`;
}
const LEAF='<svg class="leaf" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1c3 3 6 5 6 8a6 6 0 0 1-12 0c0-3 3-5 6-8Z"/></svg>';
function setLang(x){ lang=x; try{localStorage.setItem("smj-lang",x)}catch(e){} applyLang(); }
/* ---------- contenu des pages ---------- */
T.fr.steps_h = "Comment ça se passe";
T.fr.steps = [
 ["Vous calculez","Vous réglez votre maison et vous cliquez. Le prix s’affiche tout de suite, sans donner votre adresse."],
 ["On se parle","Vous laissez un numéro, on vous rappelle. On répond à vos questions, sans discours de vendeur."],
 ["On vient mesurer","Visite gratuite et sans engagement chez vous. C’est là que le prix devient exact."],
 ["On réalise","Devis signé, dates fixées, chantier propre. Un seul interlocuteur du début à la fin."]
];
T.fr.pg = {
chassis:{
 h1:"Châssis et portes à <span class='ac'>Ronse</span> et dans la région",
 lead:"PVC, aluminium ou bois, fabriqués sur mesure et posés par nos équipes. Calculez votre prix ici, en deux minutes, sans rendez-vous.",
 bul:["Devis gratuit et sans engagement","Dépose des anciens châssis comprise","TVA 6 % si votre maison a plus de 10 ans"],
 inc_h:"Ce qui est compris dans le prix",
 inc:["Le châssis fabriqué sur mesure, dans le matériau et la couleur que vous choisissez.",
      "Le double ou le triple vitrage, avec la valeur d’isolation adaptée.",
      "La dépose de vos anciens châssis et l’évacuation des déchets.",
      "La pose, le calfeutrage et les finitions intérieures et extérieures.",
      "La TVA à 6 % si le logement a plus de dix ans et que vous l’habitez."],
 pr_h:"Nos prix de référence",
 pr_s:"Prix moyens hors TVA, pose comprise. Le prix exact dépend des dimensions et de l’état de la maçonnerie : il est confirmé après la prise de mesures, qui est gratuite.",
 pr:[["Châssis PVC","450 €/m²","Le plus choisi : bon prix, pas d’entretien"],
     ["Châssis bois","600 €/m²","Chaleureux, demande un entretien régulier"],
     ["Châssis aluminium","750 €/m²","Fin et très solide, pour les grandes baies"],
     ["Minimum par ouverture","400 €","Une petite fenêtre coûte presque autant à poser qu’une grande"],
     ["Triple vitrage","+ 15 %","Utile surtout si la façade est exposée au bruit ou au nord"],
     ["Couleur ou anthracite","+ 10 %","Le blanc reste le moins cher"],
     ["Porte d’entrée","à partir de 1 400 €","PVC ; bois à partir de 1 600 €, alu à partir de 1 900 €"],
     ["Baie coulissante","à partir de 2 000 €","PVC ; alu à partir de 2 900 €"]],
 faq:[["Combien de temps entre la commande et la pose ?","Comptez en général six à dix semaines : les châssis sont fabriqués sur mesure après la prise de mesures. On vous donne une fourchette précise au moment du devis."],
      ["Vous travaillez aussi sur une seule fenêtre ?","Oui. Il y a un minimum de 400 € par ouverture, parce que le déplacement et la pose coûtent presque pareil pour une petite ou une grande fenêtre."],
      ["Faut-il refaire les tablettes et les finitions ?","Les finitions intérieures et extérieures autour du châssis sont comprises. Si vous voulez de nouvelles tablettes en pierre, on le chiffre à part."],
      ["Double ou triple vitrage ?","Le double vitrage suffit pour la plupart des maisons. Le triple se justifie surtout contre le bruit ou sur une façade nord. On en parle pendant la visite."]]
},
iso:{
 h1:"Isolation du <span class='ac'>toit</span>, des murs et des sols",
 lead:"C’est par le toit qu’une maison perd le plus de chaleur. Dites-nous ce que vous voulez isoler, on vous donne un prix tout de suite.",
 bul:["Surfaces calculées d’après votre maison","Mur creux insufflé en une journée","TVA 6 % si votre maison a plus de 10 ans"],
 inc_h:"Ce qui est compris dans le prix",
 inc:["L’isolant, les pare-vapeur et les fixations.",
      "La main-d’œuvre et le nettoyage du chantier.",
      "Les épaisseurs qui respectent les exigences des primes régionales.",
      "Pour le mur creux : le sondage préalable pour vérifier que la coulisse est exploitable.",
      "L’attestation dont vous avez besoin pour introduire votre dossier de prime."],
 pr_h:"Nos prix de référence",
 pr_s:"Prix moyens du marché belge 2026, hors TVA, pose comprise. Les surfaces affichées dans le calculateur sont estimées d’après la maison que vous réglez ; elles sont mesurées lors de la visite.",
 pr:[["Isolation de toiture","35 €/m²","Entre chevrons ou sur le plancher des combles"],
     ["Mur creux par insufflation","22 €/m²","Rapide et le moins cher, si la coulisse le permet"],
     ["Isolation par l’extérieur","120 €/m²","Plus cher, mais supprime les ponts thermiques et refait la façade"],
     ["Isolation du sol","25 €/m²","Sur la dalle ou sous le plancher d’une cave"]],
 faq:[["Comment savoir si mon mur creux peut être insufflé ?","On perce un petit trou témoin et on regarde l’épaisseur de la coulisse avec une caméra. Si elle est trop étroite ou bouchée, on vous le dit et on propose l’isolation par l’extérieur."],
      ["Y a-t-il encore des primes ?","Oui pour l’isolation, mais les montants et les conditions changent selon la région et selon l’année. On vous indique ce qui existe au moment du devis, sans rien promettre à votre place."],
      ["Combien de temps dure le chantier ?","Un mur creux insufflé se fait souvent en une journée. Une toiture prend plutôt deux à cinq jours selon la surface et l’accès."],
      ["Faut-il quitter la maison ?","Non. Pour le mur creux et la toiture, vous pouvez rester chez vous. Pour un sol, il faut libérer la pièce."]]
},
solar:{
 h1:"Panneaux <span class='ac'>solaires</span> : produisez votre électricité",
 lead:"Dites-nous ce que vous payez par mois, on vous propose un nombre de panneaux et un prix. Installation par nos partenaires certifiés.",
 bul:["Prix dégressif selon la taille","Installateurs certifiés RESCERT","Dossier et mise en service compris"],
 inc_h:"Ce qui est compris dans le prix",
 inc:["Les panneaux, l’onduleur et la structure de fixation.",
      "L’étude de votre toiture : orientation, inclinaison, ombrages, état de la couverture.",
      "La pose par un installateur certifié et le raccordement électrique.",
      "La déclaration auprès du gestionnaire de réseau et la mise en service.",
      "La TVA à 6 % si votre logement a plus de dix ans."],
 pr_h:"Nos prix de référence",
 pr_s:"Prix moyens belges 2026, TVA 6 % comprise. Le prix au watt baisse quand l’installation grandit : c’est pour ça que le calculateur affiche un prix dégressif.",
 pr:[["Petite installation (jusqu’à 4 kWc)","≈ 1,40 €/Wc","Environ 9 panneaux"],
     ["Installation moyenne (4 à 7 kWc)","≈ 1,20 €/Wc","Le cas le plus courant pour une maison"],
     ["Grande installation (plus de 7 kWc)","≈ 1,10 €/Wc","Grande toiture ou pompe à chaleur à alimenter"],
     ["Production estimée","≈ 950 kWh par kWc et par an","Moyenne belge, toiture correctement orientée"]],
 faq:[["Y a-t-il encore une prime ?","Non. Il n’y a plus de prime régionale pour le photovoltaïque en Flandre ni en Wallonie depuis 2024. Il reste la TVA à 6 % et les prêts à taux zéro selon votre situation."],
      ["Et si mon toit est mal orienté ?","Une toiture est-ouest produit moins qu’une plein sud, mais reste souvent rentable. On le vérifie pendant l’étude avant de vous engager."],
      ["Faut-il une batterie ?","Pas forcément. Une batterie ne devient intéressante que si vous consommez peu en journée. On regarde votre profil de consommation avant de vous en proposer une."],
      ["Qui vient poser ?","Un installateur certifié avec qui S.Majestic travaille régulièrement. Vous gardez le même interlocuteur du devis jusqu’à la mise en service."]]
},
clim:{
 h1:"<span class='ac'>Clim</span> et pompe à chaleur",
 lead:"Frais l’été, chaud l’hiver. Cliquez sur les pièces à équiper dans la vue intérieure, le prix suit. Installation par nos partenaires certifiés.",
 bul:["Une pièce ou toute la maison","Installateur certifié F-gaz","Entretien annuel possible"],
 inc_h:"Ce qui est compris dans le prix",
 inc:["Le groupe extérieur et les unités intérieures.",
      "Les liaisons frigorifiques, l’évacuation des condensats et le percement des murs.",
      "La pose par un technicien certifié pour la manipulation des gaz réfrigérants.",
      "La mise en service, les réglages et la prise en main avec vous.",
      "La garantie constructeur sur le matériel."],
 pr_h:"Nos prix de référence",
 pr_s:"Prix moyens belges 2026, hors TVA, pose comprise. Attention au taux de TVA : une clim qui ne fait que refroidir est à 21 %, une installation qui chauffe aussi passe à 6 % si le logement a plus de dix ans.",
 pr:[["Première pièce équipée","≈ 2 100 €","Groupe extérieur + une unité intérieure"],
     ["Chaque pièce supplémentaire","≈ 850 €","Unité intérieure raccordée au même groupe"],
     ["Pompe à chaleur air-eau","≈ 9 000 €","Remplace votre chaudière et alimente vos radiateurs"]],
 faq:[["Clim réversible ou pompe à chaleur ?","Une clim réversible chauffe l’air de la pièce où elle est posée. Une pompe à chaleur air-eau remplace la chaudière et alimente tout le circuit de chauffage. Le choix dépend de ce que vous voulez remplacer."],
      ["Pourquoi la TVA change-t-elle ?","Un appareil qui ne fait que refroidir n’est pas considéré comme du chauffage : il reste à 21 %. Dès que l’installation chauffe aussi le logement, elle entre dans la rénovation à 6 % si la maison a plus de dix ans."],
      ["Est-ce bruyant ?","Les unités intérieures récentes tournent autour de 20 à 25 dB en mode nuit. Le groupe extérieur fait plus de bruit : on choisit son emplacement avec vous, en pensant aux voisins."],
      ["Faut-il un entretien ?","Un entretien annuel est recommandé et souvent exigé pour garder la garantie. On peut le prévoir dans un contrat."]]
},
finit:{
 h1:"Plafonnage, cloisons, sols et <span class='ac'>peinture</span>",
 lead:"Les finitions qui transforment vraiment une maison. Choisissez vos travaux, on calcule les surfaces d’après votre maison et on affiche le prix.",
 bul:["Prix S.Majestic au m²","Surfaces calculées pour vous","Un seul chantier, une seule équipe"],
 inc_h:"Ce qui est compris dans le prix",
 inc:["Les fournitures et la main-d’œuvre, sauf mention contraire dans le tableau.",
      "La protection des sols et des meubles, et le nettoyage en fin de chantier.",
      "Pour le plafonnage : une épaisseur jusqu’à 1 cm sur mur existant.",
      "Pour le carrelage : un carrelage de votre choix jusqu’à 25 €/m².",
      "Pour le parquet : un laminé 7 mm ; un autre modèle est possible, le prix suit."],
 pr_h:"Nos prix",
 pr_s:"Prix S.Majestic hors TVA, fournitures et pose comprises. Le plafonnage, les cloisons, les plafonds coupe-feu et les sols sont nos tarifs directs. La peinture et l’enduit de façade sont encore des moyennes de marché, à confirmer lors de la visite.",
 pr:[["Plafonnage sur mur neuf","18 €/m²","Blocs ou briques neufs, support droit"],
     ["Plafonnage sur mur existant","25 €/m²","Épaisseur jusqu’à 1 cm ; au-delà, supplément calculé sur place"],
     ["Cloison stud métal + gyproc","50 €/m²","Isolation acoustique ou thermique en supplément"],
     ["Cloison phonique","150 €/m²","Descend sous les 80 dB, entre deux logements par exemple"],
     ["Plafond coupe-feu RF 30 min","70 €/m²","Le minimum demandé entre deux logements"],
     ["Plafond coupe-feu RF 1 h","90 €/m²","Commerce, horeca, immeuble à appartements"],
     ["Parquet laminé 7 mm posé","45 €/m²","Fourniture et pose, modèle au choix"],
     ["Carrelage posé","60 €/m²","Carrelage au choix jusqu’à 25 €/m²"],
     ["Peinture intérieure","20 à 38 €/m²","Selon l’état des murs"],
     ["Enduit de façade","55 à 75 €/m²","Monocouche ou finition silicone, échafaudage en plus"]],
 faq:[["Le plafonnage et la peinture, c’est le même chantier ?","On peut tout enchaîner, mais il faut laisser le plafonnage sécher quatre à six semaines avant de peindre. On planifie les deux phases ensemble."],
      ["Comment calculez-vous mes surfaces ?","Les plafonds correspondent à la surface au sol multipliée par le nombre de niveaux. Les murs sont estimés à deux fois et demie la surface au sol, une règle de métier. Tout est remesuré lors de la visite."],
      ["Je peux choisir mon carrelage ?","Oui. Le prix de 60 €/m² comprend un carrelage d’une valeur maximale de 25 €/m². Si vous en choisissez un plus cher, on ajoute simplement la différence."],
      ["Vous faites une cloison avec isolation acoustique ?","Oui, c’est un supplément sur le prix de la cloison stud. On le chiffre pendant la visite selon l’épaisseur et le type d’isolant."]]
},
reno:{
 h1:"<span class='ac'>Rénovation</span> complète ou par pièce",
 lead:"Salle de bain, cuisine, toiture, façade, ou toute la maison. Trop de paramètres pour un prix en ligne honnête : on vient voir et on chiffre.",
 bul:["Un seul interlocuteur","Coordination de tous les corps de métier","Devis détaillé poste par poste"],
 inc_h:"Comment on travaille",
 inc:["On vient voir le bien et on écoute ce que vous voulez en faire.",
      "On vous remet un devis détaillé, poste par poste, pas un montant global.",
      "On coordonne les corps de métier : vous ne courez pas après cinq entreprises.",
      "On fixe les dates à l’avance et on vous prévient si quelque chose bouge.",
      "On fait le tour du chantier avec vous avant la facture finale."],
 pr_h:"Pourquoi pas de prix en ligne ici",
 pr_s:"Pour les châssis ou l’isolation, un prix au m² a du sens. Pour une rénovation complète, non : deux salles de bain de même taille peuvent aller du simple au triple selon l’état des évacuations, l’électricité, le carrelage choisi. Vous donner un chiffre au hasard ne vous rendrait pas service. Par contre, les postes qu’on sait chiffrer sont dans nos calculateurs : utilisez-les pour avoir déjà une base.",
 pr:[],
 faq:[["Vous faites aussi les petits chantiers ?","Oui. Une salle de bain seule ou une pièce à refaire, c’est possible. Dites-nous ce que vous avez en tête."],
      ["Combien de temps pour une rénovation complète ?","Ça dépend de l’ampleur, mais comptez plusieurs mois pour une maison entière. On vous donne un planning réaliste au devis, pas une promesse optimiste."],
      ["Qui s’occupe des corps de métier ?","S.Majestic coordonne. Pour les panneaux solaires et la clim, ce sont des partenaires certifiés, mais vous gardez le même interlocuteur."],
      ["Travaillez-vous en sous-traitance pour d’autres entreprises ?","Oui, c’est une partie de l’activité. Contactez-nous avec le détail du chantier."]]
},
materiel:{
 h1:"Matériel et <span class='ac'>chantier</span>",
 lead:"Mini-pelle, grue et citerne d’eau de pluie. Pour les entrepreneurs, les indépendants et les particuliers qui gèrent leur chantier eux-mêmes.",
 bul:["Tarifs directs, sans devis à attendre","Livraison et reprise sur place","Chauffeur compris pour la mini-pelle"],
 inc_h:"Bon à savoir avant de réserver",
 inc:["Les tarifs de location s’entendent hors TVA 21 % : la location de matériel n’entre pas dans la TVA à 6 % de la rénovation.",
      "La mini-pelle vient avec son chauffeur : vous n’avez pas besoin d’un permis ni d’une attestation.",
      "La grue est livrée et reprise sur place, la livraison se facture par voyage.",
      "Minimum de facturation, assurance et disponibilité se confirment par téléphone.",
      "Pour les citernes d’eau de pluie, la pose et le terrassement sont compris dans le devis."],
 pr_h:"",pr_s:"",pr:[],
 faq:[["Faut-il un permis pour la mini-pelle ?","Non, puisqu’elle vient avec un chauffeur. Vous indiquez ce qu’il faut creuser, il s’en occupe."],
      ["La grue vient avec un grutier ?","À confirmer par téléphone selon le modèle et le chantier. Appelez-nous avec les détails, on vous dit ce qui est possible."],
      ["Quelle citerne choisir ?","Cinq mille litres suffisent souvent pour les toilettes et le jardin. Au-delà de dix mille, c’est surtout utile si vous alimentez aussi la machine à laver. On en parle selon la surface de votre toiture."],
      ["Vous livrez loin de Ronse ?","La livraison se facture par voyage. Donnez-nous l’adresse du chantier, on vous dit combien de voyages sont nécessaires."]]
}};

T.nl.steps_h = "Hoe het verloopt";
T.nl.steps = [
 ["U rekent","U stelt uw woning in en klikt. De prijs verschijnt meteen, zonder uw adres te geven."],
 ["We spreken elkaar","U laat een nummer na, wij bellen terug. We beantwoorden uw vragen, zonder verkooppraat."],
 ["We komen opmeten","Gratis bezoek, vrijblijvend. Dan pas wordt de prijs exact."],
 ["We voeren uit","Offerte getekend, data vastgelegd, nette werf. Eén aanspreekpunt van begin tot eind."]
];
T.nl.pg = {
chassis:{
 h1:"Ramen en deuren in <span class='ac'>Ronse</span> en omgeving",
 lead:"PVC, aluminium of hout, op maat gemaakt en door onze ploegen geplaatst. Bereken hier uw prijs, in twee minuten, zonder afspraak.",
 bul:["Gratis en vrijblijvende offerte","Wegnemen van de oude ramen inbegrepen","6 % btw als uw woning ouder is dan 10 jaar"],
 inc_h:"Wat in de prijs zit",
 inc:["Het raam op maat gemaakt, in het materiaal en de kleur die u kiest.",
      "Dubbele of driedubbele beglazing, met de passende isolatiewaarde.",
      "Het wegnemen van uw oude ramen en de afvoer van het afval.",
      "De plaatsing, het opschuimen en de afwerking binnen en buiten.",
      "6 % btw als de woning ouder is dan tien jaar en u er woont."],
 pr_h:"Onze richtprijzen",
 pr_s:"Gemiddelde prijzen excl. btw, plaatsing inbegrepen. De exacte prijs hangt af van de afmetingen en de staat van het metselwerk: hij wordt bevestigd na de gratis opmeting.",
 pr:[["PVC-ramen","450 €/m²","Meest gekozen: goede prijs, geen onderhoud"],
     ["Houten ramen","600 €/m²","Warm, vraagt regelmatig onderhoud"],
     ["Aluminium ramen","750 €/m²","Slank en zeer sterk, voor grote raampartijen"],
     ["Minimum per opening","400 €","Een klein raam plaatsen kost bijna evenveel als een groot"],
     ["Driedubbele beglazing","+ 15 %","Vooral nuttig bij lawaai of een noordgevel"],
     ["Kleur of antraciet","+ 10 %","Wit blijft het goedkoopst"],
     ["Voordeur","vanaf 1 400 €","PVC; hout vanaf 1 600 €, alu vanaf 1 900 €"],
     ["Schuifraam","vanaf 2 000 €","PVC; alu vanaf 2 900 €"]],
 faq:[["Hoelang duurt het tussen bestelling en plaatsing?","Reken op zes tot tien weken: de ramen worden na de opmeting op maat gemaakt. U krijgt een precieze vork bij de offerte."],
      ["Doet u ook één enkel raam?","Ja. Er geldt een minimum van 400 € per opening, omdat de verplaatsing en de plaatsing bijna evenveel kosten voor een klein als voor een groot raam."],
      ["Moeten de vensterbanken en de afwerking vernieuwd worden?","De afwerking binnen en buiten rond het raam zit in de prijs. Nieuwe natuurstenen tabletten begroten we apart."],
      ["Dubbel of driedubbel glas?","Dubbel glas volstaat voor de meeste woningen. Driedubbel is vooral zinvol tegen geluid of op een noordgevel. We bespreken het tijdens het bezoek."]]
},
iso:{
 h1:"Isolatie van <span class='ac'>dak</span>, muren en vloeren",
 lead:"Via het dak verliest een woning de meeste warmte. Zeg ons wat u wilt isoleren, u krijgt meteen een prijs.",
 bul:["Oppervlakten berekend op uw woning","Spouwmuur ingeblazen op één dag","6 % btw als uw woning ouder is dan 10 jaar"],
 inc_h:"Wat in de prijs zit",
 inc:["Het isolatiemateriaal, de dampschermen en de bevestigingen.",
      "De arbeid en het opruimen van de werf.",
      "Diktes die voldoen aan de eisen van de regionale premies.",
      "Voor de spouwmuur: het voorafgaande onderzoek om te zien of de spouw bruikbaar is.",
      "Het attest dat u nodig hebt om uw premiedossier in te dienen."],
 pr_h:"Onze richtprijzen",
 pr_s:"Gemiddelde Belgische marktprijzen 2026, excl. btw, plaatsing inbegrepen. De oppervlakten in de rekenmodule zijn geschat op basis van de woning die u instelt; ze worden bij het bezoek opgemeten.",
 pr:[["Dakisolatie","35 €/m²","Tussen de kepers of op de zoldervloer"],
     ["Spouwmuur inblazen","22 €/m²","Snel en het goedkoopst, als de spouw het toelaat"],
     ["Buitenisolatie","120 €/m²","Duurder, maar weg met de koudebruggen en de gevel is meteen vernieuwd"],
     ["Vloerisolatie","25 €/m²","Op de vloerplaat of onder de vloer van een kelder"]],
 faq:[["Hoe weet ik of mijn spouwmuur ingeblazen kan worden?","We boren een proefgaatje en bekijken de spouw met een camera. Is ze te smal of vervuild, dan zeggen we dat en stellen we buitenisolatie voor."],
      ["Bestaan er nog premies?","Ja voor isolatie, maar de bedragen en voorwaarden verschillen per gewest en per jaar. We tonen u wat er op dat moment bestaat, zonder iets in uw plaats te beloven."],
      ["Hoelang duren de werken?","Een spouwmuur inblazen lukt vaak op één dag. Een dak vraagt eerder twee tot vijf dagen, afhankelijk van de oppervlakte en de toegang."],
      ["Moet ik het huis uit?","Nee. Voor spouwmuur en dak kunt u gewoon thuis blijven. Voor een vloer moet de kamer leeg zijn."]]
},
solar:{
 h1:"<span class='ac'>Zonnepanelen</span>: wek uw eigen stroom op",
 lead:"Zeg ons wat u per maand betaalt, wij stellen een aantal panelen en een prijs voor. Plaatsing door onze gecertificeerde partners.",
 bul:["Degressieve prijs volgens grootte","RESCERT-gecertificeerde installateurs","Dossier en indienststelling inbegrepen"],
 inc_h:"Wat in de prijs zit",
 inc:["De panelen, de omvormer en de bevestigingsstructuur.",
      "De studie van uw dak: oriëntatie, hellingsgraad, schaduw, staat van de bedekking.",
      "De plaatsing door een gecertificeerde installateur en de elektrische aansluiting.",
      "De aangifte bij de netbeheerder en de indienststelling.",
      "6 % btw als uw woning ouder is dan tien jaar."],
 pr_h:"Onze richtprijzen",
 pr_s:"Gemiddelde Belgische prijzen 2026, 6 % btw inbegrepen. De prijs per watt daalt naarmate de installatie groeit: daarom toont de rekenmodule een degressieve prijs.",
 pr:[["Kleine installatie (tot 4 kWp)","≈ 1,40 €/Wp","Ongeveer 9 panelen"],
     ["Gemiddelde installatie (4 tot 7 kWp)","≈ 1,20 €/Wp","Het vaakst voorkomende geval"],
     ["Grote installatie (meer dan 7 kWp)","≈ 1,10 €/Wp","Groot dak of een warmtepomp te voeden"],
     ["Geschatte opbrengst","≈ 950 kWh per kWp per jaar","Belgisch gemiddelde, correct georiënteerd dak"]],
 faq:[["Bestaat er nog een premie?","Nee. Sinds 2024 is er geen regionale premie meer voor fotovoltaïsche panelen in Vlaanderen of Wallonië. Blijven over: 6 % btw en renteloze leningen volgens uw situatie."],
      ["En als mijn dak slecht georiënteerd is?","Een oost-westdak levert minder op dan pal zuid, maar blijft vaak rendabel. We controleren het tijdens de studie, vóór u zich vastlegt."],
      ["Heb ik een batterij nodig?","Niet noodzakelijk. Een batterij wordt pas interessant als u overdag weinig verbruikt. We bekijken eerst uw verbruiksprofiel."],
      ["Wie komt plaatsen?","Een gecertificeerde installateur waarmee S.Majestic regelmatig werkt. U houdt hetzelfde aanspreekpunt van offerte tot indienststelling."]]
},
clim:{
 h1:"<span class='ac'>Airco</span> en warmtepomp",
 lead:"Koel in de zomer, warm in de winter. Klik in het binnenzicht op de kamers die u wilt uitrusten, de prijs volgt. Plaatsing door gecertificeerde partners.",
 bul:["Eén kamer of de hele woning","F-gas gecertificeerde installateur","Jaarlijks onderhoud mogelijk"],
 inc_h:"Wat in de prijs zit",
 inc:["De buitenunit en de binnenunits.",
      "De koelleidingen, de condensafvoer en het doorboren van de muren.",
      "De plaatsing door een technicus met certificaat voor koelmiddelen.",
      "De indienststelling, de instellingen en de uitleg samen met u.",
      "De fabrieksgarantie op het materiaal."],
 pr_h:"Onze richtprijzen",
 pr_s:"Gemiddelde Belgische prijzen 2026, excl. btw, plaatsing inbegrepen. Let op het btw-tarief: een airco die alleen koelt zit aan 21 %, een installatie die ook verwarmt zakt naar 6 % als de woning ouder is dan tien jaar.",
 pr:[["Eerste uitgeruste kamer","≈ 2 100 €","Buitenunit + één binnenunit"],
     ["Elke extra kamer","≈ 850 €","Binnenunit op dezelfde buitenunit"],
     ["Lucht-waterwarmtepomp","≈ 9 000 €","Vervangt uw ketel en voedt uw radiatoren"]],
 faq:[["Omkeerbare airco of warmtepomp?","Een omkeerbare airco verwarmt de lucht van de kamer waar hij hangt. Een lucht-waterwarmtepomp vervangt de ketel en voedt het hele verwarmingscircuit. De keuze hangt af van wat u wilt vervangen."],
      ["Waarom verandert de btw?","Een toestel dat alleen koelt geldt niet als verwarming: het blijft aan 21 %. Zodra de installatie ook verwarmt, valt ze onder renovatie aan 6 % als de woning ouder is dan tien jaar."],
      ["Maakt het lawaai?","Recente binnenunits draaien rond 20 à 25 dB in nachtstand. De buitenunit maakt meer geluid: we kiezen de plaats samen met u, met de buren in gedachten."],
      ["Is onderhoud nodig?","Jaarlijks onderhoud is aanbevolen en vaak vereist om de garantie te behouden. We kunnen dat in een contract voorzien."]]
},
finit:{
 h1:"Pleisterwerk, wanden, vloeren en <span class='ac'>schilderwerk</span>",
 lead:"De afwerking die een woning echt verandert. Kies uw werken, wij berekenen de oppervlakten op basis van uw woning en tonen de prijs.",
 bul:["S.Majestic-prijzen per m²","Oppervlakten voor u berekend","Eén werf, één ploeg"],
 inc_h:"Wat in de prijs zit",
 inc:["De materialen en de arbeid, tenzij anders vermeld in de tabel.",
      "Het afdekken van vloeren en meubels, en het opruimen na de werken.",
      "Voor pleisterwerk: een dikte tot 1 cm op een bestaande muur.",
      "Voor tegels: tegels naar keuze tot 25 €/m².",
      "Voor parket: laminaat 7 mm; een ander model kan, de prijs volgt."],
 pr_h:"Onze prijzen",
 pr_s:"S.Majestic-prijzen excl. btw, materiaal en plaatsing inbegrepen. Pleisterwerk, wanden, brandwerende plafonds en vloeren zijn onze directe tarieven. Schilderwerk en gevelbezetting zijn nog marktgemiddelden, te bevestigen bij het bezoek.",
 pr:[["Pleisterwerk op nieuwe muur","18 €/m²","Nieuwe blokken of bakstenen, rechte ondergrond"],
     ["Pleisterwerk op bestaande muur","25 €/m²","Dikte tot 1 cm; daarboven supplement ter plaatse"],
     ["Metalstud + gyproc","50 €/m²","Akoestische of thermische isolatie in supplement"],
     ["Akoestische wand","150 €/m²","Gaat onder de 80 dB, bijvoorbeeld tussen twee woningen"],
     ["Brandwerend plafond RF 30 min","70 €/m²","Het minimum tussen twee woningen"],
     ["Brandwerend plafond RF 1 u","90 €/m²","Handelszaak, horeca, appartementsgebouw"],
     ["Laminaat 7 mm geplaatst","45 €/m²","Levering en plaatsing, model naar keuze"],
     ["Tegels geplaatst","60 €/m²","Tegels naar keuze tot 25 €/m²"],
     ["Binnenschilderwerk","20 tot 38 €/m²","Afhankelijk van de staat van de muren"],
     ["Gevelbezetting","55 tot 75 €/m²","Eenlaags of siliconen, stelling extra"]],
 faq:[["Pleisterwerk en schilderwerk, is dat dezelfde werf?","Alles kan na elkaar, maar het pleisterwerk moet vier tot zes weken drogen voor er geschilderd wordt. We plannen beide fasen samen."],
      ["Hoe berekent u mijn oppervlakten?","De plafonds zijn de vloeroppervlakte maal het aantal niveaus. De muren schatten we op tweeënhalf keer de vloeroppervlakte, een vuistregel uit het vak. Alles wordt bij het bezoek opnieuw opgemeten."],
      ["Mag ik mijn tegels zelf kiezen?","Ja. De 60 €/m² bevat tegels met een waarde tot 25 €/m². Kiest u duurdere tegels, dan rekenen we gewoon het verschil bij."],
      ["Maakt u een wand met akoestische isolatie?","Ja, dat is een supplement op de prijs van de metalstudwand. We begroten het tijdens het bezoek volgens dikte en soort isolatie."]]
},
reno:{
 h1:"<span class='ac'>Renovatie</span>, volledig of per kamer",
 lead:"Badkamer, keuken, dak, gevel of de hele woning. Te veel parameters voor een eerlijke online prijs: we komen kijken en begroten.",
 bul:["Eén aanspreekpunt","Coördinatie van alle vakmensen","Gedetailleerde offerte, post per post"],
 inc_h:"Hoe we werken",
 inc:["We komen het pand bekijken en luisteren naar wat u ermee wilt.",
      "U krijgt een gedetailleerde offerte, post per post, geen globaal bedrag.",
      "Wij coördineren de vakmensen: u hoeft geen vijf bedrijven achterna te lopen.",
      "We leggen de data op voorhand vast en verwittigen u als er iets schuift.",
      "We lopen de werf samen met u na vóór de eindfactuur."],
 pr_h:"Waarom hier geen online prijs",
 pr_s:"Voor ramen of isolatie heeft een prijs per m² zin. Voor een volledige renovatie niet: twee badkamers van dezelfde grootte kunnen drie keer zoveel verschillen door de staat van de afvoeren, de elektriciteit of de gekozen tegels. Een willekeurig cijfer geven helpt u niet. De posten die we wél kunnen berekenen staan in onze rekenmodules: gebruik ze om al een basis te hebben.",
 pr:[],
 faq:[["Doet u ook kleine werven?","Ja. Alleen een badkamer of één kamer opknappen kan. Zeg ons wat u in gedachten hebt."],
      ["Hoelang duurt een volledige renovatie?","Dat hangt af van de omvang, maar reken op meerdere maanden voor een hele woning. U krijgt een realistische planning bij de offerte, geen optimistische belofte."],
      ["Wie regelt de vakmensen?","S.Majestic coördineert. Voor zonnepanelen en airco zijn dat gecertificeerde partners, maar u houdt hetzelfde aanspreekpunt."],
      ["Werkt u ook in onderaanneming voor andere bedrijven?","Ja, dat is een deel van de activiteit. Contacteer ons met de details van de werf."]]
},
materiel:{
 h1:"Materieel en <span class='ac'>werf</span>",
 lead:"Minigraver, kraan en regenwaterput. Voor aannemers, zelfstandigen en particulieren die hun werf zelf beheren.",
 bul:["Directe tarieven, geen wachttijd","Levering en ophaling ter plaatse","Chauffeur inbegrepen bij de minigraver"],
 inc_h:"Goed om te weten voor u reserveert",
 inc:["De huurtarieven zijn excl. 21 % btw: materieelverhuur valt niet onder de 6 % btw voor renovatie.",
      "De minigraver komt met chauffeur: u hebt geen rijbewijs of attest nodig.",
      "De kraan wordt ter plaatse geleverd en opgehaald, de levering wordt per rit gefactureerd.",
      "Minimumfacturatie, verzekering en beschikbaarheid worden telefonisch bevestigd.",
      "Voor regenwaterputten zitten de plaatsing en het grondwerk in de offerte."],
 pr_h:"",pr_s:"",pr:[],
 faq:[["Heb ik een rijbewijs nodig voor de minigraver?","Nee, want hij komt met chauffeur. U geeft aan wat er uitgegraven moet worden, hij doet de rest."],
      ["Komt de kraan met een kraanman?","Telefonisch te bevestigen volgens model en werf. Bel ons met de details, we zeggen u wat mogelijk is."],
      ["Welke regenwaterput kiezen?","Vijfduizend liter volstaat vaak voor toilet en tuin. Boven tienduizend is vooral nuttig als u ook de wasmachine voedt. We bekijken het volgens uw dakoppervlakte."],
      ["Levert u ver buiten Ronse?","De levering wordt per rit gefactureerd. Geef ons het adres van de werf, we zeggen hoeveel ritten nodig zijn."]]
}};

/* ---------- mentions légales & vie privée ---------- */
T.fr.lg = {
 h1:"Mentions légales et <span class='ac'>vie privée</span>",
 lead:"Les informations que la loi belge impose à tout site commercial, et ce qu’on fait de vos données.",
 s1:"Qui édite ce site",
 b1:[["Dénomination","S. MAJESTIC"],
     ["Forme juridique","Société à responsabilité limitée (SRL / BV)"],
     ["Siège social","Sint-Cornelisstraat 59, 9600 Ronse, Belgique"],
     ["Numéro d’entreprise (BCE)","BE 1020.521.459"],
     ["Numéro de TVA","BE 1020.521.459"],
     ["Date de constitution","27 février 2025"],
     ["Téléphone","[à compléter]"],
     ["E-mail","[à compléter]"]],
 s2:"Les prix affichés sur ce site",
 p2:"Le calculateur donne une <b>estimation</b>, pas une offre. Il se base sur des dimensions standard et sur la maison que vous réglez vous-même à l’écran. Le prix définitif est confirmé par écrit après la visite et la prise de mesures, qui sont gratuites et sans engagement. Une estimation affichée ici ne constitue donc pas un engagement contractuel au sens de l’article VI.2 du Code de droit économique.",
 s3:"Ce qu’on fait de vos données",
 p3:"Quand vous remplissez le formulaire, vous nous transmettez votre nom, votre téléphone, éventuellement votre e-mail, votre code postal et la description de votre projet. On s’en sert uniquement pour vous rappeler et établir votre devis. C’est la base légale des « mesures précontractuelles » (RGPD, article 6.1.b).",
 b3:["On ne vend ni ne loue vos données à personne.",
     "On ne les transmet qu’à l’installateur certifié concerné si votre demande porte sur des panneaux solaires ou une climatisation.",
     "On les conserve trois ans après le dernier contact, puis on les supprime.",
     "Vous pouvez demander à les consulter, les corriger ou les effacer : écrivez-nous, on répond dans le mois."],
 s4:"Cookies",
 p4:"Ce site ne dépose <b>aucun cookie publicitaire ni de mesure d’audience</b>. Votre navigateur retient seulement la langue que vous choisissez (FR ou NL), et cette information ne quitte jamais votre appareil. C’est pour cette raison qu’aucune bannière cookies ne vous est demandée.",
 s5:"Photos et contenus",
 p5:"Les photos de chantier publiées sur ce site sont des réalisations de S. Majestic. Les vues en 3D, signalées par la mention « Vue 3D », sont des illustrations générées par le configurateur : ce ne sont pas des photos d’installations existantes. Les textes, photos et illustrations ne peuvent pas être réutilisés sans accord écrit.",
 s6:"Réclamation",
 p6:"Si quelque chose ne va pas, parlez-nous-en d’abord : c’est souvent plus rapide. Pour un litige de consommation, vous pouvez saisir le Service de médiation pour le consommateur (mediationconsommateur.be) ou la plateforme européenne de règlement en ligne. Pour une question de données personnelles, vous pouvez introduire une plainte auprès de l’Autorité de protection des données (autoriteprotectiondonnees.be).",
 note:"Dernière mise à jour : octobre 2026. Téléphone et e-mail restent à compléter avant la mise en ligne définitive."
};
T.nl.lg = {
 h1:"Juridische informatie en <span class='ac'>privacy</span>",
 lead:"De gegevens die de Belgische wet van elke commerciële website eist, en wat we met uw gegevens doen.",
 s1:"Wie deze site uitgeeft",
 b1:[["Benaming","S. MAJESTIC"],
     ["Rechtsvorm","Besloten Vennootschap (BV)"],
     ["Maatschappelijke zetel","Sint-Cornelisstraat 59, 9600 Ronse, België"],
     ["Ondernemingsnummer (KBO)","BE 1020.521.459"],
     ["Btw-nummer","BE 1020.521.459"],
     ["Oprichtingsdatum","27 februari 2025"],
     ["Telefoon","[aan te vullen]"],
     ["E-mail","[aan te vullen]"]],
 s2:"De prijzen op deze site",
 p2:"De rekenmodule geeft een <b>raming</b>, geen offerte. Ze vertrekt van standaardafmetingen en van de woning die u zelf op het scherm instelt. De definitieve prijs wordt schriftelijk bevestigd na het gratis en vrijblijvende bezoek en de opmeting. Een raming op deze site is dus geen contractuele verbintenis in de zin van artikel VI.2 van het Wetboek van economisch recht.",
 s3:"Wat we met uw gegevens doen",
 p3:"Wanneer u het formulier invult, bezorgt u ons uw naam, telefoonnummer, eventueel uw e-mailadres, uw postcode en de omschrijving van uw project. We gebruiken die enkel om u terug te bellen en uw offerte op te maken. Dat is de rechtsgrond van de « precontractuele maatregelen » (AVG, artikel 6.1.b).",
 b3:["We verkopen of verhuren uw gegevens aan niemand.",
     "We geven ze enkel door aan de betrokken gecertificeerde installateur als uw aanvraag over zonnepanelen of airco gaat.",
     "We bewaren ze drie jaar na het laatste contact en wissen ze daarna.",
     "U mag ze opvragen, laten verbeteren of laten wissen: schrijf ons, we antwoorden binnen de maand."],
 s4:"Cookies",
 p4:"Deze site plaatst <b>geen enkele reclame- of analysecookie</b>. Uw browser onthoudt enkel de taal die u kiest (FR of NL), en die informatie verlaat uw toestel nooit. Daarom krijgt u ook geen cookiebanner te zien.",
 s5:"Foto’s en inhoud",
 p5:"De werffoto’s op deze site zijn realisaties van S. Majestic. De 3D-beelden, aangeduid met « 3D-zicht », zijn illustraties uit de configurator: het zijn geen foto’s van bestaande installaties. Teksten, foto’s en illustraties mogen niet worden hergebruikt zonder schriftelijke toestemming.",
 s6:"Klacht",
 p6:"Loopt er iets mis, spreek ons er eerst over aan: dat gaat meestal sneller. Voor een consumentengeschil kunt u terecht bij de Consumentenombudsdienst (consumentenombudsdienst.be) of bij het Europese platform voor onlinegeschillenbeslechting. Voor een vraag over persoonsgegevens kunt u klacht indienen bij de Gegevensbeschermingsautoriteit (gegevensbeschermingsautoriteit.be).",
 note:"Laatste update: oktober 2026. Telefoon en e-mail moeten nog ingevuld worden vóór de definitieve publicatie."
};

applyLang();
