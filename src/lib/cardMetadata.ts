export type CardBrandKey = "visa" | "mastercard" | "mada" | "amex" | "unionpay" | "unknown";

export type CardMetadata = {
  bankName: string;
  brandKey: CardBrandKey;
  brandLabel: string;
  classificationLabel: string;
  isDetected: boolean;
};

type IssuerRule = {
  bankName: string;
  brandKey: Exclude<CardBrandKey, "unknown">;
  classificationLabel: string;
  prefix: string;
};

// Bank name mapping (Arabic)
const BANK = {
  RAJHI: "مصرف الراجحي",
  SNB: "البنك الأهلي السعودي",
  RIYAD: "بنك الرياض",
  INMA: "مصرف الإنماء",
  JAZIRA: "بنك الجزيرة",
  SAB: "بنك ساب",
  BILAD: "بنك البلاد",
  SAIB: "البنك السعودي للاستثمار",
  ANB: "البنك العربي الوطني",
  SAMBA: "مجموعة سامبا المالية",
  ENBD: "بنك الإمارات دبي الوطني",
  BSF: "البنك السعودي الفرنسي",
  GIB: "بنك الخليج الدولي",
  FAB: "بنك الأول",
  STC: "STC Pay",
  SOCIAL: "بنك التنمية الاجتماعية",
  AWAL: "بنك الأول (الأول)",
  MEEM: "بنك ميم",
  HOLLANDI: "البنك السعودي الهولندي",
  NBK: "بنك الكويت الوطني",
  MUSCAT: "بنك مسقط",
  ASAL: "أمريكان إكسبريس السعودية",
  BARRAQ: "شركة براق المالية",
} as const;

// Classification labels
const CL = {
  MADA: "خصم مباشر",
  CREDIT: "ائتمانية",
  PREPAID: "مسبقة الدفع",
  PLATINUM: "بلاتينية",
  GOLD: "ذهبية",
  SIGNATURE: "سيغنتشر",
  INFINITE: "إنفينيت",
  CLASSIC: "كلاسيكية",
  TITANIUM: "تيتانيوم",
  WORLD: "وورلد",
  WORLD_ELITE: "وورلد إيليت",
  WORLD_BLACK: "وورلد بلاك",
  BUSINESS: "تجارية",
  CORPORATE: "شركات",
  REWARDS: "مكافآت",
  ELECTRON: "إلكترون",
  UHNW: "فائقة الخصوصية",
  EXECUTIVE: "تنفيذية",
  PURCHASING: "مشتريات",
} as const;

