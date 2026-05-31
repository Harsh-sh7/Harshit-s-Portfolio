import mongoose from 'mongoose';

const TechSchema = new mongoose.Schema({
  name: String,
  icon: String,
  invertDark: Boolean
});

const ShowcaseItemSchema = new mongoose.Schema({
  title: String, // Or name for logos
  description: String,
  image: String, // Main image
  logoUrl: String, // For logos
  github: String,
  link: String,
  tech: [TechSchema],
  invertDark: Boolean // For logos
});

const ShowcaseSchema = new mongoose.Schema({
  category: { type: String, required: true },
  order: { type: Number, default: 0 },
  layoutType: { type: String, default: 'card' }, // 'card' or 'grid'
  items: [ShowcaseItemSchema]
}, { timestamps: true });

if (process.env.NODE_ENV === 'development' && mongoose.models.Showcase) {
  delete mongoose.models.Showcase;
}

export default mongoose.models.Showcase || mongoose.model('Showcase', ShowcaseSchema);
