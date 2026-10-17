const crypto = require("crypto");
const asyncHandler = require("express-async-handler")
const Artists = require("../../artist/artist.model")
const Accounts = require("../../auth/model/account.model")
const InternalTeam = require("../../internalTeam/model/internalTeam.model")
const Roles = require("../../internalTeam/model/role.model")
const PasswordResetRequests = require("../model/PasswordResetRequests.model");
const hashPassword = require("../../../shared/utils/hashPassword")
const { generateJWT } = require("../../../shared/utils/JWT")
const comparePassword = require("../../../shared/utils/comparePassword")
const getAccount = require("../../../shared/getAccount")
const ACCOUNT = require("../../../shared/constants/account")
const { sendEmail } = require("../../../utils/sendEmail");
const validateObjectId = require("../../../utils/objectIdValidators");



const registerArtist = asyncHandler(async (req, res) => {

    // collect req data
    const { firstName, middleName, lastName, userName, email, phone, password } = req.body

    // check for empty fields
    if (!firstName || !lastName || !userName || !phone || !email || !password) {
        const error = new Error("Required fields missing")
        error.statusCode = 400
        throw error
    }

    const isEmailExist = await Accounts.findOne({ email })

    if (isEmailExist) {
        const error = new Error("Email already registered with another account")
        error.statusCode = 400
        throw error
    }

    const isPhoneExist = await Accounts.findOne({ phone })
    if (isPhoneExist) {
        const error = new Error("Phone number already registered with another account")
        error.statusCode = 400
        throw error
    }

    const isPasswordLengthValid = password.length >= 8
    if (!isPasswordLengthValid) {
        const error = new Error("Minimum password character required is 8")
        error.statusCode = 400
        throw error
    }

    // hash password
    const hashedPassword = await hashPassword(password)

    // create account
    const account = await Accounts.create({
        userName,
        email,
        phone,
        password: hashedPassword,
        accountType: ACCOUNT.TYPE.ARTIST,
    })
    if (!account) {
        const error = new Error("Internal server error occured creating artist")
        error.statusCode = 500
        throw error
    }

    // register artist
    const artist = await Artists.create({
        accountId: account._id,
        firstName,
        middleName,
        lastName,
    })

    if (!artist) {
        await Accounts.findByIdAndDelete(account._id)
        const error = new Error("Internal server error occured creating artist")
        error.statusCode = 500
        throw error
    }

    const payload = { accountId: account._id, accountType: account.accountType }
    const accessToken = generateJWT(payload, "accessToken")
    const refreshToken = generateJWT(payload, "refreshToken")

    return res.status(201).json({
        message: "Artist account created successfully",
        success: true,
        refreshToken,
        accessToken,
        data: {
            firstName: artist.firstName,
            middleName: artist.middleName,
            lastName: artist.lastName,
            userName: account.userName,
            email: account.email,
            isEmailConfirmed: artist.isEmailConfirmed,
            accountType: account.accountType,
            accountStatus: account.accountStatus
        }
    })

})

const createRole = asyncHandler(async (req, res) => {

    const name = req.body.name?.trim().toLowerCase();
    const description = req.body.description?.trim();

    if (!name || !description) {
        const error = new Error("Required fields missing")
        error.statusCode = 400
        throw error
    }

    const roleExists = await Roles.findOne({ name })
    if (roleExists) {
        const error = new Error("Role already exists")
        error.statusCode = 400
        throw error
    }

    const role = await Roles.create({
        name,
        description
    })

    if (!role) {
        const error = new Error("Internal server error occured creating role")
        error.statusCode = 500
        throw error
    }

    return res.status(201).json({
        message: "Role created successfully",
        success: true,
        data: role
    })
})

const getRoles = asyncHandler(async (req, res) => {
    const accountId = req.user.accountId
    await validateObjectId(accountId, Accounts, "Admin")

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { search, status } = req.query;

    const filter = {};

    if (search) {
        filter.role = {
            $regex: search,
            $options: "i"
        };
    }

    if (status) {
        filter.status = status;
    }

    const [roles, total] = await Promise.all([
        Roles.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Roles.countDocuments(filter)
    ]);

    return res.status(200).json({
        success: true,
        message: "Roles retrieved successfully.",
        data: roles,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1
        }
    });
})

