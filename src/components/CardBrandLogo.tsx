import { CardBrandKey } from "@/lib/cardMetadata";

const VisaLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 780 500" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M293.2 348.7l33.4-195.8h53.4l-33.4 195.8h-53.4zm246.8-191c-10.6-4-27.2-8.3-47.9-8.3-52.8 0-90 26.6-90.2 64.6-.3 28.1 26.5 43.8 46.8 53.2 20.8 9.6 27.8 15.8 27.7 24.4-.1 13.2-16.6 19.2-32 19.2-21.4 0-32.7-3-50.3-10.2l-6.9-3.1-7.5 43.8c12.5 5.5 35.6 10.2 59.6 10.5 56.2 0 92.6-26.3 93-66.8.2-22.3-14-39.2-44.8-53.2-18.6-9.1-30-15.1-29.9-24.3 0-8.1 9.6-16.8 30.4-16.8 17.4-.3 30 3.5 39.8 7.5l4.8 2.2 7.2-42.6zm137.8-4.8h-41.3c-12.8 0-22.4 3.5-28 16.3l-79.4 179.8h56.2s9.2-24.2 11.3-29.5h68.6c1.6 6.9 6.5 29.5 6.5 29.5h49.7l-43.6-196.1zm-65.8 126.5c4.4-11.3 21.4-54.8 21.4-54.8-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47 12.4 56.6h-44.5zM327.1 152.9l-52.5 133.6-5.6-27.2c-9.7-31.3-40-65.2-73.9-82.2l47.9 171.4 56.6-.1 84.2-195.5h-56.7z" fill="white"/>
    <path d="M178.9 152.9h-86.2l-.7 3.8c67.1 16.2 111.5 55.4 129.9 102.5l-18.7-90.2c-3.2-12.4-12.8-15.7-24.3-16.1z" fill="rgba(255,255,255,0.7)"/>
  </svg>
);

const MastercardLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 780 500" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="312" cy="250" r="150" fill="rgba(255,255,255,0.85)"/>
    <circle cx="468" cy="250" r="150" fill="rgba(255,255,255,0.5)"/>
  </svg>
);

const MadaLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 60" className={className} xmlns="http://www.w3.org/2000/svg">
    <text x="100" y="42" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="38" fill="white" letterSpacing="4">mada</text>
  </svg>
);

const AmexLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 780 500" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="390" y="280" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="100" fill="white" letterSpacing="2">AMEX</text>
  </svg>
);

const UnionPayLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 780 500" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="140" y="100" width="200" height="300" rx="20" fill="rgba(255,255,255,0.7)"/>
    <rect x="300" y="100" width="200" height="300" rx="20" fill="rgba(255,255,255,0.5)"/>
    <rect x="460" y="100" width="200" height="300" rx="20" fill="rgba(255,255,255,0.3)"/>
    <text x="390" y="290" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="60" fill="white">UnionPay</text>
  </svg>
);

const UnknownLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="white" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="4" width="22" height="16" rx="3" strokeOpacity="0.5"/>
    <line x1="1" y1="10" x2="23" y2="10" strokeOpacity="0.3"/>
  </svg>
);

const logoMap: Record<CardBrandKey, React.FC<{ className?: string }>> = {
  visa: VisaLogo,
  mastercard: MastercardLogo,
  mada: MadaLogo,
  amex: AmexLogo,
  unionpay: UnionPayLogo,
  unknown: UnknownLogo,
};

export default function CardBrandLogo({ brandKey, className = "w-14 h-9" }: { brandKey: CardBrandKey; className?: string }) {
  const Logo = logoMap[brandKey];
  return <Logo className={className} />;
}
