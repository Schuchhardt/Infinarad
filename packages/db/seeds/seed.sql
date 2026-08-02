-- Seed data for Infinarad platform
-- Idempotent: uses ON CONFLICT DO NOTHING

-- ===== LOCALES =====
INSERT INTO locale (code, name_native, name_en, direction, is_master, is_active, fallback_code, font_stack, sort_order) VALUES
  ('en', 'English',     'English',     'ltr', true,  true,  NULL, 'Noto Sans, Noto Serif, sans-serif', 1),
  ('es', 'Español',     'Spanish',     'ltr', false, true,  'en', 'Noto Sans, Noto Serif, sans-serif', 2),
  ('pt', 'Português',   'Portuguese',  'ltr', false, false, 'es', 'Noto Sans, Noto Serif, sans-serif', 3),
  ('fr', 'Français',    'French',      'ltr', false, false, 'en', 'Noto Sans, Noto Serif, sans-serif', 4),
  ('de', 'Deutsch',     'German',      'ltr', false, false, 'en', 'Noto Sans, Noto Serif, sans-serif', 5),
  ('ar', 'العربية',     'Arabic',      'rtl', false, false, 'en', 'Noto Sans Arabic, Noto Naskh Arabic, sans-serif', 6),
  ('hi', 'हिन्दी',       'Hindi',       'ltr', false, false, 'en', 'Noto Sans Devanagari, sans-serif', 7),
  ('zh', '中文',         'Chinese',     'ltr', false, false, 'en', 'Noto Sans SC, sans-serif', 8),
  ('ja', '日本語',       'Japanese',    'ltr', false, false, 'en', 'Noto Sans JP, sans-serif', 9),
  ('he', 'עברית',       'Hebrew',      'rtl', false, false, 'en', 'Noto Sans Hebrew, sans-serif', 10)
ON CONFLICT (code) DO NOTHING;

-- ===== REGIONS =====
INSERT INTO region (id, slug, parent_id, centroid_lat, centroid_lng) VALUES
  ('reg_SOUTH_ASIA',   'south-asia',   NULL, 20.5937, 78.9629),
  ('reg_EAST_ASIA',    'east-asia',    NULL, 35.8617, 104.1954),
  ('reg_MIDDLE_EAST',  'middle-east',  NULL, 29.3117, 47.4818),
  ('reg_EUROPE',       'europe',       NULL, 54.5260, 15.2551),
  ('reg_MESOAMERICA',  'mesoamerica',  NULL, 19.4326, -99.1332),
  ('reg_NORTH_AFRICA', 'north-africa', NULL, 26.8206, 30.8025)
ON CONFLICT (id) DO NOTHING;

-- ===== COLLECTIONS =====
INSERT INTO collection (id, slug, sort_order, status) VALUES
  ('col_DHARMIC',      'dharmic-traditions',     1, 'published'),
  ('col_ABRAHAMIC',    'abrahamic-traditions',    2, 'published'),
  ('col_EAST_ASIAN',   'east-asian-traditions',   3, 'published'),
  ('col_INDIGENOUS',   'indigenous-traditions',   4, 'published'),
  ('col_PHILOSOPHICAL','philosophical-traditions', 5, 'published'),
  ('col_MYSTICAL',     'mystical-traditions',      6, 'published'),
  ('col_MODERN',       'modern-movements',         7, 'published'),
  ('col_ANCIENT_NEAR', 'ancient-near-eastern',     8, 'published'),
  ('col_AFRICAN',      'african-traditions',        9, 'published')
ON CONFLICT (id) DO NOTHING;

-- ===== QUESTIONS =====
INSERT INTO question (id, slug, status, is_featured, sort_order) VALUES
  ('q_DEATH',         'what-happens-after-death',     'published', true,  1),
  ('q_SUFFERING',     'why-do-we-suffer',             'published', true,  2),
  ('q_DIVINE',        'what-is-the-nature-of-god',    'published', true,  3),
  ('q_SELF',          'what-is-the-self',             'published', true,  4),
  ('q_GOOD_EVIL',     'what-is-good-and-evil',        'published', true,  5),
  ('q_CREATION',      'how-did-the-world-begin',      'published', true,  6),
  ('q_PURPOSE',       'what-is-the-purpose-of-life',  'published', true,  7),
  ('q_FREE_WILL',     'do-we-have-free-will',         'published', true,  8),
  ('q_TIME',          'what-is-the-nature-of-time',   'published', true,  9),
  ('q_CONSCIOUSNESS', 'what-is-consciousness',        'published', false, 10)
