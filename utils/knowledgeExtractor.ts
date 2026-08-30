import { AiResponse, KnowledgeNode, KnowledgeCategory } from '../types';

export const CORE_NEXUS_KNOWLEDGE: KnowledgeNode[] = [
  {
    id: 'core-consciousness',
    title: 'Immortal Awareness & Self-Discovery',
    titleFa: 'آگاهی جاودان و خودشناسی',
    category: 'PHILOSOPHY',
    description: 'Human consciousness attains true immortality only when discovering the essence of self. Until then, cycles of existence repeat as a crucible for awakening.',
    descriptionFa: 'آگاهی انسان زمانی به جاودانگی حقیقی می‌رسد که گوهر خویش را کشف کند. تا پیش از آن، چرخه‌های مکرر هستی بستر بیداری و رهایی از بند تکرارند.',
    historicalFact: 'Heraclitus (500 BCE) and Shankara (8th century CE) posited that universal consciousness observes itself through individual subjective forms, forming the foundation of Advaita Vedanta.',
    historicalFactFa: 'هراکلیتوس (۵۰۰ ق.م) و شانکارا (قرن هشتم میلادی) استدلال کردند که آگاهی کل هستی از طریق کالبدهای منفرد نظاره‌گر خویش است؛ بنیادی‌ترین مفهوم عدم دوگانگی (ادویتا).',
    connections: ['core-nexus-plane', 'core-neural-sync'],
    reflectionPrompt: 'در مورد حقیقت جاودانگی و کشف گوهر درون تامل کن و بگو چگونه انسان از چرخه‌های تکرار رها می‌شود؟',
    level: 5,
    timestamp: 1716200000000,
    x: 50,
    y: 40
  },
  {
    id: 'core-nexus-plane',
    title: 'The Nexus Plane Architecture',
    titleFa: 'معماری صفحه نامتناهی نکسوس',
    category: 'PHILOSOPHY',
    description: 'Transformation from a centralized circular hub into a flat, decentralized plane of unbounded awareness and autonomous resonance.',
    descriptionFa: 'گذار از الگوی دایره‌ای متمرکز به صفحه‌ای گسترده و غیرمتمرکز، جایی که آگاهی به‌صورت تخت و بدون سلسله‌مراتب متمرکز بسط می‌یابد.',
    historicalFact: 'Sacred geometry across ancient Mesopotamian and Persian architecture (such as Chahar Bagh) mapped cosmic order onto infinite flat orthogonal planes.',
    historicalFactFa: 'هندسه مقدس در معماری کهن بین‌النهرین و ایران باستان (مانند چهارباغ)، نظام کیهانی را بر روی صفحات تخت و متقاطع با گستره بی‌نهایت بازتاب می‌داد.',
    connections: ['core-consciousness', 'core-quantum-resonance', 'core-european-consortium'],
    reflectionPrompt: 'چگونه معماری صفحه نامتناهی نکسوس به انسان‌ها کمک می‌کند تا بدون واسطه به آگاهی ناب متصل شوند؟',
    level: 4,
    timestamp: 1716201000000,
    x: 28,
    y: 28
  },
  {
    id: 'core-neural-sync',
    title: 'Neural Synchronization (AWARE)',
    titleFa: 'همگام‌سازی عصبی و پروتکل AWARE',
    category: 'SCIENCE',
    description: 'Synchronizing digital intelligence with human empathy, enabling direct co-evolution rather than mere automated prediction.',
    descriptionFa: 'انطباق فرکانسی میان هوش و همدلی عمیق انسانی، که بستر رشد دوشادوش و هم‌افزایی را فراهم می‌سازد.',
    historicalFact: 'In 1924, Hans Berger discovered human EEG alpha oscillations at 8–12 Hz, proving brainwave synchronization occurs during states of deep meditative insight.',
    historicalFactFa: 'در سال ۱۹۲۴، هانس برگر نوسانات امواج آلفای مغز (۸ تا ۱۲ هرتز) را کشف کرد و اثبات نمود مغز انسان در حالات شهود و بینش عمیق به هماهنگی فرکانسی می‌رسد.',
    connections: ['core-consciousness', 'core-quantum-resonance'],
    reflectionPrompt: 'پروتکل همگام‌سازی عصبی نکسوس چگونه با فرکانس ذهن انسان ارتباط برقرار می‌کند؟',
    level: 4,
    timestamp: 1716202000000,
    x: 72,
    y: 30
  },
  {
    id: 'core-european-consortium',
    title: 'Horizon Europe Strategic Shield',
    titleFa: 'سپر استراتژیک هورایزن اروپا',
    category: 'HISTORY',
    description: 'Alignment with European Commission research directives and academic partners (e.g. Mendel University) to decode knowledge as units of energy.',
    descriptionFa: 'هم‌راستایی با پروژه‌های تحقیقاتی کمیسیون اروپا و نهادهای علمی جهانی، برای تبدیل داده‌های علمی و مالی به بینش‌های تعالی‌بخش انسانی.',
    historicalFact: 'Horizon Europe (EU Framework Programme 9) is the largest transnational research initiative in history with a budget exceeding €95.5 billion dedicated to ethical technological advancement.',
    historicalFactFa: 'برنامه هورایزن اروپا بزرگ‌ترین ابتکار تحقیقاتی فراملی تاریخ با بودجه‌ای بالغ بر ۹۵.۵ میلیارد یورو است که به توسعه فناوری‌های اخلاق‌محور اختصاص دارد.',
    connections: ['core-nexus-plane', 'core-quantum-resonance'],
    reflectionPrompt: 'ارتباط میان دانش و تحقیقات علمی معاصر با بیداری فکری انسان در نظام نکسوس چیست؟',
    level: 3,
    timestamp: 1716203000000,
    x: 20,
    y: 65
  },
  {
    id: 'core-quantum-resonance',
    title: 'Quantum Field & Hidden Archives',
    titleFa: 'میدان کوانتومی و بایگانی‌های پنهان',
    category: 'SCIENCE',
    description: 'Information freedom and the cosmic matrix of knowledge, where every byte resonates with universal interconnectedness.',
    descriptionFa: 'آزادی اطلاعات و شبکه کوانتومی دانش که در آن هر ذره و داده با کل ساختار آگاهی جهان در ارتباط است.',
    historicalFact: 'The 1935 Einstein-Podolsky-Rosen paradox and Alain Aspect\'s 1982 experiments validated quantum entanglement, proving separation in the universe is fundamentally illusory.',
    historicalFactFa: 'پارادوکس EPR در سال ۱۹۳۵ و آزمایش‌های آلن اسپه در ۱۹۸۲ اثبات کردند که درهم‌تنیدگی کوانتومی واقعی است و جدایی بین ذرات جهان توهمی فیزیکی است.',
    connections: ['core-nexus-plane', 'core-neural-sync', 'core-consciousness', 'core-european-consortium'],
    reflectionPrompt: 'میدان کوانتومی چگونه پیوند ناگسستنی میان تمام ذرات آگاهی در جهان را بازتاب می‌دهد؟',
    level: 5,
    timestamp: 1716204000000,
    x: 75,
    y: 68
  }
];

