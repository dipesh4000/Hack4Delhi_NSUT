const express = require('express');
const router = express.Router();
const { CitizenUser, AuthorityUser } = require('../models/User');

/**
 * Save Citizen User Data
 * POST /api/users/citizen
 * Called from frontend after Clerk signup for citizen
 */
router.post('/citizen', async (req, res) => {
  try {
    const {
      clerkId,
      email,
      firstName,
      lastName,
      fullName,
      profileImage,
    } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({
        success: false,
        message: 'clerkId and email are required',
      });
    }

    // Check if user already exists
    let citizenUser = await CitizenUser.findOne({ clerkId });

    if (citizenUser) {
      // Update existing user
      citizenUser.email = email;
      citizenUser.firstName = firstName;
      citizenUser.lastName = lastName;
      citizenUser.fullName = fullName;
      citizenUser.profileImage = profileImage;
      await citizenUser.save();
    } else {
      // Create new user
      citizenUser = new CitizenUser({
        clerkId,
        email,
        firstName,
        lastName,
        fullName,
        profileImage,
        role: 'citizen',
      });
      await citizenUser.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Citizen user saved successfully',
      data: citizenUser,
    });
  } catch (error) {
    console.error('Error saving citizen user:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to save citizen user',
    });
  }
});

/**
 * Save Authority User Data
 * POST /api/users/authority
 * Called from frontend after Clerk signup for authority
 */
router.post('/authority', async (req, res) => {
  try {
    const {
      clerkId,
      email,
      firstName,
      lastName,
      fullName,
      wardId,
      wardName,
      departmentName,
      designation,
      phoneNumber,
      officeAddress,
      profileImage,
    } = req.body;

    if (!clerkId || !email || !wardId) {
      return res.status(400).json({
        success: false,
        message: 'clerkId, email, and wardId are required',
      });
    }

    // Check if user already exists
    let authorityUser = await AuthorityUser.findOne({ clerkId });

    if (authorityUser) {
      // Update existing user
      authorityUser.email = email;
      authorityUser.firstName = firstName;
      authorityUser.lastName = lastName;
      authorityUser.fullName = fullName;
      authorityUser.wardId = wardId;
      authorityUser.wardName = wardName;
      authorityUser.departmentName = departmentName;
      authorityUser.designation = designation;
      authorityUser.phoneNumber = phoneNumber;
      authorityUser.officeAddress = officeAddress;
      authorityUser.profileImage = profileImage;
      await authorityUser.save();
    } else {
      // Create new user
      authorityUser = new AuthorityUser({
        clerkId,
        email,
        firstName,
        lastName,
        fullName,
        wardId,
        wardName,
        departmentName,
        designation,
        phoneNumber,
        officeAddress,
        profileImage,
        role: 'authority',
      });
      await authorityUser.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Authority user saved successfully',
      data: authorityUser,
    });
  } catch (error) {
    console.error('Error saving authority user:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to save authority user',
    });
  }
});

/**
 * Get Citizen User by Clerk ID
 * GET /api/users/citizen/:clerkId
 */
router.get('/citizen/:clerkId', async (req, res) => {
  try {
    const citizenUser = await CitizenUser.findOne({ clerkId: req.params.clerkId });

    if (!citizenUser) {
      return res.status(404).json({
        success: false,
        message: 'Citizen user not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: citizenUser,
    });
  } catch (error) {
    console.error('Error getting citizen user:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get citizen user',
    });
  }
});

/**
 * Get Authority User by Clerk ID
 * GET /api/users/authority/:clerkId
 */
router.get('/authority/:clerkId', async (req, res) => {
  try {
    const authorityUser = await AuthorityUser.findOne({ clerkId: req.params.clerkId });

    if (!authorityUser) {
      return res.status(404).json({
        success: false,
        message: 'Authority user not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: authorityUser,
    });
  } catch (error) {
    console.error('Error getting authority user:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get authority user',
    });
  }
});

/**
 * Get Authority Users by Ward ID
 * GET /api/users/authority/ward/:wardId
 */
router.get('/authority/ward/:wardId', async (req, res) => {
  try {
    const authorityUsers = await AuthorityUser.find({ wardId: parseInt(req.params.wardId) });

    return res.status(200).json({
      success: true,
      data: authorityUsers,
    });
  } catch (error) {
    console.error('Error getting authority users by ward:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get authority users',
    });
  }
});

/**
 * Update User Metadata (last login, etc.)
 * PATCH /api/users/:role/:clerkId
 */
router.patch('/:role/:clerkId', async (req, res) => {
  try {
    const { role, clerkId } = req.params;
    const updates = req.body;

    let User = role === 'citizen' ? CitizenUser : AuthorityUser;
    const user = await User.findOneAndUpdate(
      { clerkId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `${role} user not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user',
    });
  }
});

module.exports = router;
