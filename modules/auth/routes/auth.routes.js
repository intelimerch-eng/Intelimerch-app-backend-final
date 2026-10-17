const express = require("express")
const router = express.Router()
const auth = require("../../../middleware/auth.middleware")
const { registerArtist, login, createRole, getRoles, registerInternalTeam, profile, logout, requestPasswordReset } = require("../controllers/auth.controller")
const validate = require("../../../middleware/validate")
const { forgotPasswordSchema } = require("../../../validators/forgotPasswordSchema.validator")

/**
 * @swagger
 * /auth/register-artist:
 *   post:
 *     summary: 
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - userName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               middleName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Artist registered successfully
 *       400:
 *         description: |
 *           Possible errors:
 *           - Required fields missing
 *           - Email already exists
 *           - Phone already exists
 *           - Password must be at least 8 characters
 *       500:
 *         descripton: Internal server error occured creating artist
 */

//register
router.post("/register-artist", registerArtist)

/**
 * @swagger
 * /auth/register-internal-team:
 *   post:
 *     summary: 
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - userName
 *               - roleId
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               middleName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               roleId:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Internal team account created successfully
 *       400:
 *         description: |
 *           Possible errors:
 *           - Required fields missing
 *           - Email already exists
 *           - Phone already exists
 *           - Password must be at least 8 characters
 *       500:
 *         descripton: Something went wrong creating account
 */

//register
router.post("/register-internal-team", auth, registerInternalTeam)

/**
 * @swagger
 * /auth/create-role:
 *   post:
 *     summary: 
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: role created successfully
 *       400:
 *         description: |
 *           Possible errors:
 *           - Required fields missing
 *           - Email already exists
 *           - Phone already exists
 *           - Password must be at least 8 characters
 *       500:
 *         descripton: Internal server error occured creating role
 */

//create role
router.post("/create-role", auth, createRole)

/**
 * @swagger
 * /auth/get-roles:
 *   get:
 *     summary: Retrieve roles
 *     description: Retrieves a paginated list of roles with optional search and status filters.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number.
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 20
 *         description: Number of roles to return per page.
 *
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search roles by role name.
 *
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           example: active
 *         description: Filter roles by status.
 *
 *     responses:
 *       200:
 *         description: Roles retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Roles retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 68a123456789abcdef123456
 *                       role:
 *                         type: string
 *                         example: Administrator
 *                       status:
 *                         type: string
 *                         example: active
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-08-17T08:30:00.000Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-08-17T08:30:00.000Z
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPreviousPage:
 *                       type: boolean
 *                       example: false
 *
 *       401:
 *         description: Unauthorized. Authentication is required.
 *
 *       500:
 *         description: Internal server error.
 */
//get roles
router.get("/get-roles", auth, getRoles)


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary:
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *             oneOf:
 *               - required:
 *                 - email
 *               - required:
 *                 - phone
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Required fields missing
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account is closed
 *       500:
 *         description: something went wrong
 */

//login
router.post("/login", login)  //login for both artist and internal team.

/**
 * @swagger
 * /auth/me/profile:
 *   get:
 *     summary:
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account retrieved
 *       404:
 *         description: Account not found
 *       500:
 *         description: Something went wrong
 */
// Profile
router.get("/me/profile", auth, profile)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: 
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       400:
 *         description: |
 *           Possible errors:
 *           - Required fields missing
 *           - Invalid token format
 */

// artistProfile
router.post("/logout", logout)

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     description: |
 *       Initiates the password reset process for Artists and Internal Team accounts.
 *
 *       If the supplied email belongs to a valid account, a 6-digit OTP is
 *       generated and sent to the registered email address.
 *
 *       For security reasons, the API always returns the same response even if
 *       the email does not exist.
 *
 *     tags:
 *       - Auth
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "artist@example.com"
 *
 *     responses:
 *       200:
 *         description: Password reset request processed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: "If an account exists with this email, an OTP has been sent."
 *
 *       400:
 *         description: Validation failed.
 *
 *       500:
 *         description: Internal server error.
 */
router.post(
    "/forgot-password",
    validate(forgotPasswordSchema),
    requestPasswordReset
);



module.exports = router