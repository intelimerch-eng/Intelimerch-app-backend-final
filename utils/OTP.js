
const { randomInt, createHash, timingSafeEqual } = require("crypto");
const OTP = require("../modules/OTP/otp.model");

const hashOTP = (otp) =>
    createHash("sha256").update(otp).digest("hex");

const saveOTPToDB = async (email, otp, expiresAt) => {
    const normalizedEmail = email.trim().toLowerCase();
    const hashedOTP = hashOTP(otp);

    return OTP.findOneAndUpdate(
        { email: normalizedEmail },
        {
            email: normalizedEmail,
            otp: hashedOTP,
            expiresAt,
        },
        {
            upsert: true,
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        }
    );
};

const generateOTP = async (email, length = 6) => {
    if (!email || typeof email !== "string") {
        const error = new Error("A valid email is required");
        error.statusCode = 400;
        throw error;
    }

    if (![4, 6, 8].includes(length)) {
        const error = new Error("OTP length must be 4, 6, or 8 digits");
        error.statusCode = 500;
        throw error;
    }

    const otp = randomInt(0, 10 ** length)
        .toString()
        .padStart(length, "0");

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await saveOTPToDB(email, otp, expiresAt);

    return { otp, expiresAt };
};


const verifyOTP = async (email, otp) => {
    if (!email || typeof email !== "string" ||
        typeof otp !== "string") {
        const error = new Error("Email and OTP are required");
        error.statusCode = 400;
        throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const otpRecord = await OTP.findOne({
        email: normalizedEmail,
    });

    if (!otpRecord) {
        const error = new Error("Invalid or expired OTP");
        error.statusCode = 400;
        throw error;
    }

    if (otpRecord.expiresAt.getTime() <= Date.now()) {
        await OTP.deleteOne({ _id: otpRecord._id });
        const error = new Error("Invalid or expired OTP");
        error.statusCode = 400;
        throw error;
    }

    const storedHash = Buffer.from(otpRecord.otp, "hex");
    const submittedHash = Buffer.from(hashOTP(otp), "hex");

    if (
        storedHash.length !== submittedHash.length ||
        !timingSafeEqual(storedHash, submittedHash)
    ) {
        const error = new Error("Invalid or expired OTP");
        error.statusCode = 400;
        throw error;
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    return {
        verified: true,
        message: "OTP verified successfully",
    };
};



module.exports = {
    generateOTP,
    saveOTPToDB,
    verifyOTP
};