const issuerRules: IssuerRule[] = [
  // ============================================================
  // مصرف الراجحي - Al Rajhi Banking and Investment Corp.
  // ============================================================
  // مدى
  { prefix: "458393", bankName: BANK.RAJHI, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "462220", bankName: BANK.RAJHI, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "484783", bankName: BANK.RAJHI, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "409201", bankName: BANK.RAJHI, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "410621", bankName: BANK.RAJHI, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "458456", bankName: BANK.RAJHI, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "403024", bankName: BANK.RAJHI, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "455708", bankName: BANK.RAJHI, brandKey: "mada", classificationLabel: CL.MADA },
  // Visa
  { prefix: "419514", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "436321", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "416634", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "410248", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "410249", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.PREPAID },
  { prefix: "405433", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.PREPAID },
  { prefix: "409246", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.UHNW },
  { prefix: "414627", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "417321", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "417323", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "419461", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "426362", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "432159", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.INFINITE },
  { prefix: "445520", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.SIGNATURE },
  { prefix: "445521", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.SIGNATURE },
  { prefix: "445522", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.PREPAID },
  { prefix: "445826", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.PREPAID },
  { prefix: "445827", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.PREPAID },
  { prefix: "455739", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "455740", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "486653", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.PURCHASING },
  { prefix: "490980", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.ELECTRON },
  { prefix: "494329", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.BUSINESS },
  { prefix: "407620", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.BUSINESS },
  { prefix: "400861", bankName: BANK.RAJHI, brandKey: "visa", classificationLabel: CL.ELECTRON },
  // Mastercard
  
  { prefix: "512623", bankName: BANK.RAJHI, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "524126", bankName: BANK.RAJHI, brandKey: "mastercard", classificationLabel: CL.TITANIUM },
  { prefix: "524266", bankName: BANK.RAJHI, brandKey: "mastercard", classificationLabel: CL.TITANIUM },
  { prefix: "542894", bankName: BANK.RAJHI, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "545619", bankName: BANK.RAJHI, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "549963", bankName: BANK.RAJHI, brandKey: "mastercard", classificationLabel: CL.TITANIUM },
  { prefix: "549964", bankName: BANK.RAJHI, brandKey: "mastercard", classificationLabel: CL.TITANIUM },

  // ============================================================
  // البنك الأهلي السعودي - National Commercial Bank (SNB)
  // ============================================================
  // مدى
  { prefix: "440647", bankName: BANK.SNB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "440795", bankName: BANK.SNB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "445564", bankName: BANK.SNB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "446404", bankName: BANK.SNB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "457865", bankName: BANK.SNB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "457997", bankName: BANK.SNB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "489317", bankName: BANK.SNB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "489318", bankName: BANK.SNB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "524130", bankName: BANK.SNB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "529415", bankName: BANK.SNB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "535825", bankName: BANK.SNB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "543085", bankName: BANK.SNB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "549760", bankName: BANK.SNB, brandKey: "mada", classificationLabel: CL.MADA },
  // Visa
  { prefix: "400399", bankName: BANK.SNB, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "404116", bankName: BANK.SNB, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "412113", bankName: BANK.SNB, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "414026", bankName: BANK.SNB, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "417487", bankName: BANK.SNB, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "417490", bankName: BANK.SNB, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "422862", bankName: BANK.SNB, brandKey: "visa", classificationLabel: CL.GOLD },
  { prefix: "430258", bankName: BANK.SNB, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "430259", bankName: BANK.SNB, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "430260", bankName: BANK.SNB, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "430262", bankName: BANK.SNB, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "433347", bankName: BANK.SNB, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "483178", bankName: BANK.SNB, brandKey: "visa", classificationLabel: CL.UHNW },
  { prefix: "485005", bankName: BANK.SNB, brandKey: "visa", classificationLabel: CL.SIGNATURE },
  { prefix: "485042", bankName: BANK.SNB, brandKey: "visa", classificationLabel: CL.SIGNATURE },
  { prefix: "491797", bankName: BANK.SNB, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "492145", bankName: BANK.SNB, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "492146", bankName: BANK.SNB, brandKey: "visa", classificationLabel: CL.PLATINUM },
  // Mastercard
  { prefix: "512464", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.GOLD },
  { prefix: "517720", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "519310", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "519341", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.PLATINUM },
  { prefix: "521031", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.PLATINUM },
  { prefix: "523954", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.TITANIUM },
  { prefix: "523968", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.TITANIUM },
  { prefix: "523998", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.TITANIUM },
  { prefix: "524116", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.TITANIUM },
  { prefix: "524197", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.TITANIUM },
  { prefix: "524388", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.PLATINUM },
  { prefix: "525688", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "532166", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "532446", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.WORLD },
  { prefix: "532448", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.WORLD },
  { prefix: "533964", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.WORLD_ELITE },
  { prefix: "534186", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.GOLD },
  { prefix: "536369", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.GOLD },
  { prefix: "539034", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.GOLD },
  { prefix: "539035", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "540613", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.GOLD },
  { prefix: "541891", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "544217", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.GOLD },
  { prefix: "544744", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.PREPAID },
  { prefix: "545205", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.WORLD },
  { prefix: "546336", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.PREPAID },
  { prefix: "546631", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.WORLD },
  { prefix: "548255", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.GOLD },
  { prefix: "549699", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.PLATINUM },
  { prefix: "549954", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "552075", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.PLATINUM },
  { prefix: "552077", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.PLATINUM },
  { prefix: "518694", bankName: BANK.SNB, brandKey: "mastercard", classificationLabel: CL.PREPAID },

  // ============================================================
  // بنك الرياض - Riyad Bank
  // ============================================================
  // مدى
  { prefix: "968209", bankName: BANK.RIYAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "455647", bankName: BANK.RIYAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "456996", bankName: BANK.RIYAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "524514", bankName: BANK.RIYAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "529741", bankName: BANK.RIYAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "535989", bankName: BANK.RIYAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "536023", bankName: BANK.RIYAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "537767", bankName: BANK.RIYAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "520058", bankName: BANK.RIYAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "513213", bankName: BANK.RIYAD, brandKey: "mada", classificationLabel: CL.MADA },
  // Visa
  { prefix: "450046", bankName: BANK.RIYAD, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "450661", bankName: BANK.RIYAD, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "435240", bankName: BANK.RIYAD, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "433952", bankName: BANK.RIYAD, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "454683", bankName: BANK.RIYAD, brandKey: "visa", classificationLabel: CL.GOLD },
  { prefix: "454684", bankName: BANK.RIYAD, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "457927", bankName: BANK.RIYAD, brandKey: "visa", classificationLabel: CL.ELECTRON },
  { prefix: "448509", bankName: BANK.RIYAD, brandKey: "visa", classificationLabel: CL.PURCHASING },
  { prefix: "490917", bankName: BANK.RIYAD, brandKey: "visa", classificationLabel: CL.CREDIT },
  // Mastercard
  { prefix: "513213", bankName: BANK.RIYAD, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "532013", bankName: BANK.RIYAD, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "514932", bankName: BANK.RIYAD, brandKey: "mastercard", classificationLabel: CL.PLATINUM },
  { prefix: "517531", bankName: BANK.RIYAD, brandKey: "mastercard", classificationLabel: CL.TITANIUM },
  { prefix: "520089", bankName: BANK.RIYAD, brandKey: "mastercard", classificationLabel: CL.GOLD },
  { prefix: "520090", bankName: BANK.RIYAD, brandKey: "mastercard", classificationLabel: CL.CORPORATE },
  { prefix: "539859", bankName: BANK.RIYAD, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "541679", bankName: BANK.RIYAD, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "541802", bankName: BANK.RIYAD, brandKey: "mastercard", classificationLabel: CL.WORLD },
  { prefix: "541988", bankName: BANK.RIYAD, brandKey: "mastercard", classificationLabel: CL.GOLD },
  { prefix: "545855", bankName: BANK.RIYAD, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "548322", bankName: BANK.RIYAD, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "548323", bankName: BANK.RIYAD, brandKey: "mastercard", classificationLabel: CL.GOLD },

  // ============================================================
  // مصرف الإنماء - Alinma Bank
  // ============================================================
  // مدى
  { prefix: "42689700", bankName: BANK.INMA, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "636120", bankName: BANK.INMA, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "434107", bankName: BANK.INMA, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "428671", bankName: BANK.INMA, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "428672", bankName: BANK.INMA, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "428673", bankName: BANK.INMA, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "432328", bankName: BANK.INMA, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "446672", bankName: BANK.INMA, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "543357", bankName: BANK.INMA, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "412565", bankName: BANK.INMA, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "407395", bankName: BANK.INMA, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "407197", bankName: BANK.INMA, brandKey: "mada", classificationLabel: CL.MADA },
  // Visa
  { prefix: "440534", bankName: BANK.INMA, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "428678", bankName: BANK.INMA, brandKey: "visa", classificationLabel: CL.INFINITE },
  { prefix: "428679", bankName: BANK.INMA, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "432326", bankName: BANK.INMA, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "432327", bankName: BANK.INMA, brandKey: "visa", classificationLabel: CL.GOLD },
  { prefix: "446673", bankName: BANK.INMA, brandKey: "visa", classificationLabel: CL.SIGNATURE },
  { prefix: "458270", bankName: BANK.INMA, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "483432", bankName: BANK.INMA, brandKey: "visa", classificationLabel: CL.CLASSIC },
  // Mastercard
  { prefix: "542160", bankName: BANK.INMA, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "529157", bankName: BANK.INMA, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "529178", bankName: BANK.INMA, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "530481", bankName: BANK.INMA, brandKey: "mastercard", classificationLabel: CL.PLATINUM },
  { prefix: "547026", bankName: BANK.INMA, brandKey: "mastercard", classificationLabel: CL.GOLD },

  // ============================================================
  // بنك الجزيرة - Bank AlJazira
  // ============================================================
  // مدى
  { prefix: "489319", bankName: BANK.JAZIRA, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "504300", bankName: BANK.JAZIRA, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "968211", bankName: BANK.JAZIRA, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "440533", bankName: BANK.JAZIRA, brandKey: "mada", classificationLabel: CL.MADA },
  // Visa
  { prefix: "434886", bankName: BANK.JAZIRA, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "427015", bankName: BANK.JAZIRA, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "406487", bankName: BANK.JAZIRA, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "414090", bankName: BANK.JAZIRA, brandKey: "visa", classificationLabel: CL.GOLD },
  { prefix: "414841", bankName: BANK.JAZIRA, brandKey: "visa", classificationLabel: CL.UHNW },
  { prefix: "421051", bankName: BANK.JAZIRA, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "428374", bankName: BANK.JAZIRA, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "428375", bankName: BANK.JAZIRA, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "440532", bankName: BANK.JAZIRA, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "473825", bankName: BANK.JAZIRA, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "473826", bankName: BANK.JAZIRA, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "473827", bankName: BANK.JAZIRA, brandKey: "visa", classificationLabel: CL.INFINITE },
  { prefix: "473828", bankName: BANK.JAZIRA, brandKey: "visa", classificationLabel: CL.SIGNATURE },
  // Mastercard
  { prefix: "542024", bankName: BANK.JAZIRA, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "517532", bankName: BANK.JAZIRA, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "523041", bankName: BANK.JAZIRA, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "524236", bankName: BANK.JAZIRA, brandKey: "mastercard", classificationLabel: CL.TITANIUM },
  { prefix: "546924", bankName: BANK.JAZIRA, brandKey: "mastercard", classificationLabel: CL.WORLD_ELITE },
  { prefix: "550002", bankName: BANK.JAZIRA, brandKey: "mastercard", classificationLabel: CL.TITANIUM },

  // ============================================================
  // بنك ساب (البنك السعودي البريطاني) - Saudi British Bank (SABB)
  // ============================================================
  // مدى
  { prefix: "968208", bankName: BANK.SAB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "422817", bankName: BANK.SAB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "422818", bankName: BANK.SAB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "422819", bankName: BANK.SAB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "428331", bankName: BANK.SAB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "605141", bankName: BANK.SAB, brandKey: "mada", classificationLabel: CL.MADA },
  // Visa
  { prefix: "485740", bankName: BANK.SAB, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "402208", bankName: BANK.SAB, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "431202", bankName: BANK.SAB, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "456515", bankName: BANK.SAB, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "414478", bankName: BANK.SAB, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "427222", bankName: BANK.SAB, brandKey: "visa", classificationLabel: CL.SIGNATURE },
  { prefix: "433786", bankName: BANK.SAB, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "455058", bankName: BANK.SAB, brandKey: "visa", classificationLabel: CL.GOLD },
  { prefix: "455310", bankName: BANK.SAB, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "455340", bankName: BANK.SAB, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "455389", bankName: BANK.SAB, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "456891", bankName: BANK.SAB, brandKey: "visa", classificationLabel: CL.REWARDS },
  { prefix: "456893", bankName: BANK.SAB, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "490160", bankName: BANK.SAB, brandKey: "visa", classificationLabel: CL.GOLD },
  // Mastercard
  { prefix: "512060", bankName: BANK.SAB, brandKey: "mastercard", classificationLabel: CL.WORLD },
  { prefix: "540236", bankName: BANK.SAB, brandKey: "mastercard", classificationLabel: CL.TITANIUM },
  { prefix: "541653", bankName: BANK.SAB, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "543199", bankName: BANK.SAB, brandKey: "mastercard", classificationLabel: CL.TITANIUM },
  { prefix: "545297", bankName: BANK.SAB, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "545318", bankName: BANK.SAB, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "546755", bankName: BANK.SAB, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "546756", bankName: BANK.SAB, brandKey: "mastercard", classificationLabel: CL.GOLD },
  { prefix: "546757", bankName: BANK.SAB, brandKey: "mastercard", classificationLabel: CL.GOLD },
  { prefix: "547645", bankName: BANK.SAB, brandKey: "mastercard", classificationLabel: CL.EXECUTIVE },
  { prefix: "549799", bankName: BANK.SAB, brandKey: "mastercard", classificationLabel: CL.CREDIT },

  // ============================================================
  // البنك السعودي الفرنسي - Banque Saudi Fransi (BSF)
  // ============================================================
  // مدى
  { prefix: "421141", bankName: BANK.BSF, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "474491", bankName: BANK.BSF, brandKey: "mada", classificationLabel: CL.MADA },
  // Visa
  { prefix: "401812", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "401883", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.SIGNATURE },
  { prefix: "401884", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.INFINITE },
  { prefix: "401978", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.PREPAID },
  { prefix: "425871", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.INFINITE },
  { prefix: "428274", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "428275", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.REWARDS },
  { prefix: "437974", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "437975", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.INFINITE },
  { prefix: "437976", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.SIGNATURE },
  { prefix: "437977", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.SIGNATURE },
  { prefix: "437978", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.UHNW },
  { prefix: "437979", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.SIGNATURE },
  { prefix: "437980", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.SIGNATURE },
  { prefix: "444445", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.ELECTRON },
  { prefix: "450824", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.REWARDS },
  { prefix: "457998", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "459583", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.SIGNATURE },
  { prefix: "459588", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.INFINITE },
  { prefix: "459800", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "475558", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.SIGNATURE },
  { prefix: "473899", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "496655", bankName: BANK.BSF, brandKey: "visa", classificationLabel: CL.REWARDS },
  // Mastercard
  { prefix: "512691", bankName: BANK.BSF, brandKey: "mastercard", classificationLabel: CL.CORPORATE },
  { prefix: "512727", bankName: BANK.BSF, brandKey: "mastercard", classificationLabel: CL.WORLD_ELITE },
  { prefix: "517724", bankName: BANK.BSF, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "524148", bankName: BANK.BSF, brandKey: "mastercard", classificationLabel: CL.BUSINESS },
  { prefix: "542747", bankName: BANK.BSF, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "547042", bankName: BANK.BSF, brandKey: "mastercard", classificationLabel: CL.GOLD },
  { prefix: "552012", bankName: BANK.BSF, brandKey: "mastercard", classificationLabel: CL.PLATINUM },

  // ============================================================
  // بنك البلاد - Bank AlBilad
  // ============================================================
  // مدى
  { prefix: "588845", bankName: BANK.BILAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "588846", bankName: BANK.BILAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "588847", bankName: BANK.BILAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "588848", bankName: BANK.BILAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "468540", bankName: BANK.BILAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "468541", bankName: BANK.BILAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "468542", bankName: BANK.BILAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "468543", bankName: BANK.BILAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "468544", bankName: BANK.BILAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "417633", bankName: BANK.BILAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "446393", bankName: BANK.BILAD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "968201", bankName: BANK.BILAD, brandKey: "mada", classificationLabel: CL.MADA },
  // Visa
  { prefix: "457954", bankName: BANK.BILAD, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "424260", bankName: BANK.BILAD, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "424261", bankName: BANK.BILAD, brandKey: "visa", classificationLabel: CL.GOLD },
  { prefix: "424262", bankName: BANK.BILAD, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "428334", bankName: BANK.BILAD, brandKey: "visa", classificationLabel: CL.PREPAID },
  { prefix: "428335", bankName: BANK.BILAD, brandKey: "visa", classificationLabel: CL.PREPAID },
  { prefix: "433072", bankName: BANK.BILAD, brandKey: "visa", classificationLabel: CL.PREPAID },
  { prefix: "446392", bankName: BANK.BILAD, brandKey: "visa", classificationLabel: CL.SIGNATURE },
  { prefix: "457796", bankName: BANK.BILAD, brandKey: "visa", classificationLabel: CL.INFINITE },
  { prefix: "475078", bankName: BANK.BILAD, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "475100", bankName: BANK.BILAD, brandKey: "visa", classificationLabel: CL.BUSINESS },
  { prefix: "475109", bankName: BANK.BILAD, brandKey: "visa", classificationLabel: CL.PURCHASING },
  { prefix: "475153", bankName: BANK.BILAD, brandKey: "visa", classificationLabel: CL.BUSINESS },
  { prefix: "481206", bankName: BANK.BILAD, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "481207", bankName: BANK.BILAD, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "400795", bankName: BANK.BILAD, brandKey: "visa", classificationLabel: CL.BUSINESS },
  // Mastercard
  { prefix: "558563", bankName: BANK.BILAD, brandKey: "mastercard", classificationLabel: CL.CREDIT },

  // ============================================================
  // البنك السعودي للاستثمار - Saudi Investment Bank (SAIB)
  // ============================================================
  // مدى
  { prefix: "508160", bankName: BANK.SAIB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "483010", bankName: BANK.SAIB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "483011", bankName: BANK.SAIB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "483012", bankName: BANK.SAIB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "406136", bankName: BANK.SAIB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "589206", bankName: BANK.SAIB, brandKey: "mada", classificationLabel: CL.MADA },
  // Visa
  { prefix: "407215", bankName: BANK.SAIB, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "440629", bankName: BANK.SAIB, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "440630", bankName: BANK.SAIB, brandKey: "visa", classificationLabel: CL.ELECTRON },
  { prefix: "440631", bankName: BANK.SAIB, brandKey: "visa", classificationLabel: CL.GOLD },
  { prefix: "457840", bankName: BANK.SAIB, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "457841", bankName: BANK.SAIB, brandKey: "visa", classificationLabel: CL.REWARDS },
  { prefix: "457842", bankName: BANK.SAIB, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "457843", bankName: BANK.SAIB, brandKey: "visa", classificationLabel: CL.UHNW },
  { prefix: "469616", bankName: BANK.SAIB, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "476815", bankName: BANK.SAIB, brandKey: "visa", classificationLabel: CL.SIGNATURE },
  { prefix: "478295", bankName: BANK.SAIB, brandKey: "visa", classificationLabel: CL.PREPAID },
  { prefix: "478296", bankName: BANK.SAIB, brandKey: "visa", classificationLabel: CL.PREPAID },
  { prefix: "483009", bankName: BANK.SAIB, brandKey: "visa", classificationLabel: CL.CREDIT },
  // Mastercard
  { prefix: "543210", bankName: BANK.SAIB, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "524205", bankName: BANK.SAIB, brandKey: "mastercard", classificationLabel: CL.TITANIUM },
  { prefix: "529298", bankName: BANK.SAIB, brandKey: "mastercard", classificationLabel: CL.PLATINUM },
  { prefix: "542373", bankName: BANK.SAIB, brandKey: "mastercard", classificationLabel: CL.CREDIT },

  // ============================================================
  // البنك العربي الوطني - Arab National Bank (ANB)
  // ============================================================
  // مدى
  { prefix: "968210", bankName: BANK.ANB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "968203", bankName: BANK.ANB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "455036", bankName: BANK.ANB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "486094", bankName: BANK.ANB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "486095", bankName: BANK.ANB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "486096", bankName: BANK.ANB, brandKey: "mada", classificationLabel: CL.MADA },
  // Visa
  { prefix: "431957", bankName: BANK.ANB, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "400067", bankName: BANK.ANB, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "404949", bankName: BANK.ANB, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "420177", bankName: BANK.ANB, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "451111", bankName: BANK.ANB, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "455017", bankName: BANK.ANB, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "455035", bankName: BANK.ANB, brandKey: "visa", classificationLabel: CL.GOLD },
  { prefix: "455037", bankName: BANK.ANB, brandKey: "visa", classificationLabel: CL.REWARDS },
  { prefix: "466515", bankName: BANK.ANB, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "473258", bankName: BANK.ANB, brandKey: "visa", classificationLabel: CL.BUSINESS },
  { prefix: "491610", bankName: BANK.ANB, brandKey: "visa", classificationLabel: CL.CREDIT },
  // Mastercard
  { prefix: "521076", bankName: BANK.ANB, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "517918", bankName: BANK.ANB, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "520430", bankName: BANK.ANB, brandKey: "mastercard", classificationLabel: CL.TITANIUM },
  { prefix: "520431", bankName: BANK.ANB, brandKey: "mastercard", classificationLabel: CL.WORLD_BLACK },
  { prefix: "536813", bankName: BANK.ANB, brandKey: "mastercard", classificationLabel: CL.PLATINUM },
  { prefix: "542806", bankName: BANK.ANB, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "544017", bankName: BANK.ANB, brandKey: "mastercard", classificationLabel: CL.GOLD },
  { prefix: "549400", bankName: BANK.ANB, brandKey: "mastercard", classificationLabel: CL.CREDIT },

  // ============================================================
  // مجموعة سامبا المالية (اندمجت مع الأهلي) - Samba Financial Group
  // ============================================================
  // Visa
  { prefix: "402106", bankName: BANK.SAMBA, brandKey: "visa", classificationLabel: CL.BUSINESS },
  { prefix: "402112", bankName: BANK.SAMBA, brandKey: "visa", classificationLabel: CL.BUSINESS },
  { prefix: "433987", bankName: BANK.SAMBA, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "433988", bankName: BANK.SAMBA, brandKey: "visa", classificationLabel: CL.INFINITE },
  { prefix: "450766", bankName: BANK.SAMBA, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "454335", bankName: BANK.SAMBA, brandKey: "visa", classificationLabel: CL.SIGNATURE },
  { prefix: "454336", bankName: BANK.SAMBA, brandKey: "visa", classificationLabel: CL.GOLD },
  { prefix: "455020", bankName: BANK.SAMBA, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "459242", bankName: BANK.SAMBA, brandKey: "visa", classificationLabel: CL.UHNW },
  { prefix: "477983", bankName: BANK.SAMBA, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "496649", bankName: BANK.SAMBA, brandKey: "visa", classificationLabel: CL.PLATINUM },
  // Mastercard
  { prefix: "523970", bankName: BANK.SAMBA, brandKey: "mastercard", classificationLabel: CL.TITANIUM },
  { prefix: "528479", bankName: BANK.SAMBA, brandKey: "mastercard", classificationLabel: CL.PLATINUM },
  { prefix: "537799", bankName: BANK.SAMBA, brandKey: "mastercard", classificationLabel: CL.WORLD_ELITE },
  { prefix: "540000", bankName: BANK.SAMBA, brandKey: "mastercard", classificationLabel: CL.GOLD },
  { prefix: "540902", bankName: BANK.SAMBA, brandKey: "mastercard", classificationLabel: CL.PLATINUM },
  { prefix: "542805", bankName: BANK.SAMBA, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "543683", bankName: BANK.SAMBA, brandKey: "mastercard", classificationLabel: CL.TITANIUM },
  { prefix: "544229", bankName: BANK.SAMBA, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "544873", bankName: BANK.SAMBA, brandKey: "mastercard", classificationLabel: CL.TITANIUM },

  // ============================================================
  // بنك الإمارات دبي الوطني (السعودية) - Emirates NBD
  // ============================================================
  // مدى
  { prefix: "410685", bankName: BANK.ENBD, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "406996", bankName: BANK.ENBD, brandKey: "mada", classificationLabel: CL.MADA },
  // Visa
  { prefix: "431313", bankName: BANK.ENBD, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "410682", bankName: BANK.ENBD, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "410683", bankName: BANK.ENBD, brandKey: "visa", classificationLabel: CL.GOLD },
  { prefix: "410684", bankName: BANK.ENBD, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "458263", bankName: BANK.ENBD, brandKey: "visa", classificationLabel: CL.INFINITE },
  // Mastercard
  { prefix: "526590", bankName: BANK.ENBD, brandKey: "mastercard", classificationLabel: CL.CREDIT },

  // ============================================================
  // بنك الخليج الدولي - Gulf International Bank (GIB)
  // ============================================================
  // مدى
  { prefix: "419593", bankName: BANK.GIB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "439954", bankName: BANK.GIB, brandKey: "mada", classificationLabel: CL.MADA },
  // Visa
  { prefix: "403010", bankName: BANK.GIB, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "435949", bankName: BANK.GIB, brandKey: "visa", classificationLabel: CL.PLATINUM },
  // Mastercard
  { prefix: "521241", bankName: BANK.GIB, brandKey: "mastercard", classificationLabel: CL.CREDIT },

  // ============================================================
  // بنك الأول (First Abu Dhabi Bank - السعودية)
  // ============================================================
  // مدى
  { prefix: "530060", bankName: BANK.FAB, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "531196", bankName: BANK.FAB, brandKey: "mada", classificationLabel: CL.MADA },
  // Visa
  { prefix: "426095", bankName: BANK.FAB, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "435671", bankName: BANK.FAB, brandKey: "visa", classificationLabel: CL.PLATINUM },

  // ============================================================
  // البنك السعودي الهولندي (بنك الأول حالياً) - Saudi Hollandi Bank (Alawwal)
  // ============================================================
  // Visa
  { prefix: "406485", bankName: BANK.HOLLANDI, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "411166", bankName: BANK.HOLLANDI, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "411167", bankName: BANK.HOLLANDI, brandKey: "visa", classificationLabel: CL.GOLD },
  { prefix: "412518", bankName: BANK.HOLLANDI, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "416041", bankName: BANK.HOLLANDI, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "416042", bankName: BANK.HOLLANDI, brandKey: "visa", classificationLabel: CL.GOLD },
  { prefix: "427733", bankName: BANK.HOLLANDI, brandKey: "visa", classificationLabel: CL.GOLD },
  { prefix: "427739", bankName: BANK.HOLLANDI, brandKey: "visa", classificationLabel: CL.CLASSIC },
  { prefix: "454660", bankName: BANK.HOLLANDI, brandKey: "visa", classificationLabel: CL.PLATINUM },
  { prefix: "490745", bankName: BANK.HOLLANDI, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "493428", bankName: BANK.HOLLANDI, brandKey: "visa", classificationLabel: CL.ELECTRON },
  // Mastercard (Alawwal Bank)
  { prefix: "522139", bankName: BANK.HOLLANDI, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "524165", bankName: BANK.HOLLANDI, brandKey: "mastercard", classificationLabel: CL.TITANIUM },
  { prefix: "530843", bankName: BANK.HOLLANDI, brandKey: "mastercard", classificationLabel: CL.PLATINUM },
  { prefix: "533172", bankName: BANK.HOLLANDI, brandKey: "mastercard", classificationLabel: CL.CORPORATE },
  { prefix: "542008", bankName: BANK.HOLLANDI, brandKey: "mastercard", classificationLabel: CL.TITANIUM },
  { prefix: "543408", bankName: BANK.HOLLANDI, brandKey: "mastercard", classificationLabel: CL.PLATINUM },
  { prefix: "548349", bankName: BANK.HOLLANDI, brandKey: "mastercard", classificationLabel: CL.CREDIT },
  { prefix: "548350", bankName: BANK.HOLLANDI, brandKey: "mastercard", classificationLabel: CL.TITANIUM },
  { prefix: "548979", bankName: BANK.HOLLANDI, brandKey: "mastercard", classificationLabel: CL.CREDIT },

  // ============================================================
  // بنك ميم - Meem Bank
  // ============================================================
  { prefix: "439955", bankName: BANK.MEEM, brandKey: "visa", classificationLabel: CL.PLATINUM },

  // ============================================================
  // STC Pay
  // ============================================================
  { prefix: "636180", bankName: BANK.STC, brandKey: "mada", classificationLabel: CL.PREPAID },
  { prefix: "539931", bankName: BANK.STC, brandKey: "mastercard", classificationLabel: CL.PREPAID },
  { prefix: "420132", bankName: BANK.STC, brandKey: "mada", classificationLabel: CL.PREPAID },

  // ============================================================
  // بنك التنمية الاجتماعية
  // ============================================================

  // ============================================================
  // شركة براق المالية - Barraq Finance
  // ============================================================
  { prefix: "454887", bankName: BANK.BARRAQ, brandKey: "visa", classificationLabel: CL.CREDIT },

  // ============================================================
  // بنك الكويت الوطني (السعودية) - NBK
  // ============================================================
  { prefix: "431361", bankName: BANK.NBK, brandKey: "mada", classificationLabel: CL.MADA },
  { prefix: "418763", bankName: BANK.NBK, brandKey: "visa", classificationLabel: CL.PLATINUM },

  // ============================================================
  // بنك مسقط (السعودية) - BankMuscat
  // ============================================================
  { prefix: "443925", bankName: BANK.MUSCAT, brandKey: "visa", classificationLabel: CL.CREDIT },
  { prefix: "443927", bankName: BANK.MUSCAT, brandKey: "visa", classificationLabel: CL.ELECTRON },

  // ============================================================
  // أمريكان إكسبريس السعودية - AMEX Saudi Arabia (ASAL)
  // ============================================================
  { prefix: "376655", bankName: BANK.ASAL, brandKey: "amex", classificationLabel: CL.CREDIT },
  { prefix: "376656", bankName: BANK.ASAL, brandKey: "amex", classificationLabel: CL.CORPORATE },
  { prefix: "374311", bankName: BANK.ASAL, brandKey: "amex", classificationLabel: CL.CORPORATE },
  { prefix: "374312", bankName: BANK.ASAL, brandKey: "amex", classificationLabel: CL.CORPORATE },
  { prefix: "376555", bankName: BANK.ASAL, brandKey: "amex", classificationLabel: CL.CREDIT },
  { prefix: "376556", bankName: BANK.ASAL, brandKey: "amex", classificationLabel: CL.CREDIT },
];

