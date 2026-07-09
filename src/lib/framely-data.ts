import { Cake, Heart, Building2, Shirt, Sparkles, Home, HandHeart, Gift,
            Upload, Eye, Palette, PenLine, Truck, Smartphone, Save,
            Lock, MessageCircle, type LucideIcon } from "lucide-react";
import frame from "@/assets/product-frame.jpg";
import mug from "@/assets/product-mug.jpg";
import polaroid from "@/assets/product-polaroid.jpg";
import tote from "@/assets/product-tote.jpg";
import tshirt from "@/assets/product-tshirt.jpg";
import memorybook from "@/assets/product-memorybook.jpg";
import photostrip from "@/assets/product-photostrip.jpg";
import giftbox from "@/assets/product-giftbox.jpg";

export const WHATSAPP_NUMBER = "919876543210"; // +91 98765 43210
export const BRAND_INSTAGRAM = "https://instagram.com/framely.in";
export const BRAND_LOCATION = "Tirupati, Andhra Pradesh";

export type PrintArea = { x: number; y: number; w: number; h: number }; // % of canvas
export type PhysicalSize = { w: number; h: number; unit: "in" | "cm" };

export type FramelyProduct = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  price: string;
  badge?: string;
  category: "frames" | "prints" | "apparel" | "accessories" | "books" | "gifting";
  printArea: PrintArea;
  physicalSize: PhysicalSize;
  colors?: { id: string; label: string; hex: string }[];
};

export const PRODUCTS: FramelyProduct[] = [
  { id: "wood-frame", name: "Custom Wood Frame", tagline: "A timeless way to display the moment", description: "Hand-finished wooden frame printed with your favorite memory.", image: frame, price: "₹499", badge: "Best Seller", category: "frames", printArea: { x: 12, y: 12, w: 76, h: 76 }, physicalSize: { w: 8, h: 10, unit: "in" } },
  { id: "photo-mug", name: "Personalized Mug", tagline: "Your story, sip after sip", description: "Premium ceramic mug printed with your photo and a personal message.", image: mug, price: "₹299", badge: "Trending", category: "accessories", printArea: { x: 22, y: 30, w: 56, h: 36 }, physicalSize: { w: 8.5, h: 3.5, unit: "in" }, colors: [{ id: "white", label: "White", hex: "#ffffff" }, { id: "black", label: "Black", hex: "#1f1f1f" }] },
  { id: "polaroid", name: "Polaroid Prints (Set of 12)", tagline: "Tiny moments, big feelings", description: "Aesthetic polaroid-style prints on premium matte paper.", image: polaroid, price: "₹349", badge: "Instagram Pick", category: "prints", printArea: { x: 14, y: 14, w: 72, h: 72 }, physicalSize: { w: 3.5, h: 4.2, unit: "in" } },
  { id: "tote", name: "Printed Tote Bag", tagline: "Carry your memories everywhere", description: "Natural cotton tote, printed with your custom design.", image: tote, price: "₹449", category: "apparel", printArea: { x: 28, y: 25, w: 44, h: 50 }, physicalSize: { w: 12, h: 14, unit: "in" }, colors: [{ id: "natural", label: "Natural", hex: "#e8dcc2" }, { id: "black", label: "Black", hex: "#202020" }] },
  { id: "tshirt", name: "Custom T-Shirt", tagline: "Wear the moment", description: "Soft cotton tee with photo or quote printing.", image: tshirt, price: "₹599", category: "apparel", printArea: { x: 32, y: 26, w: 36, h: 44 }, physicalSize: { w: 11, h: 14, unit: "in" }, colors: [{ id: "white", label: "White", hex: "#ffffff" }, { id: "black", label: "Black", hex: "#161616" }, { id: "sand", label: "Sand", hex: "#d8c8a8" }] },
  { id: "memory-book", name: "Memory Book", tagline: "A keepsake you can flip through forever", description: "Hardcover memory book personalized with your photos and notes.", image: memorybook, price: "₹899", badge: "Perfect Gift", category: "books", printArea: { x: 18, y: 18, w: 64, h: 64 }, physicalSize: { w: 8, h: 8, unit: "in" } },
  { id: "photo-strip", name: "Photo Strip", tagline: "The classic four-shot keepsake", description: "Vertical photo strips, premium printed and ready to gift.", image: photostrip, price: "₹199", category: "prints", printArea: { x: 28, y: 8, w: 44, h: 84 }, physicalSize: { w: 2, h: 8, unit: "in" } },
  { id: "gift-box", name: "Personalized Gift Box", tagline: "A surprise wrapped with care", description: "Curated gift box with your chosen keepsakes and a handwritten note.", image: giftbox, price: "₹1,199", badge: "For Couples", category: "gifting", printArea: { x: 20, y: 22, w: 60, h: 56 }, physicalSize: { w: 9, h: 7, unit: "in" } },
];