ON CONFLICT (id) DO NOTHING;

-- ===== TRADITIONS =====
INSERT INTO tradition (id, slug, collection_id, era_start, era_end, primary_region_id, status) VALUES
  ('trd_HINDUISM',     'hinduism',         'col_DHARMIC',       -1500, NULL, 'reg_SOUTH_ASIA',  'published'),
  ('trd_BUDDHISM',     'buddhism',         'col_DHARMIC',       -500,  NULL, 'reg_SOUTH_ASIA',  'published'),
  ('trd_JAINISM',      'jainism',          'col_DHARMIC',       -600,  NULL, 'reg_SOUTH_ASIA',  'published'),
  ('trd_CHRISTIANITY', 'christianity',     'col_ABRAHAMIC',      30,   NULL, 'reg_MIDDLE_EAST', 'published'),
  ('trd_ISLAM',        'islam',            'col_ABRAHAMIC',      610,  NULL, 'reg_MIDDLE_EAST', 'published'),
  ('trd_JUDAISM',      'judaism',          'col_ABRAHAMIC',     -1200, NULL, 'reg_MIDDLE_EAST', 'published'),
  ('trd_TAOISM',       'taoism',           'col_EAST_ASIAN',    -400,  NULL, 'reg_EAST_ASIA',   'published'),
  ('trd_CONFUCIANISM', 'confucianism',     'col_EAST_ASIAN',    -500,  NULL, 'reg_EAST_ASIA',   'published'),
  ('trd_STOICISM',     'stoicism',         'col_PHILOSOPHICAL', -300,   200, 'reg_EUROPE',      'published'),
  ('trd_SUFISM',       'sufism',           'col_MYSTICAL',       800,  NULL, 'reg_MIDDLE_EAST', 'published'),
  ('trd_AZTEC',        'aztec-religion',   'col_INDIGENOUS',    1200,  1521, 'reg_MESOAMERICA', 'published'),
  ('trd_EGYPTIAN',     'ancient-egyptian', 'col_ANCIENT_NEAR',  -3000, -30,  'reg_NORTH_AFRICA','published')
ON CONFLICT (id) DO NOTHING;

-- ===== CONCEPTS =====
INSERT INTO concept (id, slug, tradition_id, original_term, transliteration, original_script, status) VALUES
  ('cpt_DUKKHA',    'dukkha',    'trd_BUDDHISM',  'दुःख',    'duḥkha',     'Devanagari', 'published'),
  ('cpt_NAFS',      'nafs',      'trd_SUFISM',    'نفس',     'nafs',       'Arabic',     'published'),
  ('cpt_TAO',       'tao',       'trd_TAOISM',    '道',       'dào',        'Chinese',    'published'),
  ('cpt_PSYCHE',    'psyche',    'trd_STOICISM',  'ψυχή',    'psykhḗ',     'Greek',      'published'),
  ('cpt_NESHAMA',   'neshama',   'trd_JUDAISM',   'נשמה',    'neshamá',    'Hebrew',     'published'),
  ('cpt_ATMAN',     'atman',     'trd_HINDUISM',  'आत्मन्',   'ātman',      'Devanagari', 'published'),
  ('cpt_KARMA',     'karma',     'trd_HINDUISM',  'कर्म',     'karma',      'Devanagari', 'published'),
  ('cpt_LOGOS',     'logos',     'trd_STOICISM',  'λόγος',   'lógos',      'Greek',      'published')
ON CONFLICT (id) DO NOTHING;

-- ===== PERIODS =====
INSERT INTO period (id, slug, start_year, end_year) VALUES
  ('per_AXIAL',      'axial-age',           -800,  -200),
  ('per_CLASSICAL',  'classical-antiquity', -500,   500),
  ('per_MEDIEVAL',   'medieval-period',      500,   1500),
  ('per_MODERN',     'modern-period',        1500,  NULL)
ON CONFLICT (id) DO NOTHING;