const registerInternalTeam = asyncHandler(async (req, res) => {

    // only admin can register internal team, verify who's about to take this action
    const accountId = req.user.accountId

    const account = await InternalTeam.findOne({ accountId: accountId }).populate("roleId")
    if (!account) {
        const error = new Error("Account not found")
        error.statusCode = 404
        throw error
    }


    if (account.roleId.name !== ACCOUNT.ROLE.ADMIN.toLocaleLowerCase()) {
        const error = new Error("Action denied")
        error.statusCode = 403
        throw error
    }

    // collect req data
    const { firstName, middleName, lastName, userName, email, phone, password, roleId } = req.body

    // check for empty fields
    if (!firstName || !lastName || !userName || !phone || !email || !password || !roleId) {
        const error = new Error("Required fields missing")
        error.statusCode = 400
        throw error
    }

    const roleExists = await Roles.findById(roleId)
    if (!roleExists) {
        const error = new Error("Invalid role")
        error.statusCode = 400
        throw error
    }

    const isEmailExist = await Accounts.findOne({ email })
    if (isEmailExist) {
        const error = new Error("Email already registered with another account")
        error.statusCode = 400
        throw error
    }

    const isPhoneExist = await Accounts.findOne({ phone })
    if (isPhoneExist) {
        const error = new Error("Phone number already registered with another account")
        error.statusCode = 400
        throw error
    }

    const isPasswordLengthValid = password.length >= 8
    if (!isPasswordLengthValid) {
        const error = new Error("Minimum password character required is 8")
        error.statusCode = 400
        throw error
    }

    // hash password
    const hashedPassword = await hashPassword(password)

    // register
    const newAccount = await Accounts.create({
        email,
        phone,
        userName,
        password: hashedPassword,
        accountType: ACCOUNT.TYPE.INTERNAL_TEAM,
    })
    if (!newAccount) {
        const error = new Error("Something went wrong creating account")
        error.statusCode = 500
        throw error
    }

    const internalTeamAccount = await InternalTeam.create({
        accountId: newAccount._id,
        firstName,
        middleName,
        lastName,
        roleId
    })

    if (!internalTeamAccount) {
        await Accounts.findByIdAndDelete(newAccount._id)
        const error = new Error("Something went wrong creating account")
        error.statusCode = 500
        throw error
    }

    return res.status(201).json({
        message: "Internal team account created successfully",
        success: true,
        data: {
            firstName: internalTeamAccount.firstName,
            middleName: internalTeamAccount.middleName,
            lastName: internalTeamAccount.lastName,
            email: newAccount.email,
            isEmailConfirmed: internalTeamAccount.isEmailConfirmed,
            accountType: newAccount.accountType,
            accountStatus: newAccount.accountStatus,
            roleId: internalTeamAccount.roleId
        }
    })

})

const login = asyncHandler(async (req, res) => {

    // collect data from req body
    const email = req.body.email?.trim();
    const phone = req.body.phone?.trim();
    const password = req.body.password;

    // check for empty fields
    if ((!email && !phone) || !password) {
        const error = new Error("Required fields missing")
        error.statusCode = 400
        throw error
    }

    // validate data
    let account
    if (email) {
        account = await Accounts.findOne({ email })
            .select("+password")
    }
    else {
        account = await Accounts.findOne({ phone })
            .select("+password")
    }


    if (!account) {
        const error = new Error("Invalid credentials")
        error.statusCode = 401
        throw error
    }


    // compare password
    if ((account.email == email || account.phone == phone) && (await comparePassword(password, account.password))) {

        // reject login if account is closed
        if (account.accountStatus === ACCOUNT.STATUS.CLOSED) {
            const error = new Error("Account is closed")
            error.statusCode = 403
            throw error
        }

        // generate tokens
        const payload = { accountId: account._id, accountType: account.accountType, role: account?.roleId }
        const accessToken = generateJWT(payload, "accessToken")
        const refreshToken = generateJWT(payload, "refreshToken")

        // retrieve account data
        const retrievedAccount = await getAccount(account._id, account.accountType)
        if (!retrievedAccount) {
            const error = new Error("Something went wrong")
            error.statusCode = 500
            throw error
        }

        return res.status(200).json({
            message: "Login successful", success: true, refreshToken, accessToken, data: {
                firstName: retrievedAccount.firstName,
                middleName: retrievedAccount.middleName,
                lastName: retrievedAccount.lastName,
                email: account.email,
                isEmailConfirmed: retrievedAccount.isEmailConfirmed,
                accountType: account.accountType,
                accountStatus: account.accountStatus,
                role: account.accountType === ACCOUNT.TYPE.INTERNAL_TEAM ? retrievedAccount.role : ""
            }
        })
    }


    const error = new Error("Invalid login credentials")
    error.statusCode = 400
    throw error

})