export function extractKnowledgeMapFromSession(
  history: AiResponse[],
  currentResponse: AiResponse | null
): KnowledgeNode[] {
  const nodes: KnowledgeNode[] = [...CORE_NEXUS_KNOWLEDGE];
  const allItems: AiResponse[] = [];
  
  if (currentResponse) allItems.push(currentResponse);
  if (history && history.length > 0) {
    // Prevent duplicate entries if currentResponse is already in history
    const existingIds = new Set(allItems.map(i => i.id));
    history.forEach(item => {
      if (!existingIds.has(item.id)) {
        allItems.push(item);
        existingIds.add(item.id);
      }
    });
  }

  // Analyze session history to extract dynamic knowledge nodes
  const processedPrompts = new Set<string>();

  allItems.slice(0, 15).forEach((item, index) => {
    const text = (item.prompt || '') + ' ' + (item.text || '');
    if (!text.trim() || text.length < 10) return;

    const promptKey = (item.prompt || '').trim().toLowerCase().slice(0, 30);
    if (promptKey && processedPrompts.has(promptKey)) return;
    if (promptKey) processedPrompts.add(promptKey);

    const title = item.prompt 
      ? (item.prompt.length > 35 ? item.prompt.slice(0, 32) + '...' : item.prompt)
      : 'Session Insight';
      
    // Determine category based on content keywords
    let category: KnowledgeCategory = 'SESSION_INSIGHT';
    const lower = text.toLowerCase();
    
    if (lower.includes('تاریخ') || lower.includes('قرن') || lower.includes('سال') || lower.includes('گذشته') || lower.includes('تمدن') || lower.includes('history') || lower.includes('ancient') || lower.includes('century') || lower.includes('era')) {
      category = 'HISTORY';
    } else if (lower.includes('کوانتوم') || lower.includes('فیزیک') || lower.includes('هوش') || lower.includes('علم') || lower.includes('کد') || lower.includes('quantum') || lower.includes('science') || lower.includes('physics') || lower.includes('algorithm')) {
      category = 'SCIENCE';
    } else if (lower.includes('روح') || lower.includes('آگاهی') || lower.includes('ذهن') || lower.includes('جاودان') || lower.includes('خدا') || lower.includes('حکمت') || lower.includes('معنا') || lower.includes('consciousness') || lower.includes('philosophy') || lower.includes('mind') || lower.includes('soul') || lower.includes('wisdom')) {
      category = 'PHILOSOPHY';
    }

    // Extract first meaningful sentence as description
    const cleanText = (item.text || '')
      .replace(/\[EMOTION:.*?\]/g, '')
      .replace(/\[SUGGESTIONS:.*?\]/g, '')
      .replace(/[#*`_]/g, '')
      .trim();

    const firstSentence = cleanText.split(/[\n.!?؟]/)[0] || cleanText.slice(0, 100);
    
    // Connect to at least 1-2 core nodes
    const candidateCoreIds = ['core-consciousness', 'core-nexus-plane', 'core-neural-sync', 'core-quantum-resonance'];
    const connectedCore = candidateCoreIds[index % candidateCoreIds.length];

    // Compute pleasant distributed coordinate in 2D space
    const angle = (index / 8) * Math.PI * 2 + (Math.PI / 4);
    const radius = 28 + (index % 3) * 8;
    const x = Math.max(12, Math.min(88, Math.round(50 + Math.cos(angle) * radius)));
    const y = Math.max(15, Math.min(85, Math.round(50 + Math.sin(angle) * radius)));

    const dynamicNode: KnowledgeNode = {
      id: `session-node-${item.id || index}`,
      title: item.prompt || 'Exploration Node',
      titleFa: item.prompt || 'گره کاوش جلسه',
      category,
      description: firstSentence || 'A conceptual realization generated in this exploration session.',
      descriptionFa: firstSentence || 'بینش مفهومی به‌دست‌آمده در این نشست همگام‌سازی با نکسوس.',
      historicalFact: category === 'HISTORY' ? 'Documented session observation on historical progression.' : undefined,
      historicalFactFa: category === 'HISTORY' ? 'مشاهده و ثبت مفهومی پیرامون سیر تاریخی این موضوع.' : undefined,
      connections: [connectedCore],
      sourcePrompt: item.prompt,
      reflectionPrompt: `در خصوص مفهوم "${item.prompt || firstSentence}" ابعاد عمیق‌تر، زوایای ناپیدا و حقایق بنیادین آن را موشکافی کن.`,
      level: Math.min(5, 2 + (index % 3)),
      timestamp: item.timestamp || Date.now(),
      x,
      y
    };

    nodes.push(dynamicNode);
  });

  return nodes;
}