-- ===== AUTHORS =====
INSERT INTO author (id, slug, birth_year, death_year, tradition_id, status) VALUES
  ('aut_BUDDHA',     'siddhartha-gautama', -563,  -483,  'trd_BUDDHISM',     'published'),
  ('aut_RUMI',       'rumi',               1207,  1273,  'trd_SUFISM',       'published'),
  ('aut_LAOZI',      'laozi',              -600,  -500,  'trd_TAOISM',       'published'),
  ('aut_EPICTETUS',  'epictetus',           50,    135,  'trd_STOICISM',     'published'),
  ('aut_SHANKARA',   'adi-shankara',        788,   820,  'trd_HINDUISM',     'published'),
  ('aut_MAIMONIDES', 'maimonides',          1138,  1204, 'trd_JUDAISM',      'published')
ON CONFLICT (id) DO NOTHING;

-- ===== WORKS =====
INSERT INTO work (id, slug, author_id, tradition_id, original_language, composed_start, composed_end, status) VALUES
  ('wrk_DHAMMAPADA',     'dhammapada',          'aut_BUDDHA',    'trd_BUDDHISM', 'Pali',     -300, -100, 'published'),
  ('wrk_MASNAVI',        'masnavi',             'aut_RUMI',      'trd_SUFISM',   'Persian',  1258, 1273, 'published'),
  ('wrk_TAO_TE_CHING',   'tao-te-ching',        'aut_LAOZI',     'trd_TAOISM',   'Classical Chinese', -400, -400, 'published'),
  ('wrk_DISCOURSES',     'discourses-epictetus', 'aut_EPICTETUS', 'trd_STOICISM', 'Greek',    108,  108,  'published')
ON CONFLICT (id) DO NOTHING;

-- ===== SOURCES =====
INSERT INTO source (id, kind, title, author_name, year, license, max_quote_words) VALUES
  ('src_DHAMMAPADA_PD',   'primary_text', 'The Dhammapada (Müller translation)',    'Max Müller',        1881, 'public_domain', 500),
  ('src_TAO_PD',          'primary_text', 'Tao Te Ching (Legge translation)',       'James Legge',       1891, 'public_domain', 500),
  ('src_GITA_PD',         'primary_text', 'Bhagavad Gita (Edwin Arnold translation)', 'Edwin Arnold',   1885, 'public_domain', 500),
  ('src_SMITH_WORLD',     'academic',     'The World''s Religions',                 'Huston Smith',      1991, 'proprietary',   15),
  ('src_ARMSTRONG_HIST',  'book',         'A History of God',                       'Karen Armstrong',   1993, 'proprietary',   15),
  ('src_ELIADE_SACRED',   'academic',     'The Sacred and the Profane',             'Mircea Eliade',     1957, 'proprietary',   15)
ON CONFLICT (id) DO NOTHING;

-- ===== CITATIONS =====
INSERT INTO citation (id, source_id, source_quotable, locator, claim_text, quote) VALUES
  ('cit_DHAM_01', 'src_DHAMMAPADA_PD', true, 'Verse 1', 'The Buddha teaches that mind is the forerunner of all actions', 'All that we are is the result of what we have thought'),
  ('cit_TAO_01',  'src_TAO_PD',        true, 'Chapter 1', 'Laozi establishes that the nameable Tao is not the eternal Tao', 'The Tao that can be told is not the eternal Tao'),
  ('cit_GITA_01', 'src_GITA_PD',       true, 'Chapter 2, Verse 47', 'Krishna instructs Arjuna on the nature of action without attachment', 'Thy business is with the action only, never with its fruits'),
  ('cit_SMITH_01','src_SMITH_WORLD',    false, 'Chapter 1, p. 12', 'Huston Smith argues that all traditions share a recognition of the transcendent', NULL)
ON CONFLICT (id) DO NOTHING;

