const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // password required only for email signup
      },
      minlength: 6,
    },
    resetPasswordOTP: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt automatically
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Static method to find user by email and password
userSchema.statics.findByEmailAndPassword = async function (email, password) {
  const user = await this.findOne({ email });
  if (
    user &&
    user.password &&
    (await bcrypt.compare(password, user.password))
  ) {
    return user;
  }
  return null;
};

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate and save OTP for password reset
userSchema.methods.generateResetOTP = function () {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.resetPasswordOTP = otp;
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return otp;
};

// Method to verify OTP
userSchema.methods.verifyResetOTP = function (otp) {
  return (
    this.resetPasswordOTP === otp && this.resetPasswordExpires > Date.now()
  );
};

module.exports = mongoose.model("User", userSchema);