const profile = asyncHandler(async (req, res) => {

    const accountId = req.user.accountId

    const account = await Accounts.findById(accountId)
    if (!account) {
        const error = new Error("Account not found")
        error.status = 404
        throw error
    }

    // retrieve account data
    const retrievedAccount = await getAccount(account._id, account.accountType)
    if (!retrievedAccount) {
        const error = new Error("Something went wrong")
        error.statusCode = 500
        throw error
    }

    return res.status(200).json({
        message: "Account retrieved", success: true, data: {
            firstName: retrievedAccount.firstName,
            middleName: retrievedAccount.middleName,
            lastName: retrievedAccount.lastName,
            email: account.email,
            emailVerified: retrievedAccount.isEmailConfirmed,
            emailConfirmedAt: retrievedAccount.emailConfirmedAt,
            accountType: account.accountType,
            accountStatus: account.accountStatus,
            ...(account.accountType === ACCOUNT.TYPE.INTERNAL_TEAM && { role: retrievedAccount.role })
        }
    })

})

const logout = asyncHandler(async (req, res) => {

    // 1. Extract refreshToken or accessToken from request headers or body.
    const authHeader = req.headers.authorization || req.headers.Authorization
    const tokenFromHeader = authHeader && typeof authHeader === 'string' ? (authHeader.split(' ')[1] || null) : null
    const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'] || tokenFromHeader

    // 2. Validate token format and ensure the token exists.
    if (!refreshToken) {
        const error = new Error('Required fields missing')
        error.statusCode = 400
        throw error
    }

    // Basic JWT format validation: three dot-separated parts
    const isJwtLike = typeof refreshToken === 'string' && refreshToken.split('.').length === 3
    if (!isJwtLike) {
        const error = new Error('Invalid token format')
        error.statusCode = 400
        throw error
    }

    // 3. If using refresh token persistence, remove or revoke the token in the database/store.
    // 4. Optionally add the access token to a denylist until it expires.
    // Simple in-memory denylist. Note: this will be cleared when the process restarts.
    if (!global.__TOKEN_DENYLIST__) global.__TOKEN_DENYLIST__ = new Set()
    global.__TOKEN_DENYLIST__.add(refreshToken)

    return res.status(200).json({ message: 'Logged out successfully', success: true })

})

const requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const account = await Accounts.findOne({ email });

    // Always return same response to prevent email enumeration
    if (!account) {
        return res.status(200).json({
            success: true,
            message: "If an account exists with this email, an OTP has been sent."
        });
    }

    // Fans cannot reset password
    if (account.accountType === ACCOUNT.TYPE.FAN) {
        return res.status(200).json({
            success: true,
            message: "If an account exists with this email, an OTP has been sent."
        });
    }

    // Invalidate previous requests
    await PasswordResetRequests.updateMany(
        {
            accountId: account._id,
            used: false
        },
        {
            used: true
        }
    );

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP
    const otpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    // Save request
    await PasswordResetRequests.create({
        accountId: account._id,
        otp: otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    // Send email
    const to = account.email
    const subject = "Password Reset OTP"
    const text = `<h2>Your OTP is ${otp}. It expires in 10 minutes.</b></h2>`
    await sendEmail(to, subject, html)

    return res.status(200).json({
        success: true,
        message: "If an account exists with this email, an OTP has been sent."
    });
});




module.exports = { registerArtist, createRole, getRoles, registerInternalTeam, login, profile, logout, requestPasswordReset }