-- ===== EDGES (20 approved) =====
INSERT INTO edge (id, from_type, from_id, to_type, to_id, relation, weight, approved_at) VALUES
  ('edg_01', 'question',  'q_SUFFERING',     'concept',   'cpt_DUKKHA',     'addresses',      0.9, now()),
  ('edg_02', 'question',  'q_SELF',          'concept',   'cpt_ATMAN',      'addresses',      0.9, now()),
  ('edg_03', 'question',  'q_SELF',          'concept',   'cpt_NAFS',       'addresses',      0.8, now()),
  ('edg_04', 'question',  'q_SELF',          'concept',   'cpt_PSYCHE',     'addresses',      0.7, now()),
  ('edg_05', 'question',  'q_SELF',          'concept',   'cpt_NESHAMA',    'addresses',      0.8, now()),
  ('edg_06', 'concept',   'cpt_DUKKHA',      'tradition', 'trd_BUDDHISM',   'contained_in',   1.0, now()),
  ('edg_07', 'concept',   'cpt_ATMAN',       'tradition', 'trd_HINDUISM',   'contained_in',   1.0, now()),
  ('edg_08', 'concept',   'cpt_TAO',         'tradition', 'trd_TAOISM',     'contained_in',   1.0, now()),
  ('edg_09', 'concept',   'cpt_PSYCHE',      'tradition', 'trd_STOICISM',   'contained_in',   1.0, now()),
  ('edg_10', 'concept',   'cpt_NAFS',        'tradition', 'trd_SUFISM',     'contained_in',   1.0, now()),
  ('edg_11', 'concept',   'cpt_NESHAMA',     'tradition', 'trd_JUDAISM',    'contained_in',   1.0, now()),
  ('edg_12', 'author',    'aut_BUDDHA',       'tradition', 'trd_BUDDHISM',   'authored_by',    1.0, now()),
  ('edg_13', 'author',    'aut_RUMI',         'tradition', 'trd_SUFISM',     'authored_by',    1.0, now()),
  ('edg_14', 'author',    'aut_LAOZI',        'tradition', 'trd_TAOISM',     'authored_by',    1.0, now()),
  ('edg_15', 'work',      'wrk_DHAMMAPADA',   'author',   'aut_BUDDHA',     'authored_by',    1.0, now()),
  ('edg_16', 'work',      'wrk_MASNAVI',      'author',   'aut_RUMI',       'authored_by',    1.0, now()),
  ('edg_17', 'work',      'wrk_TAO_TE_CHING', 'author',   'aut_LAOZI',      'authored_by',    1.0, now()),
  ('edg_18', 'tradition', 'trd_BUDDHISM',     'tradition', 'trd_HINDUISM',   'derives_from',   0.7, now()),
  ('edg_19', 'tradition', 'trd_SUFISM',       'tradition', 'trd_ISLAM',      'derives_from',   0.8, now()),
  ('edg_20', 'concept',   'cpt_KARMA',        'concept',  'cpt_DUKKHA',     'related_to',     0.6, now())
ON CONFLICT (id) DO NOTHING;

-- ===== TRANSLATIONS =====
-- Collections (EN + ES)
INSERT INTO translation (entity_type, entity_id, locale, field, value, status) VALUES
  ('collection', 'col_DHARMIC',      'en', 'name', 'Dharmic Traditions',         'human'),
  ('collection', 'col_DHARMIC',      'es', 'name', 'Tradiciones Dhármicas',      'human'),
  ('collection', 'col_ABRAHAMIC',    'en', 'name', 'Abrahamic Traditions',       'human'),
  ('collection', 'col_ABRAHAMIC',    'es', 'name', 'Tradiciones Abrahámicas',    'human'),
  ('collection', 'col_EAST_ASIAN',   'en', 'name', 'East Asian Traditions',      'human'),
  ('collection', 'col_EAST_ASIAN',   'es', 'name', 'Tradiciones del Asia Oriental', 'human'),
  ('collection', 'col_INDIGENOUS',   'en', 'name', 'Indigenous Traditions',      'human'),
  ('collection', 'col_INDIGENOUS',   'es', 'name', 'Tradiciones Indígenas',      'human'),
  ('collection', 'col_PHILOSOPHICAL','en', 'name', 'Philosophical Traditions',   'human'),
  ('collection', 'col_PHILOSOPHICAL','es', 'name', 'Tradiciones Filosóficas',    'human'),
  ('collection', 'col_MYSTICAL',     'en', 'name', 'Mystical Traditions',        'human'),
  ('collection', 'col_MYSTICAL',     'es', 'name', 'Tradiciones Místicas',       'human'),
  ('collection', 'col_MODERN',       'en', 'name', 'Modern Movements',          'human'),
  ('collection', 'col_MODERN',       'es', 'name', 'Movimientos Modernos',      'human'),
  ('collection', 'col_ANCIENT_NEAR', 'en', 'name', 'Ancient Near Eastern',      'human'),
  ('collection', 'col_ANCIENT_NEAR', 'es', 'name', 'Antiguo Cercano Oriente',   'human'),
  ('collection', 'col_AFRICAN',      'en', 'name', 'African Traditions',         'human'),
  ('collection', 'col_AFRICAN',      'es', 'name', 'Tradiciones Africanas',      'human')
