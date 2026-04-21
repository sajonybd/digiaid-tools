import mongoose from 'mongoose';

const PackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a package name.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price.'],
  },
  interval: {
    type: String,
    enum: ['monthly', 'yearly', 'lifetime'],
    default: 'monthly',
  },
  description: {
    type: String,
    default: "",
  },
  features: {
    type: [String],
    default: [],
  },
  tools: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tool',
  }],
  isTrial: {
    type: Boolean,
    default: false,
  },
  trialDurationDays: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
  is_featured: {
    type: Boolean,
    default: false,
  },
  stripePriceId: {
    type: String,
    required: false,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

if (mongoose.models.Package) {
  const schema = mongoose.models.Package.schema;

  if (!schema.path('description')) {
    schema.add({
      description: { type: String, default: "" },
    });
  }

  if (!schema.path('sortOrder')) {
    schema.add({
      sortOrder: { type: Number, default: 0 },
    });
  }
}

export default mongoose.models.Package || mongoose.model('Package', PackageSchema);
