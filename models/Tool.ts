import mongoose from 'mongoose';

const ToolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this tool.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description.'],
  },
  url: {
    type: String,
    // URL is optional if linkedPage is present. Logic handled in validation or application layer.
  },
  linkedPage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomPage',
  },
  loginMethod: {
    type: String,
    enum: ['none', 'cookies', 'localstorage', 'indexeddb'],
    default: 'none',
  },
  loginData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  icon: {
    type: String,
    // Store URL or icon name
  },
  category: {
    type: String,
    required: [true, 'Please provide a category.'],
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive', 'down', 'stock_out'],
    default: 'active',
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
  available_slots: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    default: 0,
  },
  interval: {
    type: String,
    enum: ['monthly', 'yearly', 'lifetime'],
    default: 'monthly',
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
  },
  max_slots: {
    type: Number,
    default: 0,
  },
  maintenance_message: {
    type: String,
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Fix for Next.js hot reload: ensure new fields are added to cached model
if (mongoose.models.Tool) {
    const schema = mongoose.models.Tool.schema;
    if (!schema.path('price')) {
        schema.add({ 
            price: { type: Number, default: 0 },
            interval: { type: String, enum: ['monthly', 'yearly', 'lifetime'], default: 'monthly' },
            packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' }
        });
        console.log("Hot-patched Tool schema with new fields");
    }
    if (!schema.path('loginMethod')) {
        schema.add({
            loginMethod: { type: String, enum: ['none', 'cookies', 'localstorage', 'indexeddb'], default: 'none' },
            loginData: { type: mongoose.Schema.Types.Mixed, default: null }
        });
    }
}

export default mongoose.models.Tool || mongoose.model('Tool', ToolSchema);