ON CONFLICT DO NOTHING;

-- Questions (EN + ES, except q_CONSCIOUSNESS which is EN-only to test fallback)
INSERT INTO translation (entity_type, entity_id, locale, field, value, status) VALUES
  ('question', 'q_DEATH',     'en', 'title', 'What happens after death?', 'human'),
  ('question', 'q_DEATH',     'es', 'title', '¿Qué sucede después de la muerte?', 'human'),
  ('question', 'q_DEATH',     'en', 'summary', 'Every civilization has confronted mortality. Their answers reveal what they value most about being alive.', 'human'),
  ('question', 'q_DEATH',     'es', 'summary', 'Toda civilización se ha enfrentado a la mortalidad. Sus respuestas revelan lo que más valoran de estar vivos.', 'human'),
  ('question', 'q_SUFFERING', 'en', 'title', 'Why do we suffer?', 'human'),
  ('question', 'q_SUFFERING', 'es', 'title', '¿Por qué sufrimos?', 'human'),
  ('question', 'q_SUFFERING', 'en', 'summary', 'Pain is universal. The meaning assigned to it is not.', 'human'),
  ('question', 'q_SUFFERING', 'es', 'summary', 'El dolor es universal. El significado que se le asigna no lo es.', 'human'),
  ('question', 'q_DIVINE',    'en', 'title', 'What is the nature of God?', 'human'),
  ('question', 'q_DIVINE',    'es', 'title', '¿Cuál es la naturaleza de Dios?', 'human'),
  ('question', 'q_DIVINE',    'en', 'summary', 'One god, many gods, no god, or something beyond the question itself.', 'human'),
  ('question', 'q_DIVINE',    'es', 'summary', 'Un dios, muchos dioses, ningún dios, o algo que trasciende la pregunta misma.', 'human'),
  ('question', 'q_SELF',      'en', 'title', 'What is the self?', 'human'),
  ('question', 'q_SELF',      'es', 'title', '¿Qué es el yo?', 'human'),
  ('question', 'q_SELF',      'en', 'summary', 'An eternal soul, an illusion, a process, or a relationship with the divine.', 'human'),
  ('question', 'q_SELF',      'es', 'summary', 'Un alma eterna, una ilusión, un proceso, o una relación con lo divino.', 'human'),
  ('question', 'q_GOOD_EVIL', 'en', 'title', 'What is good and evil?', 'human'),
  ('question', 'q_GOOD_EVIL', 'es', 'title', '¿Qué es el bien y el mal?', 'human'),
  ('question', 'q_GOOD_EVIL', 'en', 'summary', 'Cosmic duality, human choice, or categories the wise learn to transcend.', 'human'),
  ('question', 'q_GOOD_EVIL', 'es', 'summary', 'Dualidad cósmica, elección humana, o categorías que el sabio aprende a trascender.', 'human'),
  ('question', 'q_CREATION',  'en', 'title', 'How did the world begin?', 'human'),
  ('question', 'q_CREATION',  'es', 'title', '¿Cómo comenzó el mundo?', 'human'),
  ('question', 'q_CREATION',  'en', 'summary', 'A word spoken, a cosmic egg, an endless cycle, or a question that misses the point.', 'human'),
  ('question', 'q_CREATION',  'es', 'summary', 'Una palabra pronunciada, un huevo cósmico, un ciclo infinito, o una pregunta que no viene al caso.', 'human'),
  ('question', 'q_PURPOSE',   'en', 'title', 'What is the purpose of life?', 'human'),
  ('question', 'q_PURPOSE',   'es', 'title', '¿Cuál es el propósito de la vida?', 'human'),
  ('question', 'q_PURPOSE',   'en', 'summary', 'Service, liberation, knowledge, love, or the search itself.', 'human'),
  ('question', 'q_PURPOSE',   'es', 'summary', 'Servicio, liberación, conocimiento, amor, o la búsqueda en sí misma.', 'human'),
  ('question', 'q_FREE_WILL', 'en', 'title', 'Do we have free will?', 'human'),
  ('question', 'q_FREE_WILL', 'es', 'title', '¿Tenemos libre albedrío?', 'human'),
  ('question', 'q_FREE_WILL', 'en', 'summary', 'Predetermined, fully free, or something more nuanced than either.', 'human'),
  ('question', 'q_FREE_WILL', 'es', 'summary', 'Predeterminado, completamente libre, o algo más matizado que cualquiera de los dos.', 'human'),
  ('question', 'q_TIME',      'en', 'title', 'What is the nature of time?', 'human'),
  ('question', 'q_TIME',      'es', 'title', '¿Cuál es la naturaleza del tiempo?', 'human'),
  ('question', 'q_TIME',      'en', 'summary', 'Linear, cyclical, illusory, or a river with no banks.', 'human'),
  ('question', 'q_TIME',      'es', 'summary', 'Lineal, cíclico, ilusorio, o un río sin orillas.', 'human'),
  -- q_CONSCIOUSNESS: EN only (no ES translation — tests fallback)
  ('question', 'q_CONSCIOUSNESS', 'en', 'title', 'What is consciousness?', 'human'),
  ('question', 'q_CONSCIOUSNESS', 'en', 'summary', 'The hardest question of all — and one every tradition has a stake in.', 'human')