// Complete mada BIN prefixes list (from Checkout.com + BINTable)
const madaPrefixes = [
  // Visa-based mada
  "440647", "440795", "445564", "446404", "457865", "457997",
  "458393", "462220", "484783", "409201", "410621", "458456",
  "403024", "455708", "489317", "489318", "489319",
  "468540", "468541", "468542", "468543", "468544",
  "455647", "456996", "455036",
  "504300", "508160",
  "434107", "428671", "428672", "428673", "432328", "446672",
  "412565", "407395", "407197",
  "422817", "422818", "422819", "428331",
  "421141", "474491",
  "419593", "439954",
  "483010", "483011", "483012",
  "486094", "486095", "486096",
  "410685", "406996", "420132",
  "431361",
  "400861", "417633", "446393",
  // Mastercard-based mada
  "524130", "529415", "535825", "543085", "549760",
  "543357", "513213", "520058", "521076",
  "524514", "529741", "535989", "536023", "537767",
  "530060", "531196", "530906", "531095", "532013",
  "605141", "604906", "589206",
  // Local scheme mada
  "636120", "636180",
  "968201", "968202", "968203", "968205", "968206",
  "968207", "968208", "968209", "968210", "968211",
  "588845", "588846", "588847", "588848", "588849", "588850",
  // 8-digit mada
  "42689700",
];

