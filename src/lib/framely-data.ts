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

export type FramelyProduct = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  price: string;
  badge?: string;
  category: "frames" | "prints" | "apparel" | "accessories" | "books" | "gifting";
};

export const PRODUCTS: FramelyProduct[] = [
  { id: "wood-frame", name: "Custom Wood Frame", tagline: "A timeless way to display the moment", description: "Hand-finished wooden frame printed with your favorite memory.", image: frame, price: "₹499", badge: "Best Seller", category: "frames" },
  { id: "photo-mug", name: "Personalized Mug", tagline: "Your story, sip after sip", description: "Premium ceramic mug printed with your photo and a personal message.", image: mug, price: "₹299", badge: "Trending", category: "accessories" },
  { id: "polaroid", name: "Polaroid Prints (Set of 12)", tagline: "Tiny moments, big feelings", description: "Aesthetic polaroid-style prints on premium matte paper.", image: polaroid, price: "₹349", badge: "Instagram Pick", category: "prints" },
  { id: "tote", name: "Printed Tote Bag", tagline: "Carry your memories everywhere", description: "Natural cotton tote, printed with your custom design.", image: tote, price: "₹449", category: "apparel" },
  { id: "tshirt", name: "Custom T-Shirt", tagline: "Wear the moment", description: "Soft cotton tee with photo or quote printing.", image: tshirt, price: "₹599", category: "apparel" },
  { id: "memory-book", name: "Memory Book", tagline: "A keepsake you can flip through forever", description: "Hardcover memory book personalized with your photos and notes.", image: memorybook, price: "₹899", badge: "Perfect Gift", category: "books" },
  { id: "photo-strip", name: "Photo Strip", tagline: "The classic four-shot keepsake", description: "Vertical photo strips, premium printed and ready to gift.", image: photostrip, price: "₹199", category: "prints" },
  { id: "gift-box", name: "Personalized Gift Box", tagline: "A surprise wrapped with care", description: "Curated gift box with your chosen keepsakes and a handwritten note.", image: giftbox, price: "₹1,199", badge: "For Couples", category: "gifting" },
];

export const OCCASIONS = [
  { label: "Birthdays", icon: "🎂", copy: "Surprises that feel personal." },
  { label: "Anniversaries", icon: "💍", copy: "Mark the year with a memory." },
  { label: "Valentine's Day", icon: "💝", copy: "Romantic gifts, made with love." },
  { label: "Friendship Gifts", icon: "🤍", copy: "Tiny tokens for the closest ones." },
  { label: "Festival Gifts", icon: "✨", copy: "Diwali, Raksha Bandhan and more." },
  { label: "Family Memories", icon: "🏡", copy: "Capture your favorite people." },
  { label: "College Memories", icon: "🎓", copy: "Polaroids and posters for the dorm." },
  { label: "Bulk & Events", icon: "🎁", copy: "Wedding favors, return gifts, more." },
];

export const REASONS = [
  { icon: "📤", title: "Easy photo upload", copy: "Drop your photos straight from your phone." },
  { icon: "👀", title: "Live preview", copy: "See exactly how it will look before you order." },
  { icon: "🎨", title: "Aesthetic templates", copy: "Curated layouts crafted by designers." },
  { icon: "✍️", title: "Fully personalized", copy: "Add names, dates, quotes and inside jokes." },
  { icon: "✨", title: "Premium printing", copy: "Rich colors, sharp detail, beautiful finishes." },
  { icon: "🚚", title: "Fast & simple ordering", copy: "Order on WhatsApp in under a minute." },
  { icon: "📱", title: "Mobile-friendly", copy: "Designed to be customized from your phone." },
  { icon: "💾", title: "Save designs", copy: "Sign in to save designs and edit anytime." },
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

export function whatsappOrderUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