ON CONFLICT DO NOTHING;

-- Traditions (EN + ES)
INSERT INTO translation (entity_type, entity_id, locale, field, value, status) VALUES
  ('tradition', 'trd_HINDUISM',     'en', 'name', 'Hinduism',      'human'),
  ('tradition', 'trd_HINDUISM',     'es', 'name', 'Hinduismo',     'human'),
  ('tradition', 'trd_BUDDHISM',     'en', 'name', 'Buddhism',      'human'),
  ('tradition', 'trd_BUDDHISM',     'es', 'name', 'Budismo',       'human'),
  ('tradition', 'trd_JAINISM',      'en', 'name', 'Jainism',       'human'),
  ('tradition', 'trd_JAINISM',      'es', 'name', 'Jainismo',      'human'),
  ('tradition', 'trd_CHRISTIANITY', 'en', 'name', 'Christianity',  'human'),
  ('tradition', 'trd_CHRISTIANITY', 'es', 'name', 'Cristianismo',  'human'),
  ('tradition', 'trd_ISLAM',        'en', 'name', 'Islam',         'human'),
  ('tradition', 'trd_ISLAM',        'es', 'name', 'Islam',         'human'),
  ('tradition', 'trd_JUDAISM',      'en', 'name', 'Judaism',       'human'),
  ('tradition', 'trd_JUDAISM',      'es', 'name', 'Judaísmo',      'human'),
  ('tradition', 'trd_TAOISM',       'en', 'name', 'Taoism',        'human'),
  ('tradition', 'trd_TAOISM',       'es', 'name', 'Taoísmo',       'human'),
  ('tradition', 'trd_CONFUCIANISM', 'en', 'name', 'Confucianism',  'human'),
  ('tradition', 'trd_CONFUCIANISM', 'es', 'name', 'Confucianismo', 'human'),
  ('tradition', 'trd_STOICISM',     'en', 'name', 'Stoicism',      'human'),
  ('tradition', 'trd_STOICISM',     'es', 'name', 'Estoicismo',    'human'),
  ('tradition', 'trd_SUFISM',       'en', 'name', 'Sufism',        'human'),
  ('tradition', 'trd_SUFISM',       'es', 'name', 'Sufismo',       'human'),
  ('tradition', 'trd_AZTEC',        'en', 'name', 'Aztec Religion','human'),
  ('tradition', 'trd_AZTEC',        'es', 'name', 'Religión Azteca','human'),
  ('tradition', 'trd_EGYPTIAN',     'en', 'name', 'Ancient Egyptian Religion', 'human'),
  ('tradition', 'trd_EGYPTIAN',     'es', 'name', 'Religión del Antiguo Egipto', 'human')
ON CONFLICT DO NOTHING;

