const universities = [
  {
    universityId: 1,
    name: 'Ben-Gurion University',
    type: 'University',
    location: 'Beer-Sheva',
    logoUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Ben-Gurion_University_of_the_Negev_logo.svg',
    websiteUrl: 'https://www.bgu.ac.il',
    description: 'A major research university known for its pioneering spirit, strong community vibes, and leading advancements in desert research, engineering, and cyber-security.'
  },
  {
    universityId: 2,
    name: 'Tel Aviv University',
    type: 'University',
    location: 'Tel Aviv',
    logoUrl: 'https://english.tau.ac.il/sites/default/files/footer_logo/TAU_university_logo_ENG.png',
    websiteUrl: 'https://www.tau.ac.il',
    description: 'Israel’s largest institution of higher learning, globally recognized for its vibrant campus culture, multidisciplinary research, and strong ties to the thriving tech ecosystem.'
  },
  {
    universityId: 3,
    name: 'Hebrew University',
    type: 'University',
    location: 'Jerusalem',
    logoUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Hebrew_University_Logo.svg',
    websiteUrl: 'https://www.huji.ac.il',
    description: 'A prestigious, world-renowned institution co-founded by Albert Einstein, deep-rooted in rich history and celebrated for its academic excellence across humanities and sciences.'
  },
  {
    universityId: 4,
    name: 'Technion',
    type: 'University',
    location: 'Haifa',
    logoUrl: 'https://marketing.technion.ac.il/wp-content/uploads/Eng_Hor_1L_Blue55-240.png',
    websiteUrl: 'https://www.technion.ac.il',
    description: 'A premier global science and technology research university, widely credited as the powerhouse driving the innovation behind Israel’s Startup Nation status.'
  },
  {
    universityId: 5,
    name: 'University of Haifa',
    type: 'University',
    location: 'Haifa',
    logoUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Haifa_logo_official_apperence_dark_%28cropped%29.png',
    websiteUrl: 'https://www.haifa.ac.il',
    description: 'Perched atop Mount Carmel, this university is highly regarded for its diverse student body and exceptional programs in marine sciences, humanities, and social work.'
  },
  {
    universityId: 6,
    name: 'Bar-Ilan University',
    type: 'University',
    location: 'Ramat Gan',
    logoUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Biu_2019_logo.svg',
    websiteUrl: 'https://www.biu.ac.il',
    description: 'An expansive research university uniquely blending high-level academic training in exact sciences, law, and medicine with the study of Jewish heritage.'
  },
  {
    universityId: 7,
    name: 'Weizmann Institute of Science',
    type: 'University',
    location: 'Rehovot',
    logoUrl: 'https://www.weizmann.ac.il/pages/sites/default/files/group_1262x_1.png',
    websiteUrl: 'https://www.weizmann.ac.il',
    description: 'A world-renowned graduate research institute focused on natural sciences, mathematics, computer science, and multidisciplinary scientific discovery.'
  },
  {
    universityId: 8,
    name: 'The Open University of Israel',
    type: 'University',
    location: 'Ra’anana',
    logoUrl: 'https://www.openu.ac.il/_layouts/15/OpenU_WWW/Theming/Responsive/imagesWrapper/logo_op_en.png?v=6',
    websiteUrl: 'https://www.openu.ac.il',
    description: 'Israel’s distance-learning university, offering flexible academic programs and open-access study paths for students across the country.'
  },
  {
    universityId: 9,
    name: 'Ariel University',
    type: 'University',
    location: 'Ariel',
    logoUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Ariel_university.logo.jpg',
    websiteUrl: 'https://www.ariel.ac.il',
    description: 'A growing research university offering programs across engineering, health sciences, natural sciences, social sciences, architecture, and the humanities.'
  },
  {
    universityId: 10,
    name: 'Reichman University',
    type: 'University',
    location: 'Herzliya',
    logoUrl: 'https://csii.chula.ac.th/wp-content/uploads/2024/12/Reichman-University.png',
    websiteUrl: 'https://www.runi.ac.il',
    description: 'A private university known for its international outlook, entrepreneurship focus, and strong programs in law, business, communications, computer science, and government.'
  },
  {
    universityId: 11,
    name: 'University of Kiryat Shmona in the Galilee',
    type: 'University',
    location: 'Kiryat Shmona',
    logoUrl: 'https://www.telhai.ac.il/sites/default/files/2024-11/%D7%90%D7%95%D7%A0%D7%99%D7%91%D7%A8%D7%A1%D7%99%D7%98%D7%94%20%D7%91%D7%94%D7%A7%D7%9E%D7%94%20%D7%A0%D7%91%D7%97%D7%A8_03.png',
    websiteUrl: 'https://www.telhai.ac.il',
    description: 'A northern Israeli university emerging from Tel-Hai Academic College, focused on strengthening higher education, research, and regional development in the Galilee.'
  },

  // Academic colleges
  {
    universityId: 12,
    name: 'The Academic Center of Law and Science',
    type: 'Academic College',
    location: 'Hod HaSharon',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0020_Law-and-Science_logo.png',
    websiteUrl: 'https://www.mishpat.ac.il',
    description: 'An academic college offering programs in law, business, health sciences, psychology, and related professional fields.'
  },
  {
    universityId: 13,
    name: 'The Academic College of Society and the Arts',
    type: 'Academic College',
    location: 'Netanya',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2017/02/Logos_0004_Society-and-the-Arts_logo.png',
    websiteUrl: 'https://www.asa.ac.il',
    description: 'An academic college focused on society, culture, arts, therapy, and interdisciplinary creative studies.'
  },
  {
    universityId: 14,
    name: 'The Academic College of Tel-Aviv–Yaffo',
    type: 'Academic College',
    location: 'Tel Aviv–Yafo',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0004_Tel-Aviv-%E2%80%93-Yaffo-logo.png',
    websiteUrl: 'https://www.mta.ac.il',
    description: 'A public academic college offering practical, research-oriented programs in computer science, psychology, economics, management, and health sciences.'
  },
  {
    universityId: 15,
    name: 'Achva Academic College',
    type: 'Academic College',
    location: 'Shikmim',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0023_Achva_logo.png',
    websiteUrl: 'https://www.achva.ac.il',
    description: 'A southern Israeli academic college offering undergraduate and graduate programs in education, sciences, humanities, and social sciences.'
  },
  {
    universityId: 16,
    name: 'Afeka Tel Aviv Academic College of Engineering',
    type: 'Academic College',
    location: 'Tel Aviv',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0022_afeka-logo.png',
    websiteUrl: 'https://www.afeka.ac.il',
    description: 'An engineering college known for practical technology education, applied research, and strong links to Israel’s high-tech sector.'
  },
  {
    universityId: 17,
    name: 'Ashkelon Academic College',
    type: 'Academic College',
    location: 'Ashkelon',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0032_Ashkelon_logo.png',
    websiteUrl: 'https://www.aac.ac.il',
    description: 'A regional academic college offering degree programs in social sciences, economics, social work, health sciences, and criminology.'
  },
  {
    universityId: 18,
    name: 'Azrieli College of Engineering Jerusalem',
    type: 'Academic College',
    location: 'Jerusalem',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0031_Azrieli_logo.png',
    websiteUrl: 'https://www.jce.ac.il',
    description: 'An engineering college in Jerusalem offering industry-focused programs in software, electronics, materials, mechanical, and pharmaceutical engineering.'
  },
  {
    universityId: 19,
    name: 'Bezalel Academy of Arts and Design',
    type: 'Academic College',
    location: 'Jerusalem',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0020_bezalel-logo.png',
    websiteUrl: 'https://www.bezalel.ac.il',
    description: 'Israel’s leading academy for art, design, and architecture, known for creative innovation and visual culture.'
  },
  {
    universityId: 20,
    name: 'College of Law & Business',
    type: 'Academic College',
    location: 'Ramat Gan',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0012_Law-Business_logo.png',
    websiteUrl: 'https://www.clb.ac.il',
    description: 'An academic college focused on law, business, accounting, computer science, and interdisciplinary professional education.'
  },
  {
    universityId: 21,
    name: 'The College of Management Academic Studies',
    type: 'Academic College',
    location: 'Rishon LeZion',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2017/02/Logos_0002_The-College-of-Management_logo.png',
    websiteUrl: 'https://www.colman.ac.il',
    description: 'A large academic college offering programs in business, law, media, computer science, psychology, economics, and design.'
  },
  {
    universityId: 22,
    name: 'Hadassah Academic College',
    type: 'Academic College',
    location: 'Jerusalem',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2024/01/HAC-logo166-102-01.png',
    websiteUrl: 'https://www.hac.ac.il',
    description: 'A Jerusalem college offering programs in health sciences, computer science, communication, design, management, and life sciences.'
  },
  {
    universityId: 23,
    name: 'Holon Institute of Technology',
    type: 'Academic College',
    location: 'Holon',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0018_logo-hit.png',
    websiteUrl: 'https://www.hit.ac.il',
    description: 'A technology-focused academic institute offering programs in engineering, sciences, design, digital technologies, and instructional technologies.'
  },
  {
    universityId: 24,
    name: 'The Israel Academic College in Ramat Gan',
    type: 'Academic College',
    location: 'Ramat Gan',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2017/02/Logos_0011_Ramat-Gan_logo.png',
    websiteUrl: 'https://iac.ac.il',
    description: 'An academic college offering programs in health administration, management, information systems, and related professional fields.'
  },
  {
    universityId: 25,
    name: 'Jerusalem Academy of Music and Dance',
    type: 'Academic College',
    location: 'Jerusalem',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2017/02/Logos_0023_jerusalem-academy-of-music-and-dance-logo.png',
    websiteUrl: 'https://www.jamd.ac.il',
    description: 'A leading academy for music, dance, composition, performance, and arts education.'
  },
  {
    universityId: 26,
    name: 'Jerusalem College of Technology',
    type: 'Academic College',
    location: 'Jerusalem',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0019_Lev_logo.png',
    websiteUrl: 'https://www.jct.ac.il',
    description: 'An academic institution combining technology, engineering, computer science, health sciences, and Jewish studies.'
  },
  {
    universityId: 27,
    name: 'Kinneret Academic College in the Jordan Valley',
    type: 'Academic College',
    location: 'Jordan Valley',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Kinneret_logo_eng.png',
    websiteUrl: 'https://www.kinneret.ac.il',
    description: 'A regional academic college near the Sea of Galilee offering programs in engineering, social sciences, humanities, and regional studies.'
  },
  {
    universityId: 28,
    name: 'Max Stern Academic College of Emek Yezreel',
    type: 'Academic College',
    location: 'Emek Yezreel',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0018_Emek-Yizrael_logo.png',
    websiteUrl: 'https://www.yvc.ac.il',
    description: 'A northern academic college offering degree programs in social sciences, health sciences, communication, economics, education, and information systems.'
  },
  {
    universityId: 29,
    name: 'Netanya Academic College',
    type: 'Academic College',
    location: 'Netanya',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0008_Netanya_logo.png',
    websiteUrl: 'https://www.netanya.ac.il',
    description: 'An academic college offering programs in law, business, computer science, insurance, communication, behavioral sciences, and health fields.'
  },
  {
    universityId: 30,
    name: 'Ono Academic College',
    type: 'Academic College',
    location: 'Kiryat Ono',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0017_Ono_logo.png',
    websiteUrl: 'https://www.ono.ac.il',
    description: 'A large academic college offering programs in law, business, health professions, education, humanities, and social sciences.'
  },
  {
    universityId: 31,
    name: 'ORT Braude College of Engineering',
    type: 'Academic College',
    location: 'Karmiel',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0006_ORT-Braude_logo.png',
    websiteUrl: 'https://w3.braude.ac.il',
    description: 'An engineering college in the Galilee known for applied engineering education and industry collaboration.'
  },
  {
    universityId: 32,
    name: 'Peres Academic Center',
    type: 'Academic College',
    location: 'Rehovot',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2017/04/Logos_0012_Peres_logo.png',
    websiteUrl: 'https://www.pac.ac.il',
    description: 'An academic center offering programs in business, law, behavioral sciences, health administration, nutrition, and related fields.'
  },
  {
    universityId: 33,
    name: 'Ruppin Academic Center',
    type: 'Academic College',
    location: 'Emek Hefer',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0010_ruppin-logo.png',
    websiteUrl: 'https://www.ruppin.ac.il',
    description: 'An academic center offering programs in marine sciences, engineering, economics, management, social sciences, and community studies.'
  },
  {
    universityId: 34,
    name: 'Sami Shamoon College of Engineering',
    type: 'Academic College',
    location: 'Beer-Sheva and Ashdod',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0008_Sami-Shamoon-College_logo.png',
    websiteUrl: 'https://www.sce.ac.il',
    description: 'An engineering college with campuses in Beer-Sheva and Ashdod, focused on applied engineering, technology, and innovation.'
  },
  {
    universityId: 35,
    name: 'Sapir Academic College',
    type: 'Academic College',
    location: 'Sha’ar HaNegev',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0007_Sapir_logo.png',
    websiteUrl: 'https://www.sapir.ac.il',
    description: 'A large public college near Sderot offering programs in communication, social sciences, management, law, culture, and the arts.'
  },
  {
    universityId: 36,
    name: 'Schechter Institute of Jewish Studies',
    type: 'Academic College',
    location: 'Jerusalem',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2017/02/download.png',
    websiteUrl: 'https://schechter.edu',
    description: 'An academic institute specializing in Jewish studies, education, Israel studies, and humanities-oriented graduate programs.'
  },
  {
    universityId: 37,
    name: 'Shalem College',
    type: 'Academic College',
    location: 'Jerusalem',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2017/04/Logos_0006_Shalem_logo.png',
    websiteUrl: 'https://shalem.ac.il',
    description: 'A liberal arts college in Jerusalem focused on humanities, philosophy, Jewish thought, Middle Eastern studies, and public leadership.'
  },
  {
    universityId: 38,
    name: 'Shenkar College of Engineering, Design and Art',
    type: 'Academic College',
    location: 'Ramat Gan',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0005_Shenkar_logo.png',
    websiteUrl: 'https://www.shenkar.ac.il',
    description: 'A leading college for design, art, engineering, and multidisciplinary creative technologies.'
  },
  {
    universityId: 39,
    name: 'Western Galilee College',
    type: 'Academic College',
    location: 'Acre',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/LOGO-WGC-NEW-01.png',
    websiteUrl: 'https://www.wgalil.ac.il',
    description: 'A northern academic college offering programs in education, management, social sciences, criminology, conservation, and regional studies.'
  },
  {
    universityId: 40,
    name: 'Zefat Academic College',
    type: 'Academic College',
    location: 'Safed',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0001_zefat-logo.png',
    websiteUrl: 'https://www.zefat.ac.il',
    description: 'A regional academic college in Safed offering programs in health sciences, law, social sciences, humanities, and community-focused fields.'
  },
  {
    universityId: 41,
    name: 'The Academic College at Wingate',
    type: 'Academic College',
    location: 'Wingate Institute',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2020/12/logo_Wingate_Israel.jpg',
    websiteUrl: 'https://www.wincol.ac.il',
    description: 'An academic college specializing in physical education, sports science, movement, coaching, and health-related fields.'
  },

  // Teacher-training colleges
  {
    universityId: 42,
    name: 'Al-Qasemi Academic College of Education',
    type: 'Teacher-Training College',
    location: 'Baqa al-Gharbiyye',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0034_Al-Qasemi_logo.png',
    websiteUrl: 'https://www.qsm.ac.il',
    description: 'A teacher-training college serving Arab society with programs in education, pedagogy, and related academic fields.'
  },
  {
    universityId: 43,
    name: 'The Arab Academic College of Education',
    type: 'Teacher-Training College',
    location: 'Haifa',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0000_The-Arab-Academic_logo.png',
    websiteUrl: 'https://www.arabcol.ac.il',
    description: 'An academic college for teacher education focused on training educators for Arab schools and communities.'
  },
  {
    universityId: 44,
    name: 'Beit Berl College',
    type: 'Teacher-Training College',
    location: 'Beit Berl',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/logo-beit-berl-166x102-2.jpg',
    websiteUrl: 'https://www.beitberl.ac.il',
    description: 'A major college of education, arts, and social studies known for teacher training and creative academic programs.'
  },
  {
    universityId: 45,
    name: 'The College of Sakhnin for Teacher Education',
    type: 'Teacher-Training College',
    location: 'Sakhnin',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0009_Sakhnin_logo.png',
    websiteUrl: 'https://www.sakhnin.ac.il',
    description: 'A teacher-training college preparing educators and professionals for schools and community institutions.'
  },
  {
    universityId: 46,
    name: 'David Yellin College of Education',
    type: 'Teacher-Training College',
    location: 'Jerusalem',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0028_David-Yellin_logo.png',
    websiteUrl: 'https://www.dyellin.ac.il',
    description: 'A long-established Jerusalem college specializing in teacher education, pedagogy, special education, and educational leadership.'
  },
  {
    universityId: 47,
    name: 'Emuna-Efrata Academic College of Education',
    type: 'Teacher-Training College',
    location: 'Jerusalem',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2020/12/%D7%90%D7%9E%D7%95%D7%A0%D7%94-%D7%90%D7%A4%D7%A8%D7%AA%D7%94.jpg',
    websiteUrl: 'https://www.emef.ac.il',
    description: 'A religious academic college of education formed from Emuna and Efrata, focused on teacher training, arts, and Jewish education.'
  },
  {
    universityId: 48,
    name: 'Givat Washington Academic College of Education',
    type: 'Teacher-Training College',
    location: 'Beit Raban',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0017_Givat-Washington_logo.png',
    websiteUrl: 'https://www.givat-washington.ac.il',
    description: 'A religious academic college offering teacher education and training programs in education, physical education, and related fields.'
  },
  {
    universityId: 49,
    name: 'Gordon College of Education',
    type: 'Teacher-Training College',
    location: 'Haifa',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0016_Gordon_logo.png',
    websiteUrl: 'https://www.gordon.ac.il',
    description: 'A Haifa-based college of education focused on teacher training, educational innovation, and advanced education studies.'
  },
  {
    universityId: 50,
    name: 'Hemdat HaDarom College',
    type: 'Teacher-Training College',
    location: 'Netivot',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0015_Hemdat-HaDarom_logo.png',
    websiteUrl: 'https://www.hemdat.ac.il',
    description: 'A religious college of education in southern Israel offering teacher-training programs and education degrees.'
  },
  {
    universityId: 51,
    name: 'Herzog College',
    type: 'Teacher-Training College',
    location: 'Alon Shvut',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2020/12/Herzog-English-Logo1.png',
    websiteUrl: 'https://www.herzog.ac.il',
    description: 'A religious academic college specializing in teacher education, Jewish studies, Bible, humanities, and educational leadership.'
  },
  {
    universityId: 52,
    name: 'Jerusalem College',
    type: 'Teacher-Training College',
    location: 'Jerusalem',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0022_Jerusalem-College_logo.png',
    websiteUrl: 'https://www.michlala.edu',
    description: 'A Jerusalem-based college of education focused on teacher training, Jewish studies, and academic preparation for educators.'
  },
  {
    universityId: 53,
    name: 'Kaye Academic College of Education',
    type: 'Teacher-Training College',
    location: 'Beer-Sheva',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Kaye_logo1.jpg',
    websiteUrl: 'https://www.kaye.ac.il',
    description: 'A southern college of education preparing teachers and educational leaders for diverse communities across the Negev.'
  },
  {
    universityId: 54,
    name: 'Kibbutzim College of Education, Technology and the Arts',
    type: 'Teacher-Training College',
    location: 'Tel Aviv',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0021_Kibbutzim_logo.png',
    websiteUrl: 'https://www.smkb.ac.il',
    description: 'A major college for education, arts, humanities, technology, and teacher training in Tel Aviv.'
  },
  {
    universityId: 55,
    name: 'Levinsky-Wingate Academic College',
    type: 'Teacher-Training College',
    location: 'Tel Aviv and Wingate',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0011_Levinsky_logo.png',
    websiteUrl: 'https://www.levinsky-wingate.ac.il',
    description: 'An academic college specializing in teacher education, music education, sports education, and movement studies.'
  },
  {
    universityId: 56,
    name: 'The Neri Bloomfield School of Design and Education',
    type: 'Teacher-Training College',
    location: 'Haifa',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0009_Neri-Bloomfield_logo.png',
    websiteUrl: 'https://www.wizodzn.ac.il',
    description: 'A design and education college focused on visual communication, fashion, architecture, art, and creative education.'
  },
  {
    universityId: 57,
    name: 'Ohalo Academic College of Education and Sport in Katzrin',
    type: 'Teacher-Training College',
    location: 'Katzrin',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0007_Ohalo_logo.png',
    websiteUrl: 'https://www.ohalo.ac.il',
    description: 'A college of education and sport in the Golan region focused on teacher training, physical education, and environmental education.'
  },
  {
    universityId: 58,
    name: 'Oranim Academic College of Education',
    type: 'Teacher-Training College',
    location: 'Kiryat Tivon',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0014_Oranim_logo.png',
    websiteUrl: 'https://www.oranim.ac.il',
    description: 'A leading college of education offering teacher training, graduate education programs, humanities, and social sciences.'
  },
  {
    universityId: 59,
    name: 'Orot Israel Academic College of Education',
    type: 'Teacher-Training College',
    location: 'Elkana and Rehovot',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0013_Orot-Israel_logo.png',
    websiteUrl: 'https://orot.ac.il',
    description: 'A religious academic college for teacher education with programs in education, Jewish studies, and pedagogy.'
  },
  {
    universityId: 60,
    name: 'Shaanan Academic Religious Teachers’ College',
    type: 'Teacher-Training College',
    location: 'Haifa',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0025_%E2%80%9CShaanan%E2%80%9D_logo.png',
    websiteUrl: 'https://www.shaanan.ac.il',
    description: 'A religious teacher-training college in Haifa offering programs in education, Jewish studies, and teaching certification.'
  },
  {
    universityId: 61,
    name: 'Talpiyot Academic College of Education',
    type: 'Teacher-Training College',
    location: 'Holon',
    logoUrl: 'https://studyisrael.org.il/wp-content/uploads/2016/11/Logos_0026_%D7%AA%D7%9C%D7%A4%D7%99%D7%95%D7%AA-%D7%9C%D7%95%D7%92%D7%95-2016.png',
    websiteUrl: 'https://www.talpiot.ac.il',
    description: 'A college of education offering teacher-training programs, educational studies, and professional development for educators.'
  }
];

let nextId = 62;

function getNextId() {
  return nextId++;
}

module.exports = { universities, getNextId };