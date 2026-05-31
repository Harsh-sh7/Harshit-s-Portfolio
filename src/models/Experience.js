import mongoose from 'mongoose';

delete mongoose.models.Experience;

const ExperienceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title.'],
    },
    company: {
      type: String,
      required: [true, 'Please provide a company.'],
    },
    location: {
      type: String,
    },
    date: {
      type: String,
      required: [true, 'Please provide date.'],
    },
    description: {
      type: String,
    },
    bullets: {
      type: [String],
      default: [],
    },
    logo: {
      type: String,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Experience || mongoose.model('Experience', ExperienceSchema);