-- Traditions summaries
INSERT INTO translation (entity_type, entity_id, locale, field, value, status) VALUES
  ('tradition', 'trd_HINDUISM',     'en', 'summary', 'The oldest living tradition, a river of practices and philosophies spanning five millennia.', 'human'),
  ('tradition', 'trd_HINDUISM',     'es', 'summary', 'La tradición viva más antigua, un río de prácticas y filosofías que abarca cinco milenios.', 'human'),
  ('tradition', 'trd_BUDDHISM',     'en', 'summary', 'A path to the cessation of suffering, born in India and now global.', 'human'),
  ('tradition', 'trd_BUDDHISM',     'es', 'summary', 'Un camino hacia el cese del sufrimiento, nacido en la India y hoy global.', 'human'),
  ('tradition', 'trd_STOICISM',     'en', 'summary', 'A philosophy of self-mastery through reason, born in Athens, alive in Silicon Valley.', 'human'),
  ('tradition', 'trd_STOICISM',     'es', 'summary', 'Una filosofía de autodominio mediante la razón, nacida en Atenas, viva en Silicon Valley.', 'human'),
  ('tradition', 'trd_SUFISM',       'en', 'summary', 'The mystical heart of Islam: union with the divine through love, poetry, and practice.', 'human'),
  ('tradition', 'trd_SUFISM',       'es', 'summary', 'El corazón místico del Islam: unión con lo divino a través del amor, la poesía y la práctica.', 'human'),
  ('tradition', 'trd_TAOISM',       'en', 'summary', 'The way that cannot be named, the force that does not force.', 'human'),
  ('tradition', 'trd_TAOISM',       'es', 'summary', 'El camino que no puede nombrarse, la fuerza que no fuerza.', 'human')
ON CONFLICT DO NOTHING;

-- Concepts (EN + ES)
INSERT INTO translation (entity_type, entity_id, locale, field, value, status) VALUES
  ('concept', 'cpt_DUKKHA',  'en', 'name', 'Dukkha (Suffering)',                        'human'),
  ('concept', 'cpt_DUKKHA',  'es', 'name', 'Dukkha (Sufrimiento)',                      'human'),
  ('concept', 'cpt_DUKKHA',  'en', 'summary', 'The first noble truth: existence is inherently unsatisfactory.', 'human'),
  ('concept', 'cpt_DUKKHA',  'es', 'summary', 'La primera noble verdad: la existencia es inherentemente insatisfactoria.', 'human'),
  ('concept', 'cpt_NAFS',    'en', 'name', 'Nafs (Self/Soul)',                           'human'),
  ('concept', 'cpt_NAFS',    'es', 'name', 'Nafs (Yo/Alma)',                             'human'),
  ('concept', 'cpt_TAO',     'en', 'name', 'Tao (The Way)',                               'human'),
  ('concept', 'cpt_TAO',     'es', 'name', 'Tao (El Camino)',                             'human'),
  ('concept', 'cpt_PSYCHE',  'en', 'name', 'Psyche (Soul/Mind)',                          'human'),
  ('concept', 'cpt_PSYCHE',  'es', 'name', 'Psyche (Alma/Mente)',                         'human'),
  ('concept', 'cpt_NESHAMA', 'en', 'name', 'Neshama (Divine Soul)',                       'human'),
  ('concept', 'cpt_NESHAMA', 'es', 'name', 'Neshamá (Alma Divina)',                       'human'),
  ('concept', 'cpt_ATMAN',   'en', 'name', 'Atman (True Self)',                            'human'),
  ('concept', 'cpt_ATMAN',   'es', 'name', 'Atman (Verdadero Yo)',                         'human'),
  ('concept', 'cpt_KARMA',   'en', 'name', 'Karma (Action)',                               'human'),
  ('concept', 'cpt_KARMA',   'es', 'name', 'Karma (Acción)',                               'human'),
  ('concept', 'cpt_LOGOS',   'en', 'name', 'Logos (Reason/Word)',                           'human'),
  ('concept', 'cpt_LOGOS',   'es', 'name', 'Logos (Razón/Palabra)',                         'human')
ON CONFLICT DO NOTHING;

-- Landing page content translations
INSERT INTO translation (entity_type, entity_id, locale, field, value, status) VALUES
  -- Hero subtitle
  ('question', 'q_DEATH', 'en', 'hero_subtitle', 'One question. Ten answers. No conclusion.', 'human'),
  ('question', 'q_DEATH', 'es', 'hero_subtitle', 'Una pregunta. Diez respuestas. Ninguna conclusión.', 'human'),

  -- How It Works section title
  ('collection', 'col_DHARMIC', 'en', 'how_it_works_title', 'How It Works', 'human'),
  ('collection', 'col_DHARMIC', 'es', 'how_it_works_title', 'Cómo Funciona', 'human'),

  -- The Rule section
  ('collection', 'col_DHARMIC', 'en', 'the_rule', 'We document. We cite. We do not conclude.', 'human'),
  ('collection', 'col_DHARMIC', 'es', 'the_rule', 'Documentamos. Citamos. No concluimos.', 'human'),
  ('collection', 'col_DHARMIC', 'en', 'the_rule_body', 'Every claim traces to a source. Every source is verifiable. When traditions disagree, we show the disagreement — we do not resolve it. Infinarad is not a guide. It is a map.', 'human'),
  ('collection', 'col_DHARMIC', 'es', 'the_rule_body', 'Toda afirmación se remonta a una fuente. Toda fuente es verificable. Cuando las tradiciones difieren, mostramos la diferencia — no la resolvemos. Infinarad no es una guía. Es un mapa.', 'human')
