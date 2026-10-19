
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
        throw new Error("A valid email is required");
    }

    if (![4, 6, 8].includes(length)) {
        throw new Error("OTP length must be 4, 6, or 8 digits");
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
        throw new Error("Email and OTP are required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const otpRecord = await OTP.findOne({
        email: normalizedEmail,
    });

    if (!otpRecord) {
        throw new Error("Invalid or expired OTP");
    }

    if (otpRecord.expiresAt.getTime() <= Date.now()) {
        await OTP.deleteOne({ _id: otpRecord._id });
        throw new Error("Invalid or expired OTP");
    }

    const storedHash = Buffer.from(otpRecord.otp, "hex");
    const submittedHash = Buffer.from(hashOTP(otp), "hex");

    if (
        storedHash.length !== submittedHash.length ||
        !timingSafeEqual(storedHash, submittedHash)
    ) {
        throw new Error("Invalid or expired OTP");
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
