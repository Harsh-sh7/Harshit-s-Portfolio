import mongoose from 'mongoose';

delete mongoose.models.Project;

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for this project.'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description.'],
    },
    tech: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    github: {
      type: String,
    },
    link: {
      type: String,
    },
    image: {
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
    caseStudy: {
      subtitle: { type: String, default: "" },
      likes: { type: Number, default: 0 },
      blocks: { type: Array, default: [] }
    },
  },
  { timestamps: true, strict: false }
);

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