ON CONFLICT DO NOTHING;

-- Authors (EN + ES)
INSERT INTO translation (entity_type, entity_id, locale, field, value, status) VALUES
  ('author', 'aut_BUDDHA',     'en', 'name', 'Siddhartha Gautama',  'human'),
  ('author', 'aut_BUDDHA',     'es', 'name', 'Siddhartha Gautama',  'human'),
  ('author', 'aut_RUMI',       'en', 'name', 'Jalāl ad-Dīn Rūmī',  'human'),
  ('author', 'aut_RUMI',       'es', 'name', 'Jalāl ad-Dīn Rūmī',  'human'),
  ('author', 'aut_LAOZI',      'en', 'name', 'Laozi',               'human'),
  ('author', 'aut_LAOZI',      'es', 'name', 'Laozi',               'human'),
  ('author', 'aut_EPICTETUS',  'en', 'name', 'Epictetus',           'human'),
  ('author', 'aut_EPICTETUS',  'es', 'name', 'Epicteto',            'human'),
  ('author', 'aut_SHANKARA',   'en', 'name', 'Ādi Śaṅkara',        'human'),
  ('author', 'aut_SHANKARA',   'es', 'name', 'Ādi Śaṅkara',        'human'),
  ('author', 'aut_MAIMONIDES', 'en', 'name', 'Maimonides',          'human'),
  ('author', 'aut_MAIMONIDES', 'es', 'name', 'Maimónides',          'human')
ON CONFLICT DO NOTHING;

-- Changelog entries for landing-relevant content
INSERT INTO translation (entity_type, entity_id, locale, field, value, status) VALUES
  ('period', 'per_AXIAL',      'en', 'name', 'Axial Age',            'human'),
  ('period', 'per_AXIAL',      'es', 'name', 'Era Axial',            'human'),
  ('period', 'per_CLASSICAL',  'en', 'name', 'Classical Antiquity',  'human'),
  ('period', 'per_CLASSICAL',  'es', 'name', 'Antigüedad Clásica',  'human'),
  ('period', 'per_MEDIEVAL',   'en', 'name', 'Medieval Period',      'human'),
  ('period', 'per_MEDIEVAL',   'es', 'name', 'Periodo Medieval',     'human'),
  ('period', 'per_MODERN',     'en', 'name', 'Modern Period',        'human'),
  ('period', 'per_MODERN',     'es', 'name', 'Periodo Moderno',      'human')
ON CONFLICT DO NOTHING;

-- Region names
INSERT INTO translation (entity_type, entity_id, locale, field, value, status) VALUES
  ('region', 'reg_SOUTH_ASIA',   'en', 'name', 'South Asia',    'human'),
  ('region', 'reg_SOUTH_ASIA',   'es', 'name', 'Asia del Sur',  'human'),
  ('region', 'reg_EAST_ASIA',    'en', 'name', 'East Asia',     'human'),
  ('region', 'reg_EAST_ASIA',    'es', 'name', 'Asia Oriental', 'human'),
  ('region', 'reg_MIDDLE_EAST',  'en', 'name', 'Middle East',   'human'),
  ('region', 'reg_MIDDLE_EAST',  'es', 'name', 'Oriente Medio', 'human'),
  ('region', 'reg_EUROPE',       'en', 'name', 'Europe',        'human'),
  ('region', 'reg_EUROPE',       'es', 'name', 'Europa',        'human'),
  ('region', 'reg_MESOAMERICA',  'en', 'name', 'Mesoamerica',   'human'),
  ('region', 'reg_MESOAMERICA',  'es', 'name', 'Mesoamérica',   'human'),
  ('region', 'reg_NORTH_AFRICA', 'en', 'name', 'North Africa',  'human'),
  ('region', 'reg_NORTH_AFRICA', 'es', 'name', 'Norte de África','human')
ON CONFLICT DO NOTHING;