export type FramelyOccasion = { id: string; label: string; subtitle: string; icon: LucideIcon; gradient: string };

export const OCCASIONS: FramelyOccasion[] = [
     { id: "birthday", label: "Birthday", subtitle: "Make their day unforgettable", icon: Cake, gradient: "from-rose/40 to-beige" },
     { id: "anniversary", label: "Anniversary", subtitle: "Celebrate years of love", icon: Heart, gradient: "from-accent/25 to-beige" },
     { id: "corporate", label: "Corporate Events", subtitle: "Branded gifts that wow", icon: Building2, gradient: "from-charcoal/15 to-beige" },
     { id: "team", label: "Team Outings", subtitle: "Custom merch for the crew", icon: Shirt, gradient: "from-rose/30 to-beige" },
     { id: "festivals", label: "Festivals", subtitle: "Diwali, Rakhi & more", icon: Sparkles, gradient: "from-accent/30 to-beige" },
     { id: "family", label: "Family Events", subtitle: "Frame the people you love", icon: Home, gradient: "from-beige to-card" },
     { id: "friends", label: "Friends Reunion", subtitle: "Throwbacks worth keeping", icon: HandHeart, gradient: "from-rose/25 to-beige" },
     { id: "custom", label: "Custom Occasion", subtitle: "Tell us your moment", icon: Gift, gradient: "from-accent/20 to-beige" },
   ];

export const REASONS = [
     { icon: Upload, title: "Easy photo upload", copy: "Drop your photos straight from your phone." },
     { icon: Eye, title: "Live preview", copy: "See exactly how it will look before you order." },
     { icon: Palette, title: "Aesthetic templates", copy: "Curated layouts crafted by designers." },
     { icon: PenLine, title: "Fully personalized", copy: "Add names, dates, quotes and inside jokes." },
     { icon: Sparkles, title: "Premium printing", copy: "Rich colors, sharp detail, beautiful finishes." },
     { icon: Truck, title: "Fast & simple ordering", copy: "Order on WhatsApp in under a minute." },
     { icon: Smartphone, title: "Mobile-friendly", copy: "Designed to be customized from your phone." },
     { icon: Save, title: "Save designs", copy: "Sign in to save designs and edit anytime." },
   ];
export const AUDIENCES = [
  { label: "Students & Young Adults", copy: "Trendy polaroids, photo strips, custom merch." },
  { label: "Couples", copy: "Romantic frames, mugs and memory books." },
  { label: "Families", copy: "Albums, wall frames and festival gifts." },
  { label: "Event Organizers", copy: "Bulk T-shirts, souvenirs and return gifts." },
  { label: "Gift Buyers", copy: "Unique, thoughtful personalized gifts." },
  { label: "Instagram Lovers", copy: "Aesthetic, shareable photo products." },
];

export const TESTIMONIALS = [
  { quote: "Framely made my anniversary gift feel so personal and beautiful. The frame quality was incredible.", name: "Anjali R.", role: "Tirupati" },
  { quote: "The polaroid prints looked aesthetic and premium — my whole hostel wants a set now.", name: "Sneha K.", role: "Student, SVU" },
  { quote: "Loved the live preview before ordering. Zero surprises, just exactly what I designed.", name: "Vikram P.", role: "Bengaluru" },
];

export const FAQS = [
  { q: "How long does an order take?", a: "Most personalized orders are crafted and shipped within 3–5 business days. Bulk and event orders may take 7–10 days." },
  { q: "What photo quality should I upload?", a: "We recommend high-resolution photos (at least 1500 px on the longest side). Our team reviews every photo and reaches out if anything looks off." },
  { q: "Can I order in bulk for events or corporate gifting?", a: "Absolutely. Message us on WhatsApp with your quantity and timeline — we offer special pricing for 20+ pieces." },
  { q: "Is my photo safe with Framely?", a: "Yes. Photos are used only to fulfil your order and are never shared. Saved designs are private to your account." },
  { q: "Do you ship across India?", a: "We ship anywhere in India with tracked delivery. Local Tirupati orders can also be picked up from the studio." },
  { q: "What if I'm not happy with my order?", a: "Quality is guaranteed. If anything arrives damaged or misprinted, we re-print it for free — just send us a photo on WhatsApp." },
];

export const TRUST_BADGES = [
     { icon: Lock, title: "Secure Payments", copy: "UPI, cards & WhatsApp checkout." },
     { icon: Truck, title: "Fast Delivery", copy: "Shipped in 3–5 business days." },
     { icon: Sparkles, title: "Quality Guarantee", copy: "Re-print on any defect, free." },
     { icon: MessageCircle, title: "Real Support", copy: "Chat with a human on WhatsApp." },
   ];

export function whatsappOrderUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