const brandLabels: Record<CardBrandKey, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  mada: "مدى",
  amex: "American Express",
  unionpay: "UnionPay",
  unknown: "غير معروف",
};

const getBrandKey = (digits: string): CardBrandKey => {
  if (!digits) return "unknown";

  if (madaPrefixes.some((prefix) => digits.startsWith(prefix))) {
    return "mada";
  }

  // American Express: starts with 34 or 37
  if (/^3[47]/.test(digits)) {
    return "amex";
  }

  if (/^4/.test(digits)) {
    return "visa";
  }

  const firstTwo = Number(digits.slice(0, 2));
  const firstFour = Number(digits.slice(0, 4));

  if ((firstTwo >= 51 && firstTwo <= 55) || (firstFour >= 2221 && firstFour <= 2720)) {
    return "mastercard";
  }

  // UnionPay: starts with 62
  if (/^62/.test(digits)) {
    return "unionpay";
  }

  return "unknown";
};

export const getCardMetadata = (cardNumber: string): CardMetadata => {
  const digits = cardNumber.replace(/\D/g, "");

  if (!digits) {
    return {
      bankName: "سيظهر بعد إدخال رقم البطاقة",
      brandKey: "unknown",
      brandLabel: brandLabels.unknown,
      classificationLabel: "—",
      isDetected: false,
    };
  }

  // Match longest prefix first (8 digits before 6 digits)
  const matchedRule = issuerRules
    .filter((rule) => digits.startsWith(rule.prefix))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];

  if (matchedRule) {
    return {
      bankName: matchedRule.bankName,
      brandKey: matchedRule.brandKey,
      brandLabel: brandLabels[matchedRule.brandKey],
      classificationLabel: matchedRule.classificationLabel,
      isDetected: true,
    };
  }

  const brandKey = getBrandKey(digits);
  const hasBin = digits.length >= 6;

  return {
    bankName: hasBin ? "البنك المصدر غير محدد" : "أدخل أول 6 أرقام لإظهار البنك",
    brandKey,
    brandLabel: brandLabels[brandKey],
    classificationLabel:
      brandKey === "mada"
        ? "خصم مباشر"
        : brandKey === "unknown"
          ? hasBin
            ? "غير محدد"
            : "—"
          : "غير محدد",
    isDetected: brandKey !== "unknown" || hasBin,
  };
};